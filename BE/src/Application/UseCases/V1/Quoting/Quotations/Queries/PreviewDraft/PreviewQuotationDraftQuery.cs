namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Quotations.Queries.PreviewDraft;

using TemplateLandingPage.Contract.Abstractions.Message;
using TemplateLandingPage.Contract.Services.V1.Quoting.Quotations;

public sealed record PreviewQuotationDraftQuery(CreateQuotationCommand Draft) : IQuery<PreviewQuotationDraftResult>;
