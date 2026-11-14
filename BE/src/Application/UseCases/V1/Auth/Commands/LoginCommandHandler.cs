namespace OnePortal.Application.UseCases.V1.Auth.Commands;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Auth;
using OnePortal.Domain.Repositories;

public sealed class LoginCommandHandler : ICommandHandler<LoginCommand, LoginResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public LoginCommandHandler(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<Result<LoginResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (user is null)
        {
            return Result.Failure<LoginResponse>(AuthErrors.InvalidCredentials);
        }

        if (!user.IsActive)
        {
            return Result.Failure<LoginResponse>(AuthErrors.UserInactive);
        }

        if (!_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return Result.Failure<LoginResponse>(AuthErrors.InvalidCredentials);
        }

        var token = _jwtTokenGenerator.GenerateToken(user);
        var userResponse = new UserResponse(user.Id, user.Email, user.FullName, "User", user.IsActive, user.AvatarUrl, user.CreatedAtUtc, user.IsPlatformAdmin);

        return Result.Success(new LoginResponse(token, userResponse));
    }
}
