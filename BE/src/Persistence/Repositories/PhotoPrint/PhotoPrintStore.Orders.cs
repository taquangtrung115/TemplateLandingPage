namespace OnePortal.Persistence.Repositories.PhotoPrint;

using System.Globalization;
using System.Net.Mail;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using OnePortal.Contract.Services.V1.PhotoPrint;
using OnePortal.Contract.Services.V1.PhotoPrint.Products;
using OnePortal.Contract.Services.V1.PhotoPrint.Orders;
using OnePortal.Application.UseCases.V1.PhotoPrint.Helpers;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Domain.Entities.PhotoPrint;

public sealed partial class PhotoPrintStore
{
    private static readonly string[] OrderStatuses = ["Pending", "FileChecking", "Printing", "Finishing", "Shipped", "Completed", "Cancelled"];
    private static readonly string[] Deliveries = ["Pickup", "LocalDelivery", "NationwideCod"];
    private static readonly string[] Payments = ["VietQr", "Cash", "Deposit"];
    private static readonly string[] ComboServiceSlugs = ["anh-the", "in-anh-10x15", "anh-polaroid", "in-mau-photo-a4"];
    private static readonly TimeZoneInfo StudioZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Ho_Chi_Minh");

    #region Order queries
    public async Task<Result<object>> GetOrdersAsync(PhotoQueueFilter filter, CancellationToken cancellationToken)
    {
        if (_actor.Role != "Admin") return Forbidden();
        var orders = _database.PhotoOrders.AsNoTracking();
        if (Trim(filter.Status) is { } status) orders = orders.Where(row => row.Status == status);
        if (Trim(filter.Search) is { Length: <= 150 } keyword)
        {
            var search = keyword.ToLowerInvariant();
            orders = orders.Where(row => row.OrderCode.ToLower().Contains(search) || row.CustomerName.ToLower().Contains(search) || row.CustomerPhone.Contains(search));
        }
        var (page, pageSize) = Paging(filter.Page, filter.PageSize);
        var totalCount = await orders.CountAsync(cancellationToken);
        var rows = await orders.Include(row => row.Items).OrderByDescending(row => row.CreatedAtUtc).ThenBy(row => row.Id)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
        var ids = rows.Where(row => row.PaymentStatus is "PendingVerify" or "Paid").Select(row => row.Id).ToList();
        var receipts = ids.Count == 0 ? [] : await _database.PhotoPaymentTransactions.AsNoTracking()
            .Where(row => ids.Contains(row.OrderId) && row.Status != "Rejected").ToDictionaryAsync(row => row.OrderId, cancellationToken);
        return Success(new { items = rows.Select(row => OrderView(row, false, receipts.GetValueOrDefault(row.Id))).ToArray(), totalCount, page, pageSize });
    }

    public async Task<Result<object>> GetOrderStatusAsync(string code, string phone, CancellationToken cancellationToken)
    {
        var phoneNumber = Phone(phone);
        if (!Required(code, 40) || phoneNumber is null) return Invalid("Nhập mã đơn và số điện thoại hợp lệ.");
        var normalizedCode = code.Trim().ToUpperInvariant();
        var order = await _database.PhotoOrders.AsNoTracking().Include(row => row.Items)
            .SingleOrDefaultAsync(row => row.OrderCode == normalizedCode && row.CustomerPhone == phoneNumber, cancellationToken);
        return order is null ? Missing("Không tìm thấy đơn phù hợp với thông tin đã nhập.") : Success(OrderView(order, true));
    }
    #endregion

