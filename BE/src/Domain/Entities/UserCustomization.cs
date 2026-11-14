namespace OnePortal.Domain.Entities;

using OnePortal.Domain.Abstractions;

public sealed class UserCustomization : AggregateRoot<Guid>, IAuditableEntity, ISoftDelete
{
    public Guid? UserId { get; private set; }
    public Guid TemplateId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string ConfigJson { get; private set; } = string.Empty;
    public bool IsPublished { get; private set; }
    public Guid? PublishedVersionId { get; private set; }
    public int Revision { get; private set; } = 1;
    public int LastVersionNumber { get; private set; }
    public Guid? ClientDraftId { get; private set; }
    public Guid? LastSaveRequestId { get; private set; }
    public string? LastSaveRequestHash { get; private set; }
    public int? LastSaveRevision { get; private set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? ModifiedAtUtc { get; set; }

    private UserCustomization()
    {
    }

    private UserCustomization(
        Guid id,
        Guid? userId,
        Guid templateId,
        string title,
        string slug,
        string configJson,
        bool isPublished)
    {
        Id = id;
        UserId = userId;
        TemplateId = templateId;
        Title = title;
        Slug = slug;
        ConfigJson = configJson;
        IsPublished = isPublished;
        IsDeleted = false;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public static UserCustomization Create(
        Guid? userId,
        Guid templateId,
        string title,
        string slug,
        string configJson,
        bool isPublished = false)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title cannot be empty.", nameof(title));
        if (string.IsNullOrWhiteSpace(slug))
            throw new ArgumentException("Slug cannot be empty.", nameof(slug));
        if (string.IsNullOrWhiteSpace(configJson))
            throw new ArgumentException("Config JSON cannot be empty.", nameof(configJson));

        return new UserCustomization(
            Guid.NewGuid(),
            userId,
            templateId,
            title.Trim(),
            slug.Trim().ToLowerInvariant(),
            configJson,
            isPublished);
    }

    public void Update(string title, string slug, string configJson, bool isPublished)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title cannot be empty.", nameof(title));
        if (string.IsNullOrWhiteSpace(slug))
            throw new ArgumentException("Slug cannot be empty.", nameof(slug));
        if (string.IsNullOrWhiteSpace(configJson))
            throw new ArgumentException("Config JSON cannot be empty.", nameof(configJson));

        Title = title.Trim();
        Slug = slug.Trim().ToLowerInvariant();
        ConfigJson = configJson;
        IsPublished = isPublished;
        ModifiedAtUtc = DateTime.UtcNow;
    }

    public void Delete()
    {
        IsDeleted = true;
        DeletedAtUtc = DateTime.UtcNow;
        Touch();
    }

    public void SetClientDraftId(Guid clientDraftId) => ClientDraftId = clientDraftId;

    public void SaveDraft(string title, string slug, string configJson, Guid requestId, string requestHash)
    {
        Update(title, slug, configJson, IsPublished);
        Touch();
        LastSaveRequestId = requestId;
        LastSaveRequestHash = requestHash;
        LastSaveRevision = Revision;
    }

    public int AllocateVersionNumber()
    {
        LastVersionNumber++;
        return LastVersionNumber;
    }

    public void SetPublication(Guid? versionId)
    {
        PublishedVersionId = versionId;
        IsPublished = versionId.HasValue;
        Touch();
    }

    public void AssignOwner(Guid userId)
    {
        UserId = userId;
        Touch();
    }

    public void Touch()
    {
        Revision++;
        ModifiedAtUtc = DateTime.UtcNow;
    }
}
