namespace OnePortal.Application.UseCases.V1.Products.Commands.Validators;

using FluentValidation;
using OnePortal.Contract.Services.V1.Products;

public sealed class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Product name is required.")
            .MaximumLength(200).WithMessage("Product name must not exceed 200 characters.");

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Product price must be greater than zero.");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Product description must not exceed 1000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Description));
    }
}
