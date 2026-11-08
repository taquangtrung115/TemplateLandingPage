namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Support.Commands.ChangeStatus;
using FluentValidation;
public sealed class ChangeQuotingSupportStatusCommandValidator : AbstractValidator<ChangeQuotingSupportStatusCommand>
{
    public ChangeQuotingSupportStatusCommandValidator()
    {
        RuleFor(request => request.Id).NotEmpty();
        RuleFor(request => request.UserId).NotEmpty();
        RuleFor(request => request.ExpectedRevision).GreaterThanOrEqualTo(0);
        RuleFor(request => request.Status).Must(status => new[] { "New", "InProgress", "Resolved" }.Contains(status)).WithMessage("Trạng thái hỗ trợ không hợp lệ.");
    }
}
