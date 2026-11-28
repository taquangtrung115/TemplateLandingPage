namespace OnePortal.Application.UseCases.V1.Commands.Tenancy.Validators;

using FluentValidation;
using OnePortal.Contract.Services.V1.Tenancy;

public sealed class SetTenantWorkspaceMembershipCommandValidator : AbstractValidator<SetTenantWorkspaceMembershipCommand>
{
    public SetTenantWorkspaceMembershipCommandValidator()
    {
        RuleFor(request => request.TenantId).NotEmpty();
        RuleFor(request => request.Email).NotEmpty().MaximumLength(256).EmailAddress();
        RuleFor(request => request.Role).Must(role => role is null or "User" or "Admin");
        When(request => !string.IsNullOrEmpty(request.NewPassword), () =>
        {
            RuleFor(request => request.FullName).NotEmpty().MaximumLength(100);
            RuleFor(request => request.Role).NotEmpty();
            RuleFor(request => request.NewPassword).Length(8, 128);
        });
    }
}
