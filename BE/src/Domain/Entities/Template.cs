namespace OnePortal.Domain.Entities;

using OnePortal.Domain.Abstractions;

public sealed class Template : AggregateRoot<Guid>, IAuditableEntity, ISoftDelete
{
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public Guid? CategoryId { get; private set; }
    public Category? CategoryRef { get; private set; }
    public string Category { get; private set; } = "Wedding"; // "Wedding", "Birthday" or custom category name
    public string ThumbnailUrl { get; private set; } = string.Empty;
    public string? PreviewUrl { get; private set; }
    public string? LongPreviewUrl { get; private set; }
    public string? Badge { get; private set; }
    public string? AudioUrl { get; private set; }
    public string? MusicTitle { get; private set; }
    public string DefaultConfigJson { get; private set; } = string.Empty;
    public bool IsActive { get; private set; } = true;
    public bool IsCommunity { get; private set; }
    public string? AuthorName { get; private set; }
    public Guid? CreatedByUserId { get; private set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? ModifiedAtUtc { get; set; }

    private Template()
    {
    }

    private Template(
        Guid id,
        string name,
        string slug,
        string? description,
        Guid? categoryId,
        string category,
        string thumbnailUrl,
        string? previewUrl,
        string? longPreviewUrl,
        string? badge,
        string? audioUrl,
        string? musicTitle,
        string defaultConfigJson,
        bool isActive)
    {
        Id = id;
        Name = name;
        Slug = slug;
        Description = description;
        CategoryId = categoryId;
        Category = category;
        ThumbnailUrl = thumbnailUrl;
        PreviewUrl = previewUrl;
        LongPreviewUrl = longPreviewUrl;
        Badge = badge;
        AudioUrl = audioUrl;
        MusicTitle = musicTitle;
        DefaultConfigJson = defaultConfigJson;
        IsActive = isActive;
        IsDeleted = false;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public static Template Create(
        string name,
        string slug,
        string? description,
        Guid? categoryId,
        string category,
        string thumbnailUrl,
        string? previewUrl,
        string? longPreviewUrl,
        string? badge,
        string? audioUrl,
        string? musicTitle,
        string defaultConfigJson)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Template name cannot be empty.", nameof(name));
        if (string.IsNullOrWhiteSpace(slug))
            throw new ArgumentException("Slug cannot be empty.", nameof(slug));
        if (string.IsNullOrWhiteSpace(thumbnailUrl))
            throw new ArgumentException("Thumbnail URL cannot be empty.", nameof(thumbnailUrl));
        if (string.IsNullOrWhiteSpace(defaultConfigJson))
            throw new ArgumentException("Default config JSON cannot be empty.", nameof(defaultConfigJson));

        return new Template(
            Guid.NewGuid(),
            name.Trim(),
            slug.Trim().ToLowerInvariant(),
            description?.Trim(),
            categoryId,
            category.Trim(),
            thumbnailUrl.Trim(),
            previewUrl?.Trim(),
            longPreviewUrl?.Trim(),
            badge?.Trim(),
            audioUrl?.Trim(),
            musicTitle?.Trim(),
            defaultConfigJson,
            true);
    }

    public static Template Create(
        string name,
        string slug,
        string? description,
        string category,
        string thumbnailUrl,
        string? previewUrl,
        string defaultConfigJson)
    {
        return Create(
            name,
            slug,
            description,
            null,
            category,
            thumbnailUrl,
            previewUrl,
            null,
            null,
            null,
            null,
            defaultConfigJson);
    }

    public static Template CreateCommunity(
        string name,
        string slug,
        string? description,
        string category,
        string thumbnailUrl,
        string defaultConfigJson,
        string? authorName,
        Guid? createdByUserId = null)
    {
        return CreateCommunity(name, slug, description, null, category, thumbnailUrl, defaultConfigJson, authorName, createdByUserId);
    }

    public static Template CreateCommunity(
        string name,
        string slug,
        string? description,
        Guid? categoryId,
        string category,
        string thumbnailUrl,
        string defaultConfigJson,
        string? authorName,
        Guid? createdByUserId = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Template name cannot be empty.", nameof(name));
        if (string.IsNullOrWhiteSpace(slug))
            throw new ArgumentException("Slug cannot be empty.", nameof(slug));
        if (string.IsNullOrWhiteSpace(thumbnailUrl))
            throw new ArgumentException("Thumbnail URL cannot be empty.", nameof(thumbnailUrl));
        if (string.IsNullOrWhiteSpace(defaultConfigJson))
            throw new ArgumentException("Default config JSON cannot be empty.", nameof(defaultConfigJson));

        var template = new Template(
            Guid.NewGuid(),
            name.Trim(),
            slug.Trim().ToLowerInvariant(),
            description?.Trim(),
            categoryId,
            category.Trim(),
            thumbnailUrl.Trim(),
            null,
            null,
            "Community",
            null,
            null,
            defaultConfigJson,
            true);

        template.IsCommunity = true;
        template.AuthorName = string.IsNullOrWhiteSpace(authorName) ? "Anonymous" : authorName.Trim();
        template.CreatedByUserId = createdByUserId;
        return template;
    }

    public void Update(
        string name,
        string slug,
        string? description,
        Guid? categoryId,
        string category,
        string thumbnailUrl,
        string? previewUrl,
        string? longPreviewUrl,
        string? badge,
        string? audioUrl,
        string? musicTitle,
        string defaultConfigJson,
        bool isActive)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Template name cannot be empty.", nameof(name));
        if (string.IsNullOrWhiteSpace(slug))
            throw new ArgumentException("Slug cannot be empty.", nameof(slug));
        if (string.IsNullOrWhiteSpace(thumbnailUrl))
            throw new ArgumentException("Thumbnail URL cannot be empty.", nameof(thumbnailUrl));
        if (string.IsNullOrWhiteSpace(defaultConfigJson))
            throw new ArgumentException("Default config JSON cannot be empty.", nameof(defaultConfigJson));

        Name = name.Trim();
        Slug = slug.Trim().ToLowerInvariant();
        Description = description?.Trim();
        CategoryId = categoryId;
        Category = category.Trim();
        ThumbnailUrl = thumbnailUrl.Trim();
        PreviewUrl = previewUrl?.Trim();
        LongPreviewUrl = longPreviewUrl?.Trim();
        Badge = badge?.Trim();
        AudioUrl = audioUrl?.Trim();
        MusicTitle = musicTitle?.Trim();
        DefaultConfigJson = defaultConfigJson;
        IsActive = isActive;
        ModifiedAtUtc = DateTime.UtcNow;
    }

    public void Update(
        string name,
        string slug,
        string? description,
        string category,
        string thumbnailUrl,
        string? previewUrl,
        string defaultConfigJson,
        bool isActive)
    {
        Update(
            name,
            slug,
            description,
            CategoryId,
            category,
            thumbnailUrl,
            previewUrl,
            LongPreviewUrl,
            Badge,
            AudioUrl,
            MusicTitle,
            defaultConfigJson,
            isActive);
    }

    public void Delete()
    {
        IsDeleted = true;
        DeletedAtUtc = DateTime.UtcNow;
    }
}