    #region Order commands
    public async Task<Result<object>> CreateOrderAsync(PhotoOrderInput input, CancellationToken cancellationToken)
    {
        var phone = Phone(input.CustomerPhone);
        if (!Required(input.CustomerName, 120) || phone is null || !Email(input.CustomerEmail)
            || !Deliveries.Contains(input.DeliveryMethod) || !Payments.Contains(input.PaymentMethod)
            || !Fits(input.DeliveryAddress, 350) || (input.DeliveryMethod != "Pickup" && !Required(input.DeliveryAddress, 350))
            || !Fits(input.Notes, 1000) || input.Items is not { Length: > 0 and <= 50 } || input.Items.Any(item => item is null)
            || input.Items.Sum(item => item.PhotoFiles?.Length ?? 0) > 250)
            return Invalid("Kiểm tra thông tin người đặt, cách nhận và số ảnh trong đơn.");

        var productIds = input.Items.Select(item => item.ProductId).Distinct().ToList();
        var products = await (from product in _database.PhotoProducts.AsNoTracking()
                              join category in _database.PhotoCategories.AsNoTracking() on product.CategoryId equals category.Id
                              where productIds.Contains(product.Id) && product.IsActive && !product.IsDeleted && category.IsActive && !category.IsDeleted
                              select product).ToDictionaryAsync(row => row.Id, cancellationToken);
        if (products.Count != productIds.Count) return Conflict("Một sản phẩm trong giỏ đã ngừng nhận đặt in.");
        var now = DateTime.UtcNow;
        var order = new PhotoOrder
        {
            CustomerName = input.CustomerName.Trim(), CustomerPhone = phone, CustomerEmail = Trim(input.CustomerEmail)?.ToLowerInvariant(),
            DeliveryAddress = Trim(input.DeliveryAddress), DeliveryMethod = input.DeliveryMethod, PaymentMethod = input.PaymentMethod,
            Notes = Trim(input.Notes), Status = "Pending", CreatedAtUtc = now, CreatedByUserId = _actor.UserId,
        };
        foreach (var line in input.Items)
        {
            var product = products[line.ProductId];
            if (!TryBuildLine(product, line, out var item, out var discount))
                return Invalid($"Quy cách hoặc ảnh của sản phẩm {product.Name} chưa hợp lệ. Kiểm tra lại giỏ hàng.");
            order.Items.Add(item);
            order.TotalPhotoCount += item.Quantity;
            order.GrandTotal += item.LineTotal;
            order.DiscountTotal += discount;
        }
        if (order.TotalPhotoCount > 50_000) return Invalid("Một đơn có tối đa 50.000 bản in.");
        foreach (var group in order.Items.Where(item => item.ComboGroupId.HasValue).GroupBy(item => item.ComboGroupId))
        {
            var serviceSlugs = group.Select(item => products[item.ProductId!.Value].Slug).ToArray();
            if (group.Key == Guid.Empty || serviceSlugs.Length != 3 || serviceSlugs.Distinct().Count() != 3
                || serviceSlugs.Any(slug => !ComboServiceSlugs.Contains(slug)) || group.Any(item => item.TurnaroundMode != "Standard"))
                return Invalid("Combo 3 cần ba dịch vụ lấy liền khác nhau, với thời gian in tiêu chuẩn.");
            order.ComboDiscountTotal += Math.Round(group.Sum(item => item.LineTotal) * .15m, 0, MidpointRounding.AwayFromZero);
        }
        order.GrandTotal -= order.ComboDiscountTotal;
        order.DiscountTotal += order.ComboDiscountTotal;
        order.SubTotal = order.GrandTotal + order.DiscountTotal;
        var number = await _database.Database.SqlQueryRaw<long>("SELECT nextval('photo.\"OrderNumbers\"') AS \"Value\"").SingleAsync(cancellationToken);
        order.OrderCode = DocumentCode("PA", now, number);
        _database.PhotoOrders.Add(order);
        return await SaveAsync(() => OrderView(order, true), cancellationToken);
    }

    public async Task<Result<object>> SetOrderStatusAsync(Guid id, PhotoStatusInput input, CancellationToken cancellationToken)
    {
        if (_actor.Role != "Admin") return Forbidden();
        if (!OrderStatuses.Contains(input.Status) || !Fits(input.AdminNote, 2000)) return Invalid("Trạng thái hoặc phản hồi không hợp lệ.");
        var row = await _database.PhotoOrders.SingleOrDefaultAsync(order => order.Id == id, cancellationToken);
        if (row is null) return Missing();
        if (row.Revision != input.ExpectedRevision) return Conflict();
        row.Status = input.Status;
        row.AdminNote = Trim(input.AdminNote);
        row.UpdatedAtUtc = DateTime.UtcNow;
        row.Revision++;
        return await SaveAsync(() => new { row.Id, row.Status, row.Revision, row.AdminNote }, cancellationToken);
    }
    #endregion

