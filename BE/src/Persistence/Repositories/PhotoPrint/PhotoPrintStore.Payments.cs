namespace OnePortal.Persistence.Repositories.PhotoPrint;

using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.PhotoPrint.Payments;
using OnePortal.Domain.Entities.PhotoPrint;

public sealed partial class PhotoPrintStore
{
    private const decimal MaximumVietQrAmount = 9_999_999_999_999m;
    private static readonly IReadOnlyDictionary<string, string> VietQrBanks = new Dictionary<string, string>
    {
        ["VCB"] = "Vietcombank",
        ["MB"] = "MB Bank",
        ["TCB"] = "Techcombank",
    };

    #region Commands
    public async Task<Result<object>> CreateVietQrPaymentAsync(ConfirmVietQrPaymentInput input, CancellationToken cancellationToken)
    {
        var phone = Phone(input.CustomerPhone);
        if (phone is null || !Required(input.OrderCode, 40) || input.Amount is <= 0 or > MaximumVietQrAmount || !Fits(input.Note, 500))
            return Invalid("Kiểm tra mã đơn, số điện thoại và số tiền chuyển khoản.");

        var code = input.OrderCode.Trim().ToUpperInvariant();
        var order = await _database.PhotoOrders.SingleOrDefaultAsync(row => row.OrderCode == code && row.CustomerPhone == phone, cancellationToken);
        if (order is null) return Missing("Không tìm thấy đơn phù hợp với thông tin đã nhập.");
        if (order.PaymentMethod != "VietQr") return Conflict("Đơn này không sử dụng thanh toán VietQR.");
        if (order.GrandTotal != input.Amount || TransferMemo(order.OrderCode) != input.TransferMemo)
            return Invalid("Số tiền hoặc nội dung chuyển khoản không khớp với đơn in.");

        var existing = await _database.PhotoPaymentTransactions.AsNoTracking()
            .SingleOrDefaultAsync(row => row.OrderId == order.Id && row.Status != "Rejected", cancellationToken);
        if (existing is not null) return Success(ReceiptView(existing));
        if (order.Status == "Cancelled" || order.PaymentStatus != "Unpaid")
            return Conflict("Đơn này không nhận thêm giao dịch.");

        var bank = await _database.PhotoContactConfigs.AsNoTracking().SingleOrDefaultAsync(cancellationToken);
        if (bank is not { VietQrEnabled: true, BankCode: not null, BankName: not null, BankAccountNumber: not null }
            || bank.BankCode != input.BankCode || bank.BankAccountNumber != input.BankAccountNumber)
            return Conflict("Tài khoản VietQR đã thay đổi hoặc tạm ngừng. Vui lòng tải lại đơn.");

        var now = DateTime.UtcNow;
        var localDate = TimeZoneInfo.ConvertTimeFromUtc(now, StudioZone);
        var suffix = Guid.NewGuid().ToString("N")[..12].ToUpperInvariant();
        var payment = new PhotoPaymentTransaction
        {
            OrderId = order.Id, OrderCode = order.OrderCode, TransactionCode = FormattableString.Invariant($"MTP{localDate:yyyyMMdd}{suffix}"),
            BankCode = bank.BankCode, BankName = bank.BankName, BankAccountNumber = bank.BankAccountNumber,
            Amount = order.GrandTotal, TransferMemo = input.TransferMemo, CustomerPhone = phone, Note = Trim(input.Note), CreatedAtUtc = now,
        };
        _database.PhotoPaymentTransactions.Add(payment);
        order.PaymentStatus = "PendingVerify";
        order.UpdatedAtUtc = now;
        order.Revision++;
        return await SaveAsync(() => ReceiptView(payment), cancellationToken);
    }

