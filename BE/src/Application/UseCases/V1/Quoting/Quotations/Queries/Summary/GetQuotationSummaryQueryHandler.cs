namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Quotations.Queries.Summary;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;

public sealed class GetQuotationSummaryQueryHandler(IQuotationSummaryService summaryService)
    : IQueryHandler<GetQuotationSummaryQuery, GetQuotationSummaryResult>
{
    public async Task<Result<GetQuotationSummaryResult>> Handle(GetQuotationSummaryQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        return Result.Success(await summaryService.GetSummaryAsync(new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc), cancellationToken));
    }
}
