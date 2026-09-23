namespace TemplateLandingPage.Application.UseCases.V1.Auth.Commands;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Auth;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;

public sealed class ExternalLoginCommandHandler : ICommandHandler<ExternalLoginCommand, LoginResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public ExternalLoginCommandHandler(
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        IJwtTokenGenerator jwtTokenGenerator)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<Result<LoginResponse>> Handle(ExternalLoginCommand request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);

        if (user is not null)
        {
            // Case 1: Tài khoản đã bị khóa
            if (!user.IsActive)
            {
                return Result.Failure<LoginResponse>(AuthErrors.UserInactive);
            }

            // Case 2: Account Linking & Cập nhật Avatar/FullName nếu chưa có
            user.UpdateExternalProfile(request.FullName, request.AvatarUrl, request.Provider);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        else
        {
            // Case 3: Seed user mới (JIT Provisioning)
            user = User.CreateExternal(
                email: normalizedEmail,
                fullName: request.FullName,
                avatarUrl: request.AvatarUrl,
                provider: request.Provider,
                role: "User");

            _userRepository.Add(user);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        // Tạo JWT Token của hệ thống
        var token = _jwtTokenGenerator.GenerateToken(user);
        var userResponse = new UserResponse(
            user.Id,
            user.Email,
            user.FullName,
            user.Role,
            user.IsActive,
            user.AvatarUrl,
            user.CreatedAtUtc);

        return Result.Success(new LoginResponse(token, userResponse));
    }
}
