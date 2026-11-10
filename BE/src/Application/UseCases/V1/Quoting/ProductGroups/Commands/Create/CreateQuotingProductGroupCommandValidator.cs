namespace TemplateLandingPage.Application.UseCases.V1.Quoting.ProductGroups.Commands.Create;
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
