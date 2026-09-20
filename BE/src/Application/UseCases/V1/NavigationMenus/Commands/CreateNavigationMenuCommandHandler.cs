namespace TemplateLandingPage.Application.UseCases.V1.NavigationMenus.Commands;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.NavigationMenus;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;

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
