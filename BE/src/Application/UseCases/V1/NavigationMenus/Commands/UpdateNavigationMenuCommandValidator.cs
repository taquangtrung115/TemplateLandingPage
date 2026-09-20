namespace TemplateLandingPage.Application.UseCases.V1.NavigationMenus.Commands;

using FluentValidation;
using TemplateLandingPage.Contract.Services.V1.NavigationMenus;

public sealed class UpdateNavigationMenuCommandValidator : AbstractValidator<UpdateNavigationMenuCommand>
{
    public UpdateNavigationMenuCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Id không được để trống.");
        RuleFor(x => x.Title).NotEmpty().WithMessage("Tiêu đề menu không được để trống.");
        RuleFor(x => x.Url).NotEmpty().WithMessage("Đường dẫn (URL) không được để trống.");
    }
}
