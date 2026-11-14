namespace OnePortal.Application.UseCases.V1.Users.Queries;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Auth;
using OnePortal.Contract.Services.V1.Users;
using OnePortal.Domain.Repositories;

public sealed class GetUsersQueryHandler : IQueryHandler<GetUsersQuery, List<UserResponse>>
{
    private readonly IUserRepository _userRepository;

    public GetUsersQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Result<List<UserResponse>>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var users = await _userRepository.GetAllAsync(cancellationToken);
        var response = users.Select(u => new UserResponse(
            u.Id,
            u.Email,
            u.FullName,
            u.Role,
            u.IsActive,
            u.AvatarUrl,
            u.CreatedAtUtc)).ToList();

        return Result.Success(response);
    }
}
