namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Templates.Commands.Validators;

using FluentValidation;
using TemplateLandingPage.Contract.Services.V1.Quoting.Templates;

public sealed class CreateTemplateVersionCommandValidator : AbstractValidator<CreateTemplateVersionCommand>
{
    public CreateTemplateVersionCommandValidator()
    {
        RuleFor(x => x.TemplateId)
            .NotEmpty().WithMessage("ID mẫu báo giá không hợp lệ.");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Tiêu đề báo giá không được để trống.")
            .MaximumLength(250).WithMessage("Tiêu đề báo giá tối đa 250 ký tự.");
    }
}
