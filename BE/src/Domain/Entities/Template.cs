namespace TemplateLandingPage.Domain.Entities;

using TemplateLandingPage.Domain.Abstractions;

public sealed class Template : AggregateRoot<Guid>, IAuditableEntity, ISoftDelete
{
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string Category { get; private set; } = "Wedding"; // "Wedding", "Birthday"
    public string ThumbnailUrl { get; private set; } = string.Empty;
    public string? PreviewUrl { get; private set; }
    public string DefaultConfigJson { get; private set; } = string.Empty;
    public bool IsActive { get; private set; } = true;
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
        string category,
        string thumbnailUrl,
        string? previewUrl,
        string defaultConfigJson,
        bool isActive)
    {
        Id = id;
        Name = name;
        Slug = slug;
        Description = description;
        Category = category;
        ThumbnailUrl = thumbnailUrl;
        PreviewUrl = previewUrl;
        DefaultConfigJson = defaultConfigJson;
        IsActive = isActive;
        IsDeleted = false;
        CreatedAtUtc = DateTime.UtcNow;
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
            category.Trim(),
            thumbnailUrl.Trim(),
            previewUrl?.Trim(),
            defaultConfigJson,
            true);
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
        Category = category.Trim();
        ThumbnailUrl = thumbnailUrl.Trim();
        PreviewUrl = previewUrl?.Trim();
        DefaultConfigJson = defaultConfigJson;
        IsActive = isActive;
        ModifiedAtUtc = DateTime.UtcNow;
    }

    public void Delete()
    {
        IsDeleted = true;
        DeletedAtUtc = DateTime.UtcNow;
    }
}