    #region Fulfillment rules and views
    private bool TryBuildLine(PhotoProduct product, PhotoOrderItemInput input, out PhotoOrderItem item, out decimal discount)
    {
        item = new();
        discount = 0;
        if (input.Quantity is < 1 or > 50_000 || !IsSize(input.WidthCm, input.HeightCm) || input.TurnaroundMode is not ("Standard" or "Rush")
            || (input.TurnaroundMode == "Rush" && product.RushSurchargePercent <= 0)) return false;

        var sizes = ReadArray<PhotoSizeDto>(product.PrintSizesJson);
        var size = sizes.FirstOrDefault(entry => entry.Label == Trim(input.SizeLabel));
        if ((size is null && (product.PricingMode == "PerPrintSizeTier" || Trim(input.SizeLabel) is not null || (product.PricingMode == "PerUnit" && sizes.Length > 0)))
            || (size is not null && (size.WidthCm != input.WidthCm || size.HeightCm != input.HeightCm))) return false;
        var surfaces = ReadArray<PhotoSurfaceDto>(product.PaperOrSurfaceOptionsJson);
        var surface = surfaces.FirstOrDefault(entry => entry.Name == Trim(input.SurfaceName));
        if (surfaces.Length > 0 && surface is null) return false;
        var finishing = input.FinishingNames?.Distinct().ToArray() ?? [];
        var selected = ReadArray<PhotoFinishingDto>(product.FinishingOptionsJson).Where(option => finishing.Contains(option.Name)).ToArray();
        if (selected.Length != finishing.Length) return false;

        var files = input.PhotoFiles ?? [];
        if (files.Length > product.MaxPhotosPerBatch || (!product.SupportsBatchUpload && (files.Length > 0 || input.SendAlbumLater))
            || (product.SupportsBatchUpload && !input.SendAlbumLater && files.Length == 0) || (input.SendAlbumLater && files.Length > 0)
            || (!string.IsNullOrWhiteSpace(input.AlbumUrl) && (!input.SendAlbumLater || !IsHttps(input.AlbumUrl) || !Fits(input.AlbumUrl, 2048)))
            || files.Any(file => !ValidPrintFile(file)) || (files.Length > 0 && files.Sum(file => file.PrintQty) != input.Quantity)) return false;

        var productOptions = product.DefaultModel3DType == "photobook_open" ? input.ProductOptions : null;
        if (productOptions is not null && (productOptions.PageCount is not (20 or 30 or 40 or 50)
            || productOptions.CoverType is not ("Bìa cứng" or "Bìa vải" or "Bìa da"))) return false;

        var price = PhotoPricingCalculator.Calculate(product.PricingMode, product.BasePrice, size?.PriceDeltaOrBase, surface, input.WidthCm,
            input.HeightCm, product.MinBillableAreaSqm, input.Quantity, selected, ReadArray<PhotoDiscountTierDto>(product.DiscountTiersJson),
            input.TurnaroundMode == "Rush" ? product.RushSurchargePercent : 0);
        discount = price.DiscountTotal;
        item.ProductId = product.Id;
        item.ProductName = product.Name;
        item.SizeLabel = size?.Label;
        item.WidthCm = input.WidthCm;
        item.HeightCm = input.HeightCm;
        item.SurfaceName = surface?.Name;
        item.FinishingSummary = string.Join(", ", selected.Select(option => option.Name));
        item.TurnaroundMode = input.TurnaroundMode;
        item.Quantity = input.Quantity;
        item.UnitPrice = price.UnitPrice;
        item.LineTotal = price.LineTotal;
        item.ComboGroupId = input.ComboGroupId;
        item.SendAlbumLater = input.SendAlbumLater;
        item.AlbumUrl = Trim(input.AlbumUrl);
        item.ProductOptionsJson = productOptions is null ? null : Serialize(productOptions);
        item.PhotoFilesJson = Serialize(files.Select(file => file with
        {
            FileUrl = UploadedPath(file.FileUrl)!,
            ComputedDpi = PhotoPricingCalculator.EvaluateDpi(file.WidthPx, file.HeightPx, input.WidthCm, input.HeightCm),
        }));
        return true;
    }

