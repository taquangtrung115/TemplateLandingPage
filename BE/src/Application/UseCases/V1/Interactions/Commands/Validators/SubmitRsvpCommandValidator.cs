namespace OnePortal.Application.UseCases.V1.Interactions.Commands.Validators;

using FluentValidation;
using OnePortal.Contract.Services.V1.Interactions;

public sealed class SubmitRsvpCommandValidator : AbstractValidator<SubmitRsvpCommand>
{
    public SubmitRsvpCommandValidator()
    {
        RuleFor(x => x.CustomizationVersionId)
            .NotNull().WithMessage("CustomizationVersionId is required.")
            .NotEqual(Guid.Empty).WithMessage("CustomizationVersionId is required.");
        RuleFor(x => x.GuestName).NotEmpty().WithMessage("Tên khách mời không được để trống.");
        RuleFor(x => x.AttendingStatus).NotEmpty().WithMessage("Trạng thái tham dự không được để trống.");
        RuleFor(x => x.NumberOfGuests).GreaterThanOrEqualTo(1).WithMessage("Số lượng khách tối thiểu là 1.");
    }
}