    public async Task<Result<object>> VerifyPaymentAsync(Guid id, VerifyPhotoPaymentInput input, CancellationToken cancellationToken)
    {
        if (_actor.Role != "Admin") return Forbidden();
        if (input.Status is not ("Verified" or "Rejected") || !Fits(input.StaffNote, 500))
            return Invalid("Chọn trạng thái đối soát hợp lệ.");

        var payment = await _database.PhotoPaymentTransactions.Include(row => row.Order).SingleOrDefaultAsync(row => row.Id == id, cancellationToken);
        if (payment is null) return Missing();
        if (payment.Revision != input.ExpectedRevision || payment.Status != "PendingVerify" || payment.Order.PaymentStatus != "PendingVerify")
            return Conflict();
        var verified = input.Status == "Verified";
        if (verified && payment.Order.Status == "Cancelled") return Conflict("Đơn đã hủy. Hãy từ chối giao dịch và xử lý tại quầy.");

        var now = DateTime.UtcNow;
        payment.Status = input.Status;
        payment.StaffNote = Trim(input.StaffNote);
        payment.VerifiedAtUtc = now;
        payment.VerifiedByUserId = _actor.UserId;
        payment.Revision++;
        payment.Order.PaymentStatus = verified ? "Paid" : "Unpaid";
        payment.Order.PaidAtUtc = verified ? now : null;
        payment.Order.UpdatedAtUtc = now;
        payment.Order.Revision++;
        return await SaveAsync(() => ReceiptView(payment), cancellationToken);
    }
    #endregion

    #region Queries
    public async Task<Result<object>> GetPaymentsAsync(PhotoPaymentFilter filter, CancellationToken cancellationToken)
    {
        if (_actor.Role != "Admin") return Forbidden();
        if (!Fits(filter.Search, 150) || filter.Status is not (null or "PendingVerify" or "Verified" or "Rejected"))
            return Invalid("Bộ lọc giao dịch không hợp lệ.");

        var payments = _database.PhotoPaymentTransactions.AsNoTracking();
        var summary = await payments.GroupBy(_ => 1).Select(rows => new
        {
            totalCount = rows.Count(),
            pendingCount = rows.Count(row => row.Status == "PendingVerify"),
            verifiedAmount = rows.Sum(row => row.Status == "Verified" ? row.Amount : 0m),
            totalRecordedAmount = rows.Sum(row => row.Amount),
        }).SingleOrDefaultAsync(cancellationToken) ?? new { totalCount = 0, pendingCount = 0, verifiedAmount = 0m, totalRecordedAmount = 0m };

        var rows = payments;
        var keyword = Trim(filter.Search)?.ToUpperInvariant();
        if (filter.Status is not null) rows = rows.Where(row => row.Status == filter.Status);
        if (keyword is not null)
            rows = rows.Where(row => row.TransactionCode.Contains(keyword) || row.OrderCode.Contains(keyword) || row.CustomerPhone.Contains(keyword));
        var (page, pageSize) = Paging(filter.Page, filter.PageSize);
        var totalCount = filter.Status is null && keyword is null ? summary.totalCount : await rows.CountAsync(cancellationToken);
        var items = await rows.OrderByDescending(row => row.CreatedAtUtc).ThenBy(row => row.Id).Skip((page - 1) * pageSize).Take(pageSize)
            .Select(row => new
            {
                row.Id, row.TransactionCode, row.OrderCode, row.Status, row.BankCode, row.BankName, row.BankAccountNumber, row.Amount,
                row.TransferMemo, row.CustomerPhone, row.Note, row.StaffNote, row.CreatedAtUtc, row.VerifiedAtUtc, row.Revision,
            }).ToListAsync(cancellationToken);
        return Success(new { items, totalCount, page, pageSize, summary });
    }

    private static string TransferMemo(string orderCode)
    {
        var reference = orderCode.Replace("-", "", StringComparison.Ordinal);
        return reference.Length <= 18 ? reference + " IN ANH" : reference;
    }

    private static object ReceiptView(PhotoPaymentTransaction payment) => new
    {
        payment.TransactionCode, payment.OrderCode, payment.Amount, payment.Status, payment.CreatedAtUtc,
    };
    #endregion
}