    private bool ValidPrintFile(PhotoFileDto? file) => file is not null && UploadedPath(file.FileUrl) is not null && Required(file.OriginalFileName, 255)
        && file.WidthPx is > 0 and <= 50000 && file.HeightPx is > 0 and <= 50000 && file.PrintQty is >= 1 and <= 999
        && file.FocalX is >= 0 and <= 1 && file.FocalY is >= 0 and <= 1 && file.FitMode is "Fill" or "Fit"
        && Fits(file.Caption, 100) && Fits(file.Note, 500) && file.CaptionFont is null or "serif" or "sans" or "script"
        && file.BorderTone is null or "white" or "cream" or "black";

    private string? UploadedPath(string? value)
    {
        if (string.IsNullOrWhiteSpace(value) || value.Length > 2048 || value.Any(char.IsControl) || value.Contains('\\')) return null;
        string? path = value;
        if (Uri.TryCreate(value, UriKind.Absolute, out var url) && url.Scheme is "http" or "https") path = url.AbsolutePath;
        var match = Regex.Match(path, "^/(?:t/([a-z0-9-]+)/)?api/v1/photoprint/uploads/([a-f0-9]{32}\\.(?:jpg|png|webp))$");
        if (!match.Success || (match.Groups[1].Success && match.Groups[1].Value != _scope.TenantKey)) return null;
        return "/api/v1/photoprint/uploads/" + match.Groups[2].Value;
    }

    private static string? Phone(string? value)
    {
        if (!Fits(value, 30) || value is null) return null;
        var formatted = Regex.Replace(value.Trim(), "[ ().-]", "");
        if (!Regex.IsMatch(formatted, "^\\+?[0-9]{8,15}$")) return null;
        return formatted.StartsWith("+84", StringComparison.Ordinal) ? "0" + formatted[3..] : formatted;
    }

    private static bool Email(string? value) => string.IsNullOrWhiteSpace(value) || (value.Length <= 160 && MailAddress.TryCreate(value, out var email) && email.Address == value.Trim());
    private static string DocumentCode(string prefix, DateTime now, long number) =>
        FormattableString.Invariant($"{prefix}-{TimeZoneInfo.ConvertTimeFromUtc(now, StudioZone):yyyyMMdd}-{number:D4}");

    private static object OrderView(PhotoOrder row, bool guest, PhotoPaymentTransaction? payment = null) => new
    {
        id = guest ? (Guid?)null : row.Id,
        row.OrderCode, row.Status, row.AdminNote, row.Revision, row.CreatedAtUtc, row.UpdatedAtUtc,
        customerName = guest ? null : row.CustomerName, customerPhone = guest ? null : row.CustomerPhone,
        customerEmail = guest ? null : row.CustomerEmail, deliveryAddress = guest ? null : row.DeliveryAddress,
        deliveryMethod = guest ? null : row.DeliveryMethod, paymentMethod = guest ? null : row.PaymentMethod, notes = guest ? null : row.Notes,
        row.SubTotal, row.DiscountTotal, row.ComboDiscountTotal, row.GrandTotal, row.TotalPhotoCount, row.PaymentStatus, row.PaidAtUtc,
        canPayVietQr = row.PaymentMethod == "VietQr" && row.Status != "Cancelled" && row.PaymentStatus == "Unpaid" && row.GrandTotal is > 0 and <= MaximumVietQrAmount,
        transferMemo = row.PaymentMethod == "VietQr" ? TransferMemo(row.OrderCode) : null,
        paymentReceipt = !guest && payment is not null ? ReceiptView(payment) : null,
        items = row.Items.Select(item => new
        {
            item.ProductName, item.SizeLabel, item.WidthCm, item.HeightCm, item.SurfaceName, item.FinishingSummary,
            item.TurnaroundMode, item.Quantity, item.UnitPrice, item.LineTotal, item.ComboGroupId,
            photoFilesJson = guest ? null : item.PhotoFilesJson, item.SendAlbumLater,
            albumUrl = guest ? null : item.AlbumUrl,
            productOptions = !guest && item.ProductOptionsJson is not null ? System.Text.Json.JsonSerializer.Deserialize<PhotoProductOptionsDto>(item.ProductOptionsJson, Json) : null,
        }).ToArray(),
    };
    #endregion
}
