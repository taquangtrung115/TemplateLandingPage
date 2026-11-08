namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Templates.Commands.Validators;

using FluentValidation;
using TemplateLandingPage.Contract.Services.V1.Quoting.Templates;

public sealed class CreateQuotationTemplateCommandValidator : AbstractValidator<CreateQuotationTemplateCommand>
{
    public CreateQuotationTemplateCommandValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Mã mẫu báo giá không được để trống.")
            .MaximumLength(50).WithMessage("Mã mẫu báo giá tối đa 50 ký tự.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên mẫu báo giá không được để trống.")
            .MaximumLength(250).WithMessage("Tên mẫu báo giá tối đa 250 ký tự.");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Tiêu đề báo giá không được để trống.")
            .MaximumLength(250).WithMessage("Tiêu đề báo giá tối đa 250 ký tự.");
    }
}
