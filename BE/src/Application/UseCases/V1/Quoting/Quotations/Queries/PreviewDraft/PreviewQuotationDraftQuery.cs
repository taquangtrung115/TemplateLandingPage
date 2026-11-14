namespace OnePortal.Application.UseCases.V1.Quoting.Quotations.Queries.PreviewDraft;

using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Services.V1.Quoting.Quotations;

public sealed record PreviewQuotationDraftQuery(CreateQuotationCommand Draft) : IQuery<PreviewQuotationDraftResult>;
