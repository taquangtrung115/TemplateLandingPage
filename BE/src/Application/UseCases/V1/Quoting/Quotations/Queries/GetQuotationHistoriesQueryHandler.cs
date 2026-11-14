namespace OnePortal.Application.UseCases.V1.Quoting.Quotations.Queries;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Quoting.Quotations;
using OnePortal.Domain.Repositories.Quoting;

public sealed class GetQuotationHistoriesQueryHandler : IQueryHandler<GetQuotationHistoriesQuery, List<QuotationHistoryResponse>>
{
    private readonly IQuotationRepository _quotationRepository;

    public GetQuotationHistoriesQueryHandler(IQuotationRepository quotationRepository)
    {
        _quotationRepository = quotationRepository;
    }

    public async Task<Result<List<QuotationHistoryResponse>>> Handle(GetQuotationHistoriesQuery request, CancellationToken cancellationToken)
    {
        var quotation = await _quotationRepository.GetByIdForReadAsync(request.QuotationId, cancellationToken);
        if (quotation is null || quotation.IsDeleted)
        {
            return Result.Failure<List<QuotationHistoryResponse>>(QuotationErrors.NotFound);
        }

        var response = quotation.Histories
            .OrderByDescending(h => h.CreatedAtUtc)
            .Select(h => new QuotationHistoryResponse(
                h.Id,
                h.Action,
                h.Description,
                h.SnapshotData,
                h.CreatedByUserId,
                h.CreatedAtUtc))
            .ToList();

        return Result.Success(response);
    }
}
