namespace OnePortal.Contract.Services.V1.Quoting.Quotations;

using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;

public record GetQuotationsQuery(
    string? Status = null,
    Guid? CustomerId = null,
    string? SearchTerm = null,
    int PageIndex = 1,
    int PageSize = 20) : IQuery<PagedResponse<QuotationResponse>>;

public record GetQuotationByIdQuery(Guid Id) : IQuery<QuotationDetailResponse>;

public record GetQuotationHistoriesQuery(Guid QuotationId) : IQuery<List<QuotationHistoryResponse>>;

public record GetQuotationFilesQuery(Guid QuotationId) : IQuery<List<QuotationFileResponse>>;

public record PreviewQuotationQuery(Guid QuotationId, decimal? TaxPercent = null) : IQuery<QuotationPreviewResponse>;

public sealed record DownloadQuotationFileQuery(Guid QuotationId, Guid FileId) : IQuery<DownloadQuotationFileResult>;

public sealed record PreviewQuotationDraftQuery(CreateQuotationCommand Draft) : IQuery<PreviewQuotationDraftResult>;

public sealed record GetQuotationSummaryQuery : IQuery<GetQuotationSummaryResult>;
