namespace OnePortal.Application.UseCases.V1.NavigationMenus.Commands;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.NavigationMenus;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities;
using OnePortal.Domain.Repositories;

public sealed class CreateNavigationMenuCommandHandler : ICommandHandler<CreateNavigationMenuCommand, Guid>
{
    private readonly INavigationMenuRepository _navigationMenuRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateNavigationMenuCommandHandler(
        INavigationMenuRepository navigationMenuRepository,
        IUnitOfWork unitOfWork)
    {
        _navigationMenuRepository = navigationMenuRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(CreateNavigationMenuCommand request, CancellationToken cancellationToken)
    {
        if (request.ParentId.HasValue)
        {
            var parent = await _navigationMenuRepository.GetByIdAsync(request.ParentId.Value, cancellationToken);
            if (parent is null)
            {
                return Result.Failure<Guid>(NavigationMenuErrors.ParentNotFound);
            }
        }

        var menu = NavigationMenu.Create(
            request.Title,
            request.Url,
            request.ParentId,
            request.OrderIndex,
            request.Target,
            request.Badge,
            request.BadgeColor,
            request.Icon,
            request.IsActive);

        _navigationMenuRepository.Add(menu);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(menu.Id);
    }
}
