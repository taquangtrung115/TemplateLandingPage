namespace OnePortal.Domain.Entities.Quoting;

using OnePortal.Domain.Abstractions;

public sealed class QuotationTemplateVersion : TenantEntity<Guid>
{
    public Guid TemplateId { get; private set; }
    public int Version { get; private set; }
    public string Title { get; private set; } = "BẢNG BÁO GIÁ";
    public string SellerInfoJson { get; private set; } = string.Empty;
    public string SalutationText { get; private set; } = string.Empty;
    public string ColumnsConfigJson { get; private set; } = string.Empty;
    public string PaymentTermsJson { get; private set; } = string.Empty;
    public string SignatureConfigJson { get; private set; } = string.Empty;
    public string? CustomCss { get; private set; }
    public bool IsPublished { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public Guid? CreatedByUserId { get; private set; }

    private QuotationTemplateVersion()
    {
    }

    private QuotationTemplateVersion(
        Guid id,
        Guid templateId,
        int version,
        string title,
        string sellerInfoJson,
        string salutationText,
        string columnsConfigJson,
        string paymentTermsJson,
        string signatureConfigJson,
        string? customCss,
        bool isPublished,
        Guid? createdByUserId)
    {
        Id = id;
        TemplateId = templateId;
        Version = version;
        Title = string.IsNullOrWhiteSpace(title) ? "BẢNG BÁO GIÁ" : title.Trim();
        SellerInfoJson = sellerInfoJson;
        SalutationText = salutationText;
        ColumnsConfigJson = columnsConfigJson;
        PaymentTermsJson = paymentTermsJson;
        SignatureConfigJson = signatureConfigJson;
        CustomCss = customCss;
        IsPublished = isPublished;
        CreatedAtUtc = DateTime.UtcNow;
        CreatedByUserId = createdByUserId;
    }

    public static QuotationTemplateVersion Create(
        Guid templateId,
        int version,
        string title,
        string sellerInfoJson,
        string salutationText,
        string columnsConfigJson,
        string paymentTermsJson,
        string signatureConfigJson,
        string? customCss,
        bool isPublished,
        Guid? createdByUserId)
    {
        return new QuotationTemplateVersion(
            Guid.NewGuid(),
            templateId,
            version,
            title,
            sellerInfoJson,
            salutationText,
            columnsConfigJson,
            paymentTermsJson,
            signatureConfigJson,
            customCss,
            isPublished,
            createdByUserId);
    }
}
