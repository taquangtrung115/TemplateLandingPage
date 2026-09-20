namespace TemplateLandingPage.Domain.Entities;

using TemplateLandingPage.Domain.Abstractions;

public sealed class Category : AggregateRoot<Guid>, IAuditableEntity, ISoftDelete
{
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string? Icon { get; private set; }
    public int OrderIndex { get; private set; }
    public bool IsActive { get; private set; } = true;
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? ModifiedAtUtc { get; set; }

    public ICollection<Template> Templates { get; private set; } = new List<Template>();

    private Category()
    {
    }

    private Category(
        Guid id,
        string name,
        string slug,
        string? description,
        string? icon,
        int orderIndex,
        bool isActive)
    {
        Id = id;
        Name = name;
        Slug = slug;
        Description = description;
        Icon = icon;
        OrderIndex = orderIndex;
        IsActive = isActive;
        IsDeleted = false;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public static Category Create(
        string name,
        string slug,
        string? description,
        string? icon,
        int orderIndex,
        bool isActive = true)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Category name cannot be empty.", nameof(name));
        if (string.IsNullOrWhiteSpace(slug))
            throw new ArgumentException("Slug cannot be empty.", nameof(slug));

        return new Category(
            Guid.NewGuid(),
            name.Trim(),
            slug.Trim().ToLowerInvariant(),
            description?.Trim(),
            icon?.Trim(),
            orderIndex,
            isActive);
    }

    public void Update(
        string name,
        string slug,
        string? description,
        string? icon,
        int orderIndex,
        bool isActive)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Category name cannot be empty.", nameof(name));
        if (string.IsNullOrWhiteSpace(slug))
            throw new ArgumentException("Slug cannot be empty.", nameof(slug));

        Name = name.Trim();
        Slug = slug.Trim().ToLowerInvariant();
        Description = description?.Trim();
        Icon = icon?.Trim();
        OrderIndex = orderIndex;
        IsActive = isActive;
        ModifiedAtUtc = DateTime.UtcNow;
    }

    public void Delete()
    {
        IsDeleted = true;
        DeletedAtUtc = DateTime.UtcNow;
    }
}
