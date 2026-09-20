namespace TemplateLandingPage.Application.UseCases.V1.Customizations.Validators;

using FluentValidation;
using TemplateLandingPage.Contract.Services.V1.Customizations;

public sealed class UpdateCustomizationCommandValidator : AbstractValidator<UpdateCustomizationCommand>
{
    public UpdateCustomizationCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Id không được để trống.");
        RuleFor(x => x.Title).NotEmpty().WithMessage("Tiêu đề không được để trống.");
        RuleFor(x => x.Slug).NotEmpty().WithMessage("Slug không được để trống.");
        RuleFor(x => x.ConfigJson).NotEmpty().WithMessage("Config JSON không được để trống.");
    }
}
