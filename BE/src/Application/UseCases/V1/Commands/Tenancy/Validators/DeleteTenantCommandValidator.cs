namespace OnePortal.Application.UseCases.V1.Commands.Tenancy.Validators;

using FluentValidation;
using OnePortal.Contract.Services.V1.Tenancy;

public sealed class DeleteTenantCommandValidator : AbstractValidator<DeleteTenantCommand>
{
    public DeleteTenantCommandValidator()
    {
        RuleFor(request => request.TenantId).NotEmpty();
        RuleFor(request => request.ConfirmKey).NotEmpty().MaximumLength(63);
    }
}
