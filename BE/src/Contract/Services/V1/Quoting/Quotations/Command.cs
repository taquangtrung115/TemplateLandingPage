namespace TemplateLandingPage.Contract.Services.V1.Quoting.Quotations;

using TemplateLandingPage.Contract.Abstractions.Message;
using TemplateLandingPage.Contract.Abstractions.Shared;

public static class QuotationErrors
{
    public static readonly Error NotFound = new("Quotation.NotFound", "Báo giá không tồn tại trong hệ thống.");
    public static readonly Error FileNotFound = new("Quotation.FileNotFound", "Không tìm thấy tệp đã xuất của báo giá này.");
    public static readonly Error InvalidStatus = new("Quotation.InvalidStatus", "Trạng thái báo giá không hợp lệ.");
    public static readonly Error CannotEditNonDraft = new("Quotation.CannotEditNonDraft", "Không thể chỉnh sửa báo giá khi trạng thái không còn là Bản nháp (Draft).");
    public static readonly Error EmptyItems = new("Quotation.EmptyItems", "Báo giá phải có ít nhất một dòng sản phẩm.");
    public static readonly Error InvalidDiscount = new("Quotation.InvalidDiscount", "Tỷ lệ chiết khấu phải từ 0% đến 100%.");
    public static readonly Error InvalidTax = new("Quotation.InvalidTax", "Thuế suất VAT phải từ 0% đến 100%.");
    public static readonly Error InvalidFileType = new("Quotation.InvalidFileType", "Định dạng file xuất chỉ chấp nhận 'pdf' hoặc 'html'.");
    public static readonly Error ImageUnavailable = new("Quotation.ImageUnavailable", "Không thể tải ảnh sản phẩm đã lưu. Vui lòng kiểm tra ảnh trong danh mục hoặc thử lại.");
}

public record QuotationItemDto(
    Guid? ProductId = null,
    string? ProductCode = null,
    string ProductName = "",
    string? Description = null,
    string Unit = "GÓI",
    string? ImageUrl = null,
    string? ItemGroup = null,
    decimal Quantity = 1,
    decimal UnitPrice = 0,
    decimal DiscountPercent = 0,
    string? Notes = null,
    int SortOrder = 0, int GroupSortOrder = 0);

public record CreateQuotationCommand(
    Guid? CustomerId = null,
    Guid? TemplateId = null,
    int? TemplateVersion = null,
    DateTime IssueDate = default,
    DateTime? ValidUntil = null,
    decimal DiscountPercent = 0,
    decimal TaxPercent = 0,
    string? Notes = null,
    List<QuotationItemDto>? Items = null,
    Guid UserId = default,
    bool ShowDiscount = true,
    bool ShowQuantity = true,
    bool ShowSubTotal = true,
    bool ShowGrandTotal = true) : ICommand<Guid>;

public record UpdateQuotationCommand(
    Guid Id,
    Guid? CustomerId,
    DateTime IssueDate,
    DateTime? ValidUntil,
    decimal DiscountPercent,
    decimal TaxPercent,
    string? Notes,
    List<QuotationItemDto> Items,
    Guid UserId = default,
    bool? ShowDiscount = null,
    bool? ShowQuantity = null,
    bool? ShowSubTotal = null,
    bool? ShowGrandTotal = null) : ICommand;

public record ChangeQuotationStatusCommand(
    Guid Id,
    string Status,
    string? Reason = null,
    Guid UserId = default) : ICommand;

public record DeleteQuotationCommand(Guid Id) : ICommand;

public record ExportQuotationFileCommand(
    Guid QuotationId,
    string FileType,
    Guid UserId = default,
    decimal? TaxPercent = null) : ICommand<QuotationFileResponse>;
