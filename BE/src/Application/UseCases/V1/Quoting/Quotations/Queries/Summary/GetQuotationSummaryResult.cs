namespace OnePortal.Application.UseCases.V1.Quoting.Quotations.Queries.Summary;

public sealed record GetQuotationSummaryResult(
    int TotalCount, int DraftCount, int SentCount, int ApprovedCount,
    int RejectedCount, int CancelledCount, decimal TotalAmount,
    IReadOnlyDictionary<string, decimal> MonthlyAmounts);
