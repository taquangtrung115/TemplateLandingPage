namespace TemplateLandingPage.Domain.Entities;

using TemplateLandingPage.Domain.Abstractions;

public sealed class NavigationMenu : AggregateRoot<Guid>, IAuditableEntity, ISoftDelete
{
    public string Title { get; private set; } = string.Empty;
    public string Url { get; private set; } = string.Empty;
    public Guid? ParentId { get; private set; }
    public int OrderIndex { get; private set; }
    public string Target { get; private set; } = "_self";
    public string? Badge { get; private set; }
    public string? BadgeColor { get; private set; }
    public string? Icon { get; private set; }
    public bool IsActive { get; private set; } = true;
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? ModifiedAtUtc { get; set; }

    public NavigationMenu? Parent { get; private set; }
    public ICollection<NavigationMenu> SubMenus { get; set; } = new List<NavigationMenu>();

    private NavigationMenu()
    {
    }

    private NavigationMenu(
        Guid id,
        string title,
        string url,
        Guid? parentId,
        int orderIndex,
        string target,
        string? badge,
        string? badgeColor,
        string? icon,
        bool isActive)
    {
        Id = id;
        Title = title;
        Url = url;
        ParentId = parentId;
        OrderIndex = orderIndex;
        Target = string.IsNullOrWhiteSpace(target) ? "_self" : target;
        Badge = badge;
        BadgeColor = badgeColor;
        Icon = icon;
        IsActive = isActive;
        IsDeleted = false;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public static NavigationMenu Create(
        string title,
        string url,
        Guid? parentId,
        int orderIndex,
        string? target = "_self",
        string? badge = null,
        string? badgeColor = null,
        string? icon = null,
        bool isActive = true)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Menu title cannot be empty.", nameof(title));
        if (string.IsNullOrWhiteSpace(url))
            throw new ArgumentException("Menu URL cannot be empty.", nameof(url));

        return new NavigationMenu(
            Guid.NewGuid(),
            title.Trim(),
            url.Trim(),
            parentId,
            orderIndex,
            string.IsNullOrWhiteSpace(target) ? "_self" : target.Trim(),
            badge?.Trim(),
            badgeColor?.Trim(),
            icon?.Trim(),
            isActive);
    }

    public void Update(
        string title,
        string url,
        Guid? parentId,
        int orderIndex,
        string? target,
        string? badge,
        string? badgeColor,
        string? icon,
        bool isActive)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Menu title cannot be empty.", nameof(title));
        if (string.IsNullOrWhiteSpace(url))
            throw new ArgumentException("Menu URL cannot be empty.", nameof(url));
        if (parentId.HasValue && parentId.Value == Id)
            throw new ArgumentException("A menu item cannot be its own parent.", nameof(parentId));

        Title = title.Trim();
        Url = url.Trim();
        ParentId = parentId;
        OrderIndex = orderIndex;
        Target = string.IsNullOrWhiteSpace(target) ? "_self" : target.Trim();
        Badge = badge?.Trim();
        BadgeColor = badgeColor?.Trim();
        Icon = icon?.Trim();
        IsActive = isActive;
        ModifiedAtUtc = DateTime.UtcNow;
    }

    public void Delete()
    {
        IsDeleted = true;
        DeletedAtUtc = DateTime.UtcNow;
    }
}
