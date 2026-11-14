namespace OnePortal.Application.UseCases.V1.NavigationMenus.Commands;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.NavigationMenus;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Repositories;

public sealed class UpdateNavigationMenuCommandHandler : ICommandHandler<UpdateNavigationMenuCommand>
{
    private readonly INavigationMenuRepository _navigationMenuRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateNavigationMenuCommandHandler(
        INavigationMenuRepository navigationMenuRepository,
        IUnitOfWork unitOfWork)
    {
        _navigationMenuRepository = navigationMenuRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(UpdateNavigationMenuCommand request, CancellationToken cancellationToken)
    {
        var menu = await _navigationMenuRepository.GetByIdAsync(request.Id, cancellationToken);
        if (menu is null)
        {
            return Result.Failure(NavigationMenuErrors.NotFound);
        }

        if (request.ParentId.HasValue)
        {
            if (request.ParentId.Value == request.Id)
            {
                return Result.Failure(NavigationMenuErrors.CannotBeSelfParent);
            }

            var parent = await _navigationMenuRepository.GetByIdAsync(request.ParentId.Value, cancellationToken);
            if (parent is null)
            {
                return Result.Failure(NavigationMenuErrors.ParentNotFound);
            }
        }

        menu.Update(
            request.Title,
            request.Url,
            request.ParentId,
            request.OrderIndex,
            request.Target,
            request.Badge,
            request.BadgeColor,
            request.Icon,
            request.IsActive);

        _navigationMenuRepository.Update(menu);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
