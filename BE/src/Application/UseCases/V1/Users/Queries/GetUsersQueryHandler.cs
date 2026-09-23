namespace TemplateLandingPage.Application.UseCases.V1.Users.Queries;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Auth;
using TemplateLandingPage.Contract.Services.V1.Users;
using TemplateLandingPage.Domain.Repositories;

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
