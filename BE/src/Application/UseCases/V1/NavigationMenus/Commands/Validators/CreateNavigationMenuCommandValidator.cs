namespace OnePortal.Application.UseCases.V1.NavigationMenus.Commands.Validators;

using FluentValidation;
using OnePortal.Contract.Services.V1.NavigationMenus;

public sealed class CreateNavigationMenuCommandValidator : AbstractValidator<CreateNavigationMenuCommand>
{
    public CreateNavigationMenuCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().WithMessage("Tiêu đề menu không được để trống.");
        RuleFor(x => x.Url).NotEmpty().WithMessage("Đường dẫn (URL) không được để trống.");
    }
}
