namespace TemplateLandingPage.Contract.Services.V1.Quoting.Templates;

public record QuotationTemplateResponse(
    Guid Id,
    string Code,
    string Name,
    string? Description,
    int CurrentVersion,
    bool IsSystem,
    bool IsActive,
    DateTime CreatedAtUtc,
    List<QuotationTemplateVersionResponse> Versions);

public record QuotationTemplateVersionResponse(
    Guid Id,
    Guid TemplateId,
    int Version,
    string Title,
    string SellerInfoJson,
    string SalutationText,
    string ColumnsConfigJson,
    string PaymentTermsJson,
    string SignatureConfigJson,
    string? CustomCss,
    bool IsPublished,
    DateTime CreatedAtUtc);
