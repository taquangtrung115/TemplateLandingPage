namespace OnePortal.Application.UseCases.V1.Users.Queries;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Auth;
using OnePortal.Contract.Services.V1.Users;
using OnePortal.Domain.Repositories;

public sealed class GetUserByIdQueryHandler : IQueryHandler<GetUserByIdQuery, UserResponse>
{
    private readonly IUserRepository _userRepository;

    public GetUserByIdQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Result<UserResponse>> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.Id, cancellationToken);
        if (user is null)
        {
            return Result.Failure<UserResponse>(UserErrors.NotFound);
        }

        var response = new UserResponse(
            user.Id,
            user.Email,
            user.FullName,
            user.Role,
            user.IsActive,
            user.AvatarUrl,
            user.CreatedAtUtc);

        return Result.Success(response);
    }
}
