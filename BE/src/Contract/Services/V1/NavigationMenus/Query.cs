namespace TemplateLandingPage.Contract.Services.V1.NavigationMenus;

using TemplateLandingPage.Contract.Abstractions.Message;

public record GetNavigationMenusQuery(bool? IsActiveOnly = null) : IQuery<List<NavigationMenuResponse>>;

public record GetNavigationMenuByIdQuery(Guid Id, bool IncludeInactive = false) : IQuery<NavigationMenuResponse>;
