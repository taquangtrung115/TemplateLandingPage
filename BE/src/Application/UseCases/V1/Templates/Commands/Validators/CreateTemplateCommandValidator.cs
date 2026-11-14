namespace OnePortal.Application.UseCases.V1.Templates.Commands.Validators;

using FluentValidation;
using OnePortal.Application.Common.Validation;
using OnePortal.Contract.Services.V1.Templates;

public sealed class CreateTemplateCommandValidator : AbstractValidator<CreateTemplateCommand>
{
    public CreateTemplateCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Tên template không được để trống.").MaximumLength(200);
        RuleFor(x => x.Slug).NotEmpty().WithMessage("Slug không được để trống.")
            .MaximumLength(200).Must(value => value is not null && System.Text.RegularExpressions.Regex.IsMatch(value.Trim(), "^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$"))
            .WithMessage("Slug chỉ gồm chữ, số và dấu gạch nối.");
        RuleFor(x => x.Category).NotEmpty().WithMessage("Danh mục không được để trống.").MaximumLength(100);
        RuleFor(x => x.ThumbnailUrl).NotEmpty().WithMessage("Thumbnail URL không được để trống.").MaximumLength(1000);
        RuleFor(x => x.Description).MaximumLength(1000);
        RuleFor(x => x.PreviewUrl).MaximumLength(1000);
        RuleFor(x => x.LongPreviewUrl).MaximumLength(1000);
        RuleFor(x => x.AudioUrl).MaximumLength(1000);
        RuleFor(x => x.Badge).MaximumLength(50);
        RuleFor(x => x.MusicTitle).MaximumLength(200);
        RuleFor(x => x.DefaultConfigJson).Must(LandingPageConfigRules.IsValid)
            .WithMessage("Default config phải là JSON object hợp lệ, đúng kiểu dữ liệu và không quá 2 MB.");
    }
}
