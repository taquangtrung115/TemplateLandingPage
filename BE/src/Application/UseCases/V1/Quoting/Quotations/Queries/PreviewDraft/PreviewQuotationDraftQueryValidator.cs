namespace OnePortal.Application.UseCases.V1.Quoting.Quotations.Queries.PreviewDraft;

using FluentValidation;
using OnePortal.Application.UseCases.V1.Quoting.Quotations.Commands.Validators;

public sealed class PreviewQuotationDraftQueryValidator : AbstractValidator<PreviewQuotationDraftQuery>
{
    public PreviewQuotationDraftQueryValidator() => RuleFor(query => query.Draft).SetValidator(new CreateQuotationCommandValidator());
}
