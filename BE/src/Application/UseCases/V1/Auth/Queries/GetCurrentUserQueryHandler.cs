namespace OnePortal.Application.UseCases.V1.Auth.Queries;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Auth;
using OnePortal.Contract.Services.V1.Users;
using OnePortal.Domain.Repositories;

public sealed class GetCurrentUserQueryHandler : IQueryHandler<GetCurrentUserQuery, UserResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IRequestActor? _actor;

    public GetCurrentUserQueryHandler(IUserRepository userRepository, IRequestActor? actor = null)
    {
        _userRepository = userRepository;
        _actor = actor;
    }

    public async Task<Result<UserResponse>> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null)
        {
            return Result.Failure<UserResponse>(UserErrors.NotFound);
        }

        var response = new UserResponse(
            user.Id,
            user.Email,
            user.FullName,
            _actor?.Role ?? "User",
            user.IsActive,
            user.AvatarUrl,
            user.CreatedAtUtc, user.IsPlatformAdmin);

        return Result.Success(response);
    }
}
