namespace OnePortal.Persistence.Repositories.PhotoPrint;

using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using OnePortal.Contract.Services.V1.PhotoPrint;
using OnePortal.Contract.Services.V1.PhotoPrint.Support;
using OnePortal.Contract.Services.V1.PhotoPrint.Contact;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Domain.Entities.PhotoPrint;

public sealed partial class PhotoPrintStore
{
    private static readonly string[] SupportStatuses = ["New", "InProgress", "Resolved"];
    private static readonly string[] Priorities = ["normal", "high", "urgent"];
    private static readonly string[] MessengerHosts = ["m.me", "messenger.com", "www.messenger.com", "facebook.com", "www.facebook.com"];
    private static readonly string[] ZaloHosts = ["zalo.me", "oa.zalo.me", "chat.zalo.me"];

    #region Support
    public async Task<Result<object>> GetSupportRequestsAsync(PhotoQueueFilter filter, CancellationToken cancellationToken)
    {
        if (_actor.Role != "Admin") return Forbidden();
        var tickets = _database.PhotoSupportRequests.AsNoTracking();
        if (Trim(filter.Status) is { } status) tickets = tickets.Where(row => row.Status == status);
        if (Trim(filter.Priority) is { } priority) tickets = tickets.Where(row => row.Priority == priority);
        if (Trim(filter.Search) is { Length: <= 150 } keyword)
        {
            var search = keyword.ToLowerInvariant();
            tickets = tickets.Where(row => row.TicketCode.ToLower().Contains(search) || row.FullName.ToLower().Contains(search)
                || row.Phone.Contains(search) || (row.Email ?? "").Contains(search) || row.Message.ToLower().Contains(search));
        }
        var (page, pageSize) = Paging(filter.Page, filter.PageSize);
        var totalCount = await tickets.CountAsync(cancellationToken);
        var rows = await tickets.OrderByDescending(row => row.CreatedAtUtc).ThenBy(row => row.Id)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
        return Success(new { items = rows.Select(SupportView).ToArray(), totalCount, page, pageSize });
    }

    public async Task<Result<object>> GetSupportStatusAsync(string code, string contact, CancellationToken cancellationToken)
    {
        var phone = Phone(contact);
        var email = Email(contact) ? Trim(contact)?.ToLowerInvariant() : null;
        if (!Required(code, 40) || (phone is null && email is null)) return Invalid("Nhập mã hỗ trợ và số điện thoại hoặc email hợp lệ.");
        var key = code.Trim().ToUpperInvariant();
        var row = await _database.PhotoSupportRequests.AsNoTracking().Where(ticket => ticket.TicketCode == key &&
            ((phone != null && ticket.Phone == phone) || (email != null && ticket.Email == email)))
            .Select(ticket => new { ticket.TicketCode, ticket.Status, ticket.AdminNote, ticket.CreatedAtUtc, ticket.UpdatedAtUtc })
            .SingleOrDefaultAsync(cancellationToken);
        return row is null ? Missing("Không tìm thấy yêu cầu phù hợp với thông tin đã nhập.") : Success(row);
    }

    public async Task<Result<object>> CreateSupportRequestAsync(PhotoSupportInput input, CancellationToken cancellationToken)
    {
        var phone = Phone(input.Phone);
        var attachment = UploadedPath(input.AttachmentUrl);
        if (!Required(input.FullName, 120) || phone is null || !Email(input.Email) || !Required(input.Topic, 120)
            || !Priorities.Contains(input.Priority) || !Required(input.Message, 2000) || !Fits(input.OrderCode, 40)
            || (Trim(input.AttachmentUrl) is not null && attachment is null))
            return Invalid("Kiểm tra họ tên, số điện thoại, nội dung và ảnh đính kèm.");
        var number = await _database.Database.SqlQueryRaw<long>("SELECT nextval('photo.\"SupportNumbers\"') AS \"Value\"").SingleAsync(cancellationToken);
        var now = DateTime.UtcNow;
        var row = new PhotoSupportRequest
        {
            TicketCode = DocumentCode("SUP", now, number), CreatedByUserId = _actor.UserId, FullName = input.FullName.Trim(),
            Phone = phone, Email = Trim(input.Email)?.ToLowerInvariant(), Topic = input.Topic.Trim(), Priority = input.Priority,
            OrderCode = Trim(input.OrderCode)?.ToUpperInvariant(), AttachmentUrl = attachment, Message = input.Message.Trim(),
            Status = "New", CreatedAtUtc = now,
        };
        _database.PhotoSupportRequests.Add(row);
        return await SaveAsync(() => new { row.TicketCode, row.Status }, cancellationToken);
    }

