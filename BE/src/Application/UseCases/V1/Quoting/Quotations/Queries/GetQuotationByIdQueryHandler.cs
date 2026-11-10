namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Quotations.Queries;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Quoting.Quotations;
using TemplateLandingPage.Domain.Repositories.Quoting;

public sealed class GetQuotationByIdQueryHandler : IQueryHandler<GetQuotationByIdQuery, QuotationDetailResponse>
{
    private readonly IQuotationRepository _quotationRepository;

    public GetQuotationByIdQueryHandler(IQuotationRepository quotationRepository)
    {
        _quotationRepository = quotationRepository;
    }

    public async Task<Result<QuotationDetailResponse>> Handle(GetQuotationByIdQuery request, CancellationToken cancellationToken)
    {
        var quotation = await _quotationRepository.GetByIdForReadAsync(request.Id, cancellationToken);
        if (quotation is null || quotation.IsDeleted)
        {
            return Result.Failure<QuotationDetailResponse>(QuotationErrors.NotFound);
        }

        var items = quotation.Items.OrderBy(i => i.GroupSortOrder).ThenBy(i => i.SortOrder).Select(i => new QuotationItemResponse(
            i.Id,
            i.ProductId,
            i.ProductCode,
            i.ProductName,
            i.Description,
            i.Unit,
            i.ImageUrl,
            i.ItemGroup,
            i.Quantity,
            i.UnitPrice,
            i.DiscountPercent,
            i.DiscountAmount,
            i.TotalAmount,
            i.Notes,
            i.SortOrder, i.GroupSortOrder)).ToList();

        var histories = quotation.Histories.OrderByDescending(h => h.CreatedAtUtc).Select(h => new QuotationHistoryResponse(
            h.Id,
            h.Action,
            h.Description,
            h.SnapshotData,
            h.CreatedByUserId,
            h.CreatedAtUtc)).ToList();

        var files = quotation.Files.OrderByDescending(f => f.CreatedAtUtc).Select(f => new QuotationFileResponse(
            f.Id,
            f.QuotationId,
            f.FileName,
            f.FileType,
            f.FileUrl,
            f.FileSize,
            f.StorageProvider,
            f.CreatedAtUtc)).ToList();

        var response = new QuotationDetailResponse(
            quotation.Id,
            quotation.QuotationNumber,
            quotation.CustomerId,
            quotation.CustomerName,
            quotation.CustomerContactPerson,
            quotation.CustomerPhone,
            quotation.CustomerEmail,
            quotation.CustomerAddress,
            quotation.CustomerTaxCode,
            quotation.TemplateId,
            quotation.TemplateVersion,
            quotation.Status,
            quotation.IssueDate,
            quotation.ValidUntil,
            quotation.SubTotal,
            quotation.DiscountPercent,
            quotation.DiscountAmount,
            quotation.TaxPercent,
            quotation.TaxAmount,
            quotation.TotalAmount,
            quotation.Notes,
            quotation.CreatedByUserId,
            quotation.CreatedAtUtc,
            quotation.ModifiedAtUtc,
            items,
            histories,
            files, quotation.ShowDiscount, quotation.ShowQuantity, quotation.ShowSubTotal, quotation.ShowGrandTotal);

        return Result.Success(response);
    }
}
