namespace TemplateLandingPage.Application.UseCases.V1.NavigationMenus.Queries;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.NavigationMenus;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;

public sealed class GetNavigationMenusQueryHandler : IQueryHandler<GetNavigationMenusQuery, List<NavigationMenuResponse>>
{
    private readonly INavigationMenuRepository _navigationMenuRepository;

    public GetNavigationMenusQueryHandler(INavigationMenuRepository navigationMenuRepository)
    {
        _navigationMenuRepository = navigationMenuRepository;
    }

    public async Task<Result<List<NavigationMenuResponse>>> Handle(GetNavigationMenusQuery request, CancellationToken cancellationToken)
    {
        var roots = await _navigationMenuRepository.GetTreeAsync(request.IsActiveOnly, cancellationToken);
        var response = roots.Select(MapToResponse).ToList();
        return Result.Success(response);
    }

    private static NavigationMenuResponse MapToResponse(NavigationMenu menu)
    {
        return new NavigationMenuResponse(
            menu.Id,
            menu.Title,
            menu.Url,
            menu.ParentId,
            menu.OrderIndex,
            menu.Target,
            menu.Badge,
            menu.BadgeColor,
            menu.Icon,
            menu.IsActive,
            menu.CreatedAtUtc,
            menu.SubMenus?
                .Where(s => !s.IsDeleted)
                .OrderBy(s => s.OrderIndex)
                .Select(MapToResponse)
                .ToList() ?? new List<NavigationMenuResponse>());
    }
}
