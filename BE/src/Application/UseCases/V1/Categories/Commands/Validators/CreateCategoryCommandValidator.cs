namespace OnePortal.Application.UseCases.V1.Categories.Commands.Validators;

using FluentValidation;
using OnePortal.Contract.Services.V1.Categories;

public sealed class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
{
    public CreateCategoryCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Tên danh mục không được để trống.");
        RuleFor(x => x.Slug).NotEmpty().WithMessage("Slug không được để trống.");
    }
}