    public async Task<Result<object>> SetSupportStatusAsync(Guid id, PhotoStatusInput input, CancellationToken cancellationToken)
    {
        if (_actor.Role != "Admin") return Forbidden();
        if (!SupportStatuses.Contains(input.Status) || !Fits(input.AdminNote, 2000)) return Invalid("Trạng thái hoặc phản hồi không hợp lệ.");
        var row = await _database.PhotoSupportRequests.SingleOrDefaultAsync(ticket => ticket.Id == id, cancellationToken);
        if (row is null) return Missing();
        if (row.Revision != input.ExpectedRevision) return Conflict();
        var now = DateTime.UtcNow;
        row.Status = input.Status;
        row.AdminNote = Trim(input.AdminNote);
        row.UpdatedAtUtc = now;
        row.UpdatedByUserId = _actor.UserId;
        if (input.Status == "Resolved")
        {
            row.ResolvedAtUtc ??= now;
            row.ResolvedByUserId ??= _actor.UserId;
        }
        else
        {
            row.ResolvedAtUtc = null;
            row.ResolvedByUserId = null;
        }
        row.Revision++;
        return await SaveAsync(() => SupportView(row), cancellationToken);
    }

    private static object SupportView(PhotoSupportRequest row) => new
    {
        row.Id, row.TicketCode, row.FullName, row.Phone, row.Email, row.Topic, row.Priority, row.OrderCode, row.AttachmentUrl,
        row.Message, row.Status, row.AdminNote, row.Revision, row.CreatedAtUtc, row.UpdatedAtUtc, row.ResolvedAtUtc,
    };
    #endregion

    #region Contact configuration
    public async Task<Result<object>> GetContactConfigAsync(CancellationToken cancellationToken)
    {
        var row = await _database.PhotoContactConfigs.AsNoTracking().SingleOrDefaultAsync(cancellationToken);
        return row is null ? Missing("Tiệm ảnh chưa có cấu hình liên hệ.") : Success(ContactView(row));
    }

