namespace OnePortal.Application.UseCases.V1.Queries.Quoting.Quotations;

using OnePortal.Contract.Services.V1.Quoting.Quotations;
using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;

public sealed class GetQuotationSummaryQueryHandler(IQuotationSummaryService summaryService)
    : IQueryHandler<GetQuotationSummaryQuery, GetQuotationSummaryResult>
{
    public async Task<Result<GetQuotationSummaryResult>> Handle(GetQuotationSummaryQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        return Result.Success(await summaryService.GetSummaryAsync(new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc), cancellationToken));
    }
}
