namespace OnePortal.Domain.Entities.Quoting;

using OnePortal.Domain.Abstractions;

public sealed class QuotationTemplate : AggregateRoot<Guid>, IAuditableEntity, ISoftDelete
{
    private readonly List<QuotationTemplateVersion> _versions = new();

    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public int CurrentVersion { get; private set; } = 1;
    public bool IsSystem { get; private set; }
    public bool IsActive { get; private set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? ModifiedAtUtc { get; set; }

    public IReadOnlyCollection<QuotationTemplateVersion> Versions => _versions.AsReadOnly();

    private QuotationTemplate()
    {
    }

    private QuotationTemplate(
        Guid id,
        string code,
        string name,
        string? description,
        bool isSystem)
    {
        Id = id;
        Code = code;
        Name = name;
        Description = description;
        CurrentVersion = 1;
        IsSystem = isSystem;
        IsActive = true;
        IsDeleted = false;
        DeletedAtUtc = null;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public static QuotationTemplate Create(string code, string name, string? description, bool isSystem)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            throw new ArgumentException("Template code cannot be empty.", nameof(code));
        }

        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Template name cannot be empty.", nameof(name));
        }

        return new QuotationTemplate(
            Guid.NewGuid(),
            code.Trim().ToUpperInvariant(),
            name.Trim(),
            description?.Trim(),
            isSystem);
    }

    public void UpdateInfo(string name, string? description, bool isActive)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Template name cannot be empty.", nameof(name));
        }

        Name = name.Trim();
        Description = description?.Trim();
        IsActive = isActive;
        ModifiedAtUtc = DateTime.UtcNow;
    }

    public QuotationTemplateVersion AddNewVersion(
        string title,
        string sellerInfoJson,
        string salutationText,
        string columnsConfigJson,
        string paymentTermsJson,
        string signatureConfigJson,
        string? customCss,
        Guid? createdByUserId)
    {
        int newVersionNumber = _versions.Count == 0 ? CurrentVersion : _versions.Max(v => v.Version) + 1;
        CurrentVersion = newVersionNumber;

        var version = QuotationTemplateVersion.Create(
            Id,
            newVersionNumber,
            title,
            sellerInfoJson,
            salutationText,
            columnsConfigJson,
            paymentTermsJson,
            signatureConfigJson,
            customCss,
            true,
            createdByUserId);

        _versions.Add(version);
        ModifiedAtUtc = DateTime.UtcNow;
        return version;
    }

    public void Delete()
    {
        if (IsSystem)
        {
            throw new InvalidOperationException("System templates cannot be deleted.");
        }

        IsDeleted = true;
        DeletedAtUtc = DateTime.UtcNow;
    }
}
