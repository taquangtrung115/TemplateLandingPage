namespace OnePortal.Contract.Services.V1.Quoting.Templates;

using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;

public static class QuotationTemplateErrors
{
    public static readonly Error NotFound = new("QuotationTemplate.NotFound", "Mẫu báo giá không tồn tại trong hệ thống.");
    public static readonly Error VersionNotFound = new("QuotationTemplate.VersionNotFound", "Phiên bản mẫu báo giá không tồn tại.");
    public static readonly Error DuplicateCode = new("QuotationTemplate.DuplicateCode", "Mã mẫu báo giá đã tồn tại.");
    public static readonly Error CannotDeleteSystemTemplate = new("QuotationTemplate.CannotDeleteSystem", "Không thể xóa mẫu báo giá mặc định của hệ thống.");
}

public record CreateQuotationTemplateCommand(
    string Code,
    string Name,
    string? Description,
    bool IsSystem,
    string Title,
    string SellerInfoJson,
    string SalutationText,
    string ColumnsConfigJson,
    string PaymentTermsJson,
    string SignatureConfigJson,
    string? CustomCss,
    Guid UserId = default) : ICommand<Guid>;

public record CreateTemplateVersionCommand(
    Guid TemplateId,
    string Title,
    string SellerInfoJson,
    string SalutationText,
    string ColumnsConfigJson,
    string PaymentTermsJson,
    string SignatureConfigJson,
    string? CustomCss,
    Guid UserId = default) : ICommand<int>;

public record UpdateQuotationTemplateCommand(
    Guid Id,
    string Name,
    string? Description,
    bool IsActive) : ICommand;
