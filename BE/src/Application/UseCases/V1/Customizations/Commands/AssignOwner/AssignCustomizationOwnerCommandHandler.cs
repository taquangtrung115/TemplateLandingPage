namespace TemplateLandingPage.Application.UseCases.V1.Customizations.Commands.AssignOwner;

using Microsoft.Extensions.Logging;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Customizations;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Repositories;

public sealed class AssignCustomizationOwnerCommandHandler(ICustomizationRepository repository, IUserRepository users,
    IUnitOfWork unitOfWork, ILogger<AssignCustomizationOwnerCommandHandler> logger)
    : ICommandHandler<AssignCustomizationOwnerCommand, CustomizationMutationResponse>
{
    private readonly ICustomizationRepository _repository = repository;
    private readonly IUserRepository _users = users;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly ILogger _logger = logger;

    public async Task<Result<CustomizationMutationResponse>> Handle(AssignCustomizationOwnerCommand request, CancellationToken cancellationToken)
    {
        if (request.CurrentUserId == Guid.Empty || request.CurrentUserRole != "Admin")
            return Result.Failure<CustomizationMutationResponse>(CustomizationErrors.Unauthorized);
        var site = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (site is null) return Result.Failure<CustomizationMutationResponse>(CustomizationErrors.NotFound);
        if (site.Revision != request.ExpectedRevision || site.UserId.HasValue)
            return Result.Failure<CustomizationMutationResponse>(CustomizationErrors.Conflict);
        var user = await _users.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null || !user.IsActive)
            return Result.Failure<CustomizationMutationResponse>(CustomizationErrors.InvalidRequest);
        site.AssignOwner(user.Id);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Assigned site {SiteId} to user {UserId} by administrator {ActorId}", site.Id, user.Id, request.CurrentUserId);
        return Result.Success(new CustomizationMutationResponse(site.Id, site.Revision));
    }
}
