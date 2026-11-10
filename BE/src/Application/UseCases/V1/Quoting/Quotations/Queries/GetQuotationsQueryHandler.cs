namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Quotations.Queries;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Quoting.Quotations;
using TemplateLandingPage.Domain.Repositories.Quoting;

public sealed class GetQuotationsQueryHandler : IQueryHandler<GetQuotationsQuery, PagedResponse<QuotationResponse>>
{
    private readonly IQuotationRepository _quotationRepository;

    public GetQuotationsQueryHandler(IQuotationRepository quotationRepository)
    {
        _quotationRepository = quotationRepository;
    }

    public async Task<Result<PagedResponse<QuotationResponse>>> Handle(GetQuotationsQuery request, CancellationToken cancellationToken)
    {
        var quotations = await _quotationRepository.GetPagedAsync(
            request.Status,
            request.CustomerId,
            request.SearchTerm,
            request.PageIndex,
            request.PageSize,
            cancellationToken);

        var total = await _quotationRepository.CountAsync(
            request.Status,
            request.CustomerId,
            request.SearchTerm,
            cancellationToken);

        var data = quotations.Select(q => new QuotationResponse(
            q.Id,
            q.QuotationNumber,
            q.CustomerId,
            q.CustomerName,
            q.CustomerPhone,
            q.Status,
            q.IssueDate,
            q.ValidUntil,
            q.SubTotal,
            q.DiscountAmount,
            q.TaxAmount,
            q.TotalAmount,
            q.CreatedAtUtc, q.ShowGrandTotal)).ToList();

        var response = new PagedResponse<QuotationResponse>(data, total, request.PageIndex, request.PageSize);
        return Result.Success(response);
    }
}
