namespace TemplateLandingPage.Application.UseCases.V1.Categories.Commands.Validators;

using FluentValidation;
using TemplateLandingPage.Contract.Services.V1.Categories;

public sealed class UpdateCategoryCommandValidator : AbstractValidator<UpdateCategoryCommand>
{
    public UpdateCategoryCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Id không được để trống.");
        RuleFor(x => x.Name).NotEmpty().WithMessage("Tên danh mục không được để trống.");
        RuleFor(x => x.Slug).NotEmpty().WithMessage("Slug không được để trống.");
    }
}
