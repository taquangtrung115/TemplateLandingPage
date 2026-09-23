namespace TemplateLandingPage.Application.UseCases.V1.Auth.Validators;

using FluentValidation;
using TemplateLandingPage.Contract.Services.V1.Auth;

public sealed class ExternalLoginCommandValidator : AbstractValidator<ExternalLoginCommand>
{
    private static readonly string[] AllowedProviders = ["Google", "Facebook"];

    public ExternalLoginCommandValidator()
    {
        RuleFor(x => x.Provider)
            .NotEmpty().WithMessage("Nhà cung cấp xác thực không được để trống.")
            .Must(p => AllowedProviders.Contains(p, StringComparer.OrdinalIgnoreCase))
            .WithMessage("Nhà cung cấp xác thực không được hỗ trợ. Chỉ hỗ trợ Google hoặc Facebook.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email không được để trống.")
            .EmailAddress().WithMessage("Email không hợp lệ.")
            .MaximumLength(255).WithMessage("Email không được vượt quá 255 ký tự.");

        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Họ và tên không được để trống.")
            .MaximumLength(100).WithMessage("Họ và tên không được vượt quá 100 ký tự.");
    }
}
