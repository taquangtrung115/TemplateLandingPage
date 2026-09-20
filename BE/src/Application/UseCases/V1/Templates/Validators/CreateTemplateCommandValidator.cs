namespace TemplateLandingPage.Application.UseCases.V1.Templates.Validators;

using FluentValidation;
using TemplateLandingPage.Contract.Services.V1.Templates;

public sealed class CreateTemplateCommandValidator : AbstractValidator<CreateTemplateCommand>
{
    public CreateTemplateCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Tên template không được để trống.");
        RuleFor(x => x.Slug).NotEmpty().WithMessage("Slug không được để trống.");
        RuleFor(x => x.Category).NotEmpty().WithMessage("Danh mục không được để trống.");
        RuleFor(x => x.ThumbnailUrl).NotEmpty().WithMessage("Thumbnail URL không được để trống.");
        RuleFor(x => x.DefaultConfigJson).NotEmpty().WithMessage("Default config JSON không được để trống.");
    }
}
