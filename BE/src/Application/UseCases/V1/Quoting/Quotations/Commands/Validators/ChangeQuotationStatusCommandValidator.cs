namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Quotations.Commands.Validators;

using FluentValidation;
using TemplateLandingPage.Contract.Services.V1.Quoting.Quotations;

public sealed class ChangeQuotationStatusCommandValidator : AbstractValidator<ChangeQuotationStatusCommand>
{
    public ChangeQuotationStatusCommandValidator()
    {
        RuleFor(command => command.Id).NotEmpty().WithMessage("Mã báo giá không hợp lệ.");
        RuleFor(command => command.Status).Must(status => status is not null &&
            new[] { "Draft", "Sent", "Approved", "Rejected", "Cancelled" }.Contains(status.Trim(), StringComparer.OrdinalIgnoreCase))
            .WithMessage("Chọn một trạng thái báo giá hợp lệ.");
        RuleFor(command => command.Reason).MaximumLength(1000).WithMessage("Lý do không được vượt quá 1.000 ký tự.");
    }
}
