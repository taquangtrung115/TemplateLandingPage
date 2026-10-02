namespace TemplateLandingPage.Application.UseCases.V1.Templates.Commands.Validators;

using FluentValidation;
using TemplateLandingPage.Contract.Services.V1.Templates;

public sealed class CreateCommunityTemplateCommandValidator : AbstractValidator<CreateCommunityTemplateCommand>
{
    public CreateCommunityTemplateCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Tên template không được để trống.");
        RuleFor(x => x.Slug).NotEmpty().WithMessage("Slug không được để trống.");
        RuleFor(x => x.SourceCustomizationId).NotEmpty().WithMessage("Trang nguồn không được để trống.");
        RuleFor(x => x.CustomizationVersionId).NotEmpty().WithMessage("Phiên bản nguồn không được để trống.");
        RuleFor(x => x.CategoryId).NotEmpty().WithMessage("Danh mục không hợp lệ.");
        RuleFor(x => x.CurrentUserId).NotEmpty().WithMessage("Tài khoản không hợp lệ.");
        RuleFor(x => x.Name).MaximumLength(200).WithMessage("Tên template không được vượt quá 200 ký tự.");
        RuleFor(x => x.Slug).MaximumLength(200).WithMessage("Slug không được vượt quá 200 ký tự.");
        RuleFor(x => x.Description).MaximumLength(2000).WithMessage("Mô tả không được vượt quá 2000 ký tự.");
        RuleFor(x => x.ThumbnailUrl)
            .NotEmpty().WithMessage("Thumbnail URL không được để trống.")
            .Must(BeSafeHttpUrl).WithMessage("Thumbnail URL phải là địa chỉ HTTP hoặc HTTPS hợp lệ.");
    }

    private static bool BeSafeHttpUrl(string value) =>
        Uri.TryCreate(value, UriKind.Absolute, out var uri) &&
        (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);
}