    public async Task<Result<object>> SaveContactConfigAsync(PhotoContactInput input, CancellationToken cancellationToken)
    {
        if (_actor.Role != "Admin") return Forbidden();
        var messenger = SocialUrl(input.MessengerLinkOverride, MessengerHosts);
        var bankCode = Trim(input.BankCode)?.ToUpperInvariant() ?? "";
        VietQrBanks.TryGetValue(bankCode, out var bankName);
        var accountNumber = Trim(input.BankAccountNumber);
        if (input.VietQrEnabled is not null && ((bankCode.Length > 0 && bankName is null)
            || (accountNumber is not null && !Regex.IsMatch(accountNumber, "^[0-9]{1,19}$"))
            || !Fits(input.BankAccountName, 120) || !Fits(input.BankBranch, 150)
            || (input.VietQrEnabled == true && (bankName is null || accountNumber is null || !Required(input.BankAccountName, 120)))))
            return Invalid("Chọn ngân hàng và nhập số tài khoản cùng tên chủ tài khoản VietQR.");
        var zalo = SocialUrl(input.ZaloLinkOverride, ZaloHosts);
        var messengerId = Handle(input.MessengerPageIdOrUsername, "^[0-9a-zA-Z.]{1,120}$");
        var zaloId = Phone(input.ZaloPhoneOrOaId) ?? Handle(input.ZaloPhoneOrOaId, "^[0-9a-zA-Z_-]{1,120}$");
        if (!Required(input.BrandName, 150) || !Email(input.Email) || !Fits(input.Address, 350) || !Fits(input.WorkingHours, 180)
            || (Trim(input.Hotline) is not null && Phone(input.Hotline) is null)
            || !Asset(input.MessengerQrImageUrl) || !Asset(input.ZaloQrImageUrl) || !Fits(input.ZaloAccountName, 150)
            || !Fits(input.MessengerPrefillText, 500) || !Fits(input.ZaloPrefillText, 500)
            || (Trim(input.MessengerLinkOverride) is not null && messenger is null) || (Trim(input.ZaloLinkOverride) is not null && zalo is null)
            || (input.MessengerEnabled && messenger is null && messengerId is null && Trim(input.MessengerQrImageUrl) is null)
            || (input.ZaloEnabled && zalo is null && zaloId is null && Trim(input.ZaloQrImageUrl) is null))
            return Invalid("Kiểm tra số điện thoại, liên kết và tài khoản liên hệ.");
        var row = await _database.PhotoContactConfigs.SingleOrDefaultAsync(cancellationToken);
        if (row is null)
        {
            row = new PhotoContactConfig();
            _database.PhotoContactConfigs.Add(row);
        }
        row.BrandName = input.BrandName.Trim();
        row.Hotline = Phone(input.Hotline);
        row.Email = Trim(input.Email);
        row.Address = Trim(input.Address);
        row.WorkingHours = Trim(input.WorkingHours);
        row.MessengerEnabled = input.MessengerEnabled;
        row.MessengerPageIdOrUsername = messengerId;
        row.MessengerLinkOverride = messenger;
        row.MessengerPrefillText = Trim(input.MessengerPrefillText);
        row.MessengerQrImageUrl = AssetForStorage(input.MessengerQrImageUrl);
        row.FbCustomerChatEnabled = input.FbCustomerChatEnabled;
        row.FbAppId = Handle(input.FbAppId, "^[0-9]{5,30}$");
        row.ZaloEnabled = input.ZaloEnabled;
        row.ZaloAccountName = Trim(input.ZaloAccountName);
        row.ZaloPhoneOrOaId = zaloId;
        row.ZaloLinkOverride = zalo;
        row.ZaloPrefillText = Trim(input.ZaloPrefillText);
        row.ZaloQrImageUrl = AssetForStorage(input.ZaloQrImageUrl);
        if (input.VietQrEnabled is bool enabled)
        {
            row.VietQrEnabled = enabled;
            row.BankCode = bankName is null ? null : bankCode;
            row.BankName = bankName;
            row.BankAccountNumber = accountNumber;
            row.BankAccountName = Trim(input.BankAccountName);
            row.BankBranch = Trim(input.BankBranch);
        }
        row.UpdatedAtUtc = DateTime.UtcNow;
        return await SaveAsync(() => ContactView(row), cancellationToken);
    }

    private string? AssetForStorage(string? value) => UploadedPath(value) ?? Trim(value);

    private static string? Handle(string? value, string pattern)
    {
        var clean = Trim(value)?.Trim('@', '/');
        return clean is not null && Regex.IsMatch(clean, pattern) ? clean : null;
    }

    private static string? SocialUrl(string? value, string[] allowedHosts)
    {
        if (Trim(value) is not { Length: <= 2048 } input || input.StartsWith('/') || input.Any(char.IsControl)) return null;
        if (!input.Contains("://", StringComparison.Ordinal)) input = "https://" + input;
        return IsHttps(input) && Uri.TryCreate(input, UriKind.Absolute, out var uri) && uri.IsDefaultPort && allowedHosts.Contains(uri.IdnHost)
            ? uri.AbsoluteUri : null;
    }

    private object ContactView(PhotoContactConfig row)
    {
        var showBank = row.VietQrEnabled || _actor.Role == "Admin";
        return new
        {
            row.BrandName, row.Hotline, row.Email, row.Address, row.WorkingHours, row.MessengerEnabled, row.MessengerPageIdOrUsername,
            row.MessengerLinkOverride, row.MessengerPrefillText, row.MessengerQrImageUrl, row.FbCustomerChatEnabled, row.FbAppId,
            row.ZaloEnabled, row.ZaloAccountName, row.ZaloPhoneOrOaId, row.ZaloLinkOverride, row.ZaloPrefillText, row.ZaloQrImageUrl,
            row.VietQrEnabled, BankCode = showBank ? row.BankCode : null, BankName = showBank ? row.BankName : null,
            BankAccountNumber = showBank ? row.BankAccountNumber : null, BankAccountName = showBank ? row.BankAccountName : null,
            BankBranch = showBank ? row.BankBranch : null,
        };
    }
    #endregion
}
