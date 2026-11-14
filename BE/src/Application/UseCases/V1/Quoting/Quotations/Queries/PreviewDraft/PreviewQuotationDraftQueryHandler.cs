namespace OnePortal.Application.UseCases.V1.Quoting.Quotations.Queries.PreviewDraft;

using System.Text;
using OnePortal.Application.Abstractions;
using OnePortal.Application.Exceptions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Quoting.Customers;
using OnePortal.Contract.Services.V1.Quoting.Quotations;
using OnePortal.Contract.Services.V1.Quoting.Templates;
using OnePortal.Domain.Entities.Quoting;
using OnePortal.Domain.Repositories.Quoting;

public sealed class PreviewQuotationDraftQueryHandler(
    IQuotingCustomerRepository customerRepository,
    IQuotationTemplateRepository templateRepository,
    IQuotationExportService exportService) : IQueryHandler<PreviewQuotationDraftQuery, PreviewQuotationDraftResult>
{
    #region Queries
    public async Task<Result<PreviewQuotationDraftResult>> Handle(PreviewQuotationDraftQuery query, CancellationToken cancellationToken)
    {
        var request = query.Draft;
        var customer = request.CustomerId.HasValue
            ? await customerRepository.GetForReadAsync(request.CustomerId.Value, cancellationToken) : null;
        if (request.CustomerId.HasValue && (customer is null || customer.IsDeleted))
            return Result.Failure<PreviewQuotationDraftResult>(QuotingCustomerErrors.NotFound);

        var template = request.TemplateId.HasValue
            ? await templateRepository.GetForReadWithVersionsAsync(request.TemplateId.Value, cancellationToken)
            : await templateRepository.GetDefaultSystemTemplateAsync(cancellationToken);
        if (template is null || template.IsDeleted)
            return Result.Failure<PreviewQuotationDraftResult>(QuotationTemplateErrors.NotFound);
        var version = template.Versions.FirstOrDefault(version => version.Version == (request.TemplateVersion ?? template.CurrentVersion));
        if (version is null) return Result.Failure<PreviewQuotationDraftResult>(QuotationTemplateErrors.VersionNotFound);

        // A transient snapshot uses the export renderer without allocating a number or persisting a draft.
        var quotation = Quotation.Create("BẢN XEM TRƯỚC", customer?.Id, customer?.Name ?? "QUÝ KHÁCH HÀNG",
            customer?.ContactPerson, customer?.Phone, customer?.Email, customer?.Address, customer?.TaxCode,
            template.Id, version.Version, request.IssueDate == default ? DateTime.UtcNow : request.IssueDate,
            request.ValidUntil, request.DiscountPercent, request.TaxPercent, request.Notes, request.UserId);
        quotation.SetDisplayOptions(request.ShowDiscount, request.ShowQuantity, request.ShowSubTotal, request.ShowGrandTotal);
        quotation.SetItems((request.Items ?? []).Select((item, index) => QuotationItem.Create(quotation.Id,
            item.ProductId, item.ProductCode, item.ProductName, item.Description, item.Unit, item.ImageUrl,
            item.ItemGroup, item.Quantity, item.UnitPrice, item.DiscountPercent, item.Notes,
            item.SortOrder > 0 ? item.SortOrder : index + 1, item.GroupSortOrder)).ToList(), request.UserId);
        byte[] html;
        try { html = await exportService.GenerateHtmlAsync(quotation, version, cancellationToken); }
        catch (QuotationImageUnavailableException) { return Result.Failure<PreviewQuotationDraftResult>(QuotationErrors.ImageUnavailable); }
        return Result.Success(new PreviewQuotationDraftResult(Encoding.UTF8.GetString(html)));
    }
    #endregion
}
