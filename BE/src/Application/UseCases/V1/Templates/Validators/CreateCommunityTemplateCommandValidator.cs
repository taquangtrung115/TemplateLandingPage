namespace TemplateLandingPage.Application.UseCases.V1.Templates.Validators;

using System.Text.Json;
using FluentValidation;
using TemplateLandingPage.Contract.Services.V1.Templates;

public sealed class CreateCommunityTemplateCommandValidator : AbstractValidator<CreateCommunityTemplateCommand>
{
    public CreateCommunityTemplateCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Tên template không được để trống.");
        RuleFor(x => x.Slug).NotEmpty().WithMessage("Slug không được để trống.");
        RuleFor(x => x.Category).NotEmpty().WithMessage("Danh mục không được để trống.");
        RuleFor(x => x.ThumbnailUrl).NotEmpty().WithMessage("Thumbnail URL không được để trống.");
        RuleFor(x => x.DefaultConfigJson)
            .NotEmpty().WithMessage("Default config JSON không được để trống.")
            .Must(BeValidJson).WithMessage("Default config JSON không đúng định dạng JSON.");

        RuleFor(x => x.AuthorName)
            .MaximumLength(150).WithMessage("Tên tác giả không được vượt quá 150 ký tự.")
            .When(x => !string.IsNullOrEmpty(x.AuthorName));
    }

    private static bool BeValidJson(string json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return false;
        }

        try
        {
            using var doc = JsonDocument.Parse(json);
            return true;
        }
        catch (JsonException)
        {
            return false;
        }
    }
}
