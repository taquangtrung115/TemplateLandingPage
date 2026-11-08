namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Quotations.Queries.Download;

using TemplateLandingPage.Contract.Abstractions.Message;

public sealed record DownloadQuotationFileQuery(Guid QuotationId, Guid FileId) : IQuery<DownloadQuotationFileResult>;
