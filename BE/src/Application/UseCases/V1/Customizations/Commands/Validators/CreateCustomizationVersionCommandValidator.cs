namespace TemplateLandingPage.Application.UseCases.V1.Customizations.Commands.Validators;
using FluentValidation;
using TemplateLandingPage.Application.UseCases.V1.Customizations.Helpers;
using TemplateLandingPage.Contract.Services.V1.Customizations;

public sealed class CreateCustomizationVersionCommandValidator : AbstractValidator<CreateCustomizationVersionCommand>
{
    public CreateCustomizationVersionCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.CurrentUserId).NotEmpty();
        RuleFor(x => x.RequestId).NotEmpty();
        RuleFor(x => x.ExpectedRevision).GreaterThan(0);
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Slug).Must(CustomizationRules.IsValidSlug).WithMessage("Đường dẫn không hợp lệ.");
        RuleFor(x => x.ConfigJson).Must(CustomizationRules.IsValidConfig).WithMessage("Cấu hình phải là JSON object hợp lệ, tối đa 2 MB.");
    }
}
