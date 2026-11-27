namespace OnePortal.Application.UseCases.V1.Commands.PhotoPrint.Orders.Validators;

using FluentValidation;
using OnePortal.Contract.Services.V1.PhotoPrint.Orders;

public sealed class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(request => request.Input.CustomerName).NotEmpty().MaximumLength(120);
        RuleFor(request => request.Input.CustomerPhone).NotEmpty().MaximumLength(30);
        RuleFor(request => request.Input.Items).NotNull().Must(items => items is { Length: > 0 and <= 50 });
    }
}
