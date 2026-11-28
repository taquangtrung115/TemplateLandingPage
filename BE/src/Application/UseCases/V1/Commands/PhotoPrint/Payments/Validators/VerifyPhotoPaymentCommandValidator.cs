namespace OnePortal.Application.UseCases.V1.Commands.PhotoPrint.Payments.Validators;

using FluentValidation;
using OnePortal.Contract.Services.V1.PhotoPrint.Payments;

public sealed class VerifyPhotoPaymentCommandValidator : AbstractValidator<VerifyPhotoPaymentCommand>
{
    public VerifyPhotoPaymentCommandValidator()
    {
        RuleFor(request => request.Input.Status).Must(status => status is "Verified" or "Rejected");
        RuleFor(request => request.Input.ExpectedRevision).GreaterThanOrEqualTo(0);
        RuleFor(request => request.Input.StaffNote).MaximumLength(500);
    }
}
