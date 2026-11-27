namespace OnePortal.Application.UseCases.V1.Commands.Quoting.ProductGroups.Validators;
using OnePortal.Contract.Services.V1.Quoting.ProductGroups;
using FluentValidation;
public sealed class CreateQuotingProductGroupCommandValidator : AbstractValidator<CreateQuotingProductGroupCommand>
{
    public CreateQuotingProductGroupCommandValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Description).MaximumLength(1000);
        RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0);
    }
}
