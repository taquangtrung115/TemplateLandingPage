namespace TemplateLandingPage.Contract.Services.V1.NavigationMenus;

using TemplateLandingPage.Contract.Abstractions.Message;

public record CreateNavigationMenuCommand(
    string Title,
    string Url,
    Guid? ParentId,
    int OrderIndex,
    string? Target = "_self",
    string? Badge = null,
    string? BadgeColor = null,
    string? Icon = null,
    bool IsActive = true) : ICommand<Guid>;

public record UpdateNavigationMenuCommand(
    Guid Id,
    string Title,
    string Url,
    Guid? ParentId,
    int OrderIndex,
    string? Target,
    string? Badge,
    string? BadgeColor,
    string? Icon,
    bool IsActive) : ICommand;

public record DeleteNavigationMenuCommand(Guid Id) : ICommand;
