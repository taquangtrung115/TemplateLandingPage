namespace OnePortal.Application.UseCases.V1.Auth.Commands;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Auth;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities;
using OnePortal.Domain.Repositories;

public sealed class RegisterCommandHandler : ICommandHandler<RegisterCommand, Guid>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITenantContext? _tenantContext;

    public RegisterCommandHandler(
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        IPasswordHasher passwordHasher,
        ITenantContext? tenantContext = null)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _tenantContext = tenantContext;
    }

    public async Task<Result<Guid>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        if (_tenantContext?.TenantId is Guid tenantId && !await _userRepository.AllowsSelfRegistrationAsync(tenantId, _tenantContext.AppKey ?? "", cancellationToken))
            return Result.Failure<Guid>(new Error("Auth.RegistrationDisabled", "Workspace này không cho phép tự đăng ký."));
        if (await _userRepository.ExistsByEmailAsync(request.Email, cancellationToken))
        {
            return Result.Failure<Guid>(AuthErrors.DuplicateEmail);
        }

        var passwordHash = _passwordHasher.HashPassword(request.Password);
        var user = User.Create(request.Email, passwordHash, request.FullName, "User");

        _userRepository.Add(user);
        if (_tenantContext?.TenantId is Guid membershipTenantId)
            _userRepository.AddMembership(OnePortal.Domain.Entities.Tenancy.TenantMembership.Create(membershipTenantId, user.Id, _tenantContext.AppKey!, "User"));
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(user.Id);
    }
}
