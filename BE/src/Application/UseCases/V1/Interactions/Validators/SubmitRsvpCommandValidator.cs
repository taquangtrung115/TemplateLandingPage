namespace TemplateLandingPage.Application.UseCases.V1.Interactions.Validators;

using FluentValidation;
using TemplateLandingPage.Contract.Services.V1.Interactions;

public sealed class SubmitRsvpCommandValidator : AbstractValidator<SubmitRsvpCommand>
{
    public SubmitRsvpCommandValidator()
    {
        RuleFor(x => x.GuestName).NotEmpty().WithMessage("Tên khách mời không được để trống.");
        RuleFor(x => x.AttendingStatus).NotEmpty().WithMessage("Trạng thái tham dự không được để trống.");
        RuleFor(x => x.NumberOfGuests).GreaterThanOrEqualTo(1).WithMessage("Số lượng khách tối thiểu là 1.");
    }
}
