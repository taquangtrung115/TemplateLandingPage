namespace TemplateLandingPage.Application.UseCases.V1.Interactions.Validators;

using FluentValidation;
using TemplateLandingPage.Contract.Services.V1.Interactions;

public sealed class SubmitGuestbookCommandValidator : AbstractValidator<SubmitGuestbookCommand>
{
    public SubmitGuestbookCommandValidator()
    {
        RuleFor(x => x.SenderName).NotEmpty().WithMessage("Tên người gửi không được để trống.");
        RuleFor(x => x.Message).NotEmpty().WithMessage("Lời chúc không được để trống.");
    }
}
