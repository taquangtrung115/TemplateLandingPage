namespace TemplateLandingPage.Application.UseCases.V1.Customizations.Commands.Validators;
using FluentValidation;
using TemplateLandingPage.Application.UseCases.V1.Customizations.Helpers;
using TemplateLandingPage.Contract.Services.V1.Customizations;

public sealed class UpdateCustomizationCommandValidator : AbstractValidator<UpdateCustomizationCommand>
{
    public UpdateCustomizationCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.CurrentUserId).NotEmpty();
        RuleFor(x => x.RequestId).NotEmpty();
        RuleFor(x => x.ExpectedRevision).NotNull().GreaterThan(0);
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Slug).Must(CustomizationRules.IsValidSlug).WithMessage("Slug tối đa 200 ký tự, gồm chữ thường, số và dấu gạch nối.");
        RuleFor(x => x.ConfigJson).Must(CustomizationRules.IsValidConfig).WithMessage("Cấu hình phải là JSON object hợp lệ, tối đa 2 MB.");
    }
}
