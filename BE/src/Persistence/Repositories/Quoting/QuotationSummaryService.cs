namespace TemplateLandingPage.Persistence.Repositories.Quoting;

using Microsoft.EntityFrameworkCore;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Application.UseCases.V1.Quoting.Quotations.Queries.Summary;

public sealed class QuotationSummaryService(ApplicationDbContext context) : IQuotationSummaryService
{
    #region Queries
    public async Task<GetQuotationSummaryResult> GetSummaryAsync(DateTime currentMonthUtc, CancellationToken cancellationToken)
    {
        var query = context.Quotations.AsNoTracking().Where(quotation => !quotation.IsDeleted);
        var summary = await query.GroupBy(quotation => 1).Select(group => new
        {
            Total = group.Count(),
            Draft = group.Count(quotation => quotation.Status == "Draft"),
            Sent = group.Count(quotation => quotation.Status == "Sent"),
            Approved = group.Count(quotation => quotation.Status == "Approved"),
            Rejected = group.Count(quotation => quotation.Status == "Rejected"),
            Cancelled = group.Count(quotation => quotation.Status == "Cancelled"),
            Amount = group.Sum(quotation => quotation.TotalAmount)
        }).SingleOrDefaultAsync(cancellationToken);

        var from = currentMonthUtc.AddMonths(-5);
        var until = currentMonthUtc.AddMonths(1);
        var amounts = await query.Where(quotation => quotation.IssueDate >= from && quotation.IssueDate < until)
            .GroupBy(quotation => new { quotation.IssueDate.Year, quotation.IssueDate.Month })
            .Select(group => new { group.Key.Year, group.Key.Month, Amount = group.Sum(quotation => quotation.TotalAmount) })
            .ToListAsync(cancellationToken);
        var monthly = Enumerable.Range(0, 6).ToDictionary(index => from.AddMonths(index).ToString("yyyy-MM"), _ => 0m);
        foreach (var amount in amounts) monthly[$"{amount.Year:D4}-{amount.Month:D2}"] = amount.Amount;

        return new GetQuotationSummaryResult(summary?.Total ?? 0, summary?.Draft ?? 0, summary?.Sent ?? 0,
            summary?.Approved ?? 0, summary?.Rejected ?? 0, summary?.Cancelled ?? 0, summary?.Amount ?? 0, monthly);
    }
    #endregion
}
