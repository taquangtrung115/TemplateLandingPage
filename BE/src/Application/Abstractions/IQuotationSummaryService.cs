namespace OnePortal.Application.Abstractions;

using OnePortal.Contract.Services.V1.Quoting.Quotations;
using OnePortal.Application.UseCases.V1.Queries.Quoting.Quotations;

public interface IQuotationSummaryService
{
    Task<GetQuotationSummaryResult> GetSummaryAsync(DateTime currentMonthUtc, CancellationToken cancellationToken);
}
