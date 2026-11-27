namespace OnePortal.Application.UseCases.V1.Queries.Quoting.Quotations.Validators;

using OnePortal.Contract.Services.V1.Quoting.Quotations;
using FluentValidation;
using OnePortal.Application.UseCases.V1.Commands.Quoting.Quotations.Validators;

public sealed class PreviewQuotationDraftQueryValidator : AbstractValidator<PreviewQuotationDraftQuery>
{
    public PreviewQuotationDraftQueryValidator() => RuleFor(query => query.Draft).SetValidator(new CreateQuotationCommandValidator());
}
