namespace OnePortal.Application.UseCases.V1.NavigationMenus.Commands;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.NavigationMenus;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Repositories;

public sealed class DeleteNavigationMenuCommandHandler : ICommandHandler<DeleteNavigationMenuCommand>
{
    private readonly INavigationMenuRepository _navigationMenuRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteNavigationMenuCommandHandler(
        INavigationMenuRepository navigationMenuRepository,
        IUnitOfWork unitOfWork)
    {
        _navigationMenuRepository = navigationMenuRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteNavigationMenuCommand request, CancellationToken cancellationToken)
    {
        var menu = await _navigationMenuRepository.GetByIdAsync(request.Id, cancellationToken);
        if (menu is null)
        {
            return Result.Failure(NavigationMenuErrors.NotFound);
        }

        var hasChildren = await _navigationMenuRepository.HasChildrenAsync(request.Id, cancellationToken);
        if (hasChildren)
        {
            return Result.Failure(NavigationMenuErrors.HasChildMenus);
        }

        menu.Delete();
        _navigationMenuRepository.Update(menu);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
