namespace OnePortal.Contract.Services.V1.NavigationMenus;

using OnePortal.Contract.Abstractions.Shared;

public record NavigationMenuResponse(
    Guid Id,
    string Title,
    string Url,
    Guid? ParentId,
    int OrderIndex,
    string Target,
    string? Badge,
    string? BadgeColor,
    string? Icon,
    bool IsActive,
    DateTime CreatedAtUtc,
    List<NavigationMenuResponse> SubMenus);

public static class NavigationMenuErrors
{
    public static readonly Error NotFound = new("Menu.NotFound", "Không tìm thấy menu.");
    public static readonly Error ParentNotFound = new("Menu.ParentNotFound", "Menu cha không tồn tại.");
    public static readonly Error CannotBeSelfParent = new("Menu.CannotBeSelfParent", "Menu không thể làm cha của chính mình.");
    public static readonly Error HasChildMenus = new("Menu.HasChildMenus", "Không thể xóa menu đang có menu con. Hãy xóa hoặc di chuyển menu con trước.");
}
