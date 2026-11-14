namespace OnePortal.Application.Abstractions;

using OnePortal.Application.UseCases.V1.Quoting.Quotations.Queries.Summary;

public interface IQuotationSummaryService
{
    Task<GetQuotationSummaryResult> GetSummaryAsync(DateTime currentMonthUtc, CancellationToken cancellationToken);
}
