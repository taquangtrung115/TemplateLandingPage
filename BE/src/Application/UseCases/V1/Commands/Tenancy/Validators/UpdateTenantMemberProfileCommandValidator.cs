namespace OnePortal.Application.UseCases.V1.Commands.Tenancy.Validators;

using FluentValidation;
using OnePortal.Contract.Services.V1.Tenancy;

public sealed class UpdateTenantMemberProfileCommandValidator : AbstractValidator<UpdateTenantMemberProfileCommand>
{
    public UpdateTenantMemberProfileCommandValidator()
    {
        RuleFor(request => request.TenantId).NotEmpty();
        RuleFor(request => request.UserId).NotEmpty();
        RuleFor(request => request.FullName).NotEmpty().MaximumLength(100);
        RuleFor(request => request.NewPassword).Length(8, 128).When(request => !string.IsNullOrEmpty(request.NewPassword));
    }
}
