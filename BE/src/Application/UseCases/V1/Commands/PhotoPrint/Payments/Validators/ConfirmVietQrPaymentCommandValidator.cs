namespace OnePortal.Application.UseCases.V1.Commands.PhotoPrint.Payments.Validators;

using FluentValidation;
using OnePortal.Contract.Services.V1.PhotoPrint.Payments;

public sealed class ConfirmVietQrPaymentCommandValidator : AbstractValidator<ConfirmVietQrPaymentCommand>
{
    public ConfirmVietQrPaymentCommandValidator()
    {
        RuleFor(request => request.Input.OrderCode).NotEmpty().MaximumLength(40);
        RuleFor(request => request.Input.CustomerPhone).NotEmpty().MaximumLength(30);
        RuleFor(request => request.Input.BankCode).NotEmpty().MaximumLength(8);
        RuleFor(request => request.Input.BankAccountNumber).NotEmpty().Matches("^[0-9]{1,19}$");
        RuleFor(request => request.Input.Amount).GreaterThan(0);
        RuleFor(request => request.Input.TransferMemo).NotEmpty().MaximumLength(25);
        RuleFor(request => request.Input.Note).MaximumLength(500);
    }
}
