namespace OnePortal.Application.UseCases.V1.NavigationMenus.Queries;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.NavigationMenus;
using OnePortal.Domain.Repositories;

public sealed class GetNavigationMenuByIdQueryHandler : IQueryHandler<GetNavigationMenuByIdQuery, NavigationMenuResponse>
{
    private readonly INavigationMenuRepository _navigationMenuRepository;

    public GetNavigationMenuByIdQueryHandler(INavigationMenuRepository navigationMenuRepository)
    {
        _navigationMenuRepository = navigationMenuRepository;
    }

    public async Task<Result<NavigationMenuResponse>> Handle(GetNavigationMenuByIdQuery request, CancellationToken cancellationToken)
    {
        var menu = await _navigationMenuRepository.GetVisibleByIdAsync(request.Id, request.IncludeInactive, cancellationToken);
        if (menu is null)
        {
            return Result.Failure<NavigationMenuResponse>(NavigationMenuErrors.NotFound);
        }

        var response = new NavigationMenuResponse(
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
                .Where(s => !s.IsDeleted && (request.IncludeInactive || s.IsActive))
                .OrderBy(s => s.OrderIndex)
                .Select(s => new NavigationMenuResponse(
                    s.Id,
                    s.Title,
                    s.Url,
                    s.ParentId,
                    s.OrderIndex,
                    s.Target,
                    s.Badge,
                    s.BadgeColor,
                    s.Icon,
                    s.IsActive,
                    s.CreatedAtUtc,
                    new List<NavigationMenuResponse>()))
                .ToList() ?? new List<NavigationMenuResponse>());

        return Result.Success(response);
    }
}
