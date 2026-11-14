namespace OnePortal.Application.UseCases.V1.Quoting.Quotations.Queries;

using System.Text;
using OnePortal.Application.Abstractions;
using OnePortal.Application.Exceptions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Quoting.Quotations;
using OnePortal.Contract.Services.V1.Quoting.Templates;
using OnePortal.Domain.Repositories.Quoting;

public sealed class PreviewQuotationQueryHandler : IQueryHandler<PreviewQuotationQuery, QuotationPreviewResponse>
{
    private readonly IQuotationRepository _quotationRepository;
    private readonly IQuotationTemplateRepository _templateRepository;
    private readonly IQuotationExportService _exportService;

    public PreviewQuotationQueryHandler(
        IQuotationRepository quotationRepository,
        IQuotationTemplateRepository templateRepository,
        IQuotationExportService exportService)
    {
        _quotationRepository = quotationRepository;
        _templateRepository = templateRepository;
        _exportService = exportService;
    }

    public async Task<Result<QuotationPreviewResponse>> Handle(PreviewQuotationQuery request, CancellationToken cancellationToken)
    {
        if (request.TaxPercent is < 0 or > 100 || (request.TaxPercent.HasValue && decimal.Round(request.TaxPercent.Value, 2) != request.TaxPercent.Value))
            return Result.Failure<QuotationPreviewResponse>(QuotationErrors.InvalidTax);

        var quotation = await _quotationRepository.GetByIdForReadAsync(request.QuotationId, cancellationToken);
        if (quotation is null || quotation.IsDeleted)
        {
            return Result.Failure<QuotationPreviewResponse>(QuotationErrors.NotFound);
        }

        var template = await _templateRepository.GetByIdWithVersionsAsync(quotation.TemplateId, cancellationToken);
        if (template is null)
        {
            return Result.Failure<QuotationPreviewResponse>(QuotationTemplateErrors.NotFound);
        }

        var templateVersion = template.Versions.FirstOrDefault(v => v.Version == quotation.TemplateVersion);
        if (templateVersion is null)
        {
            return Result.Failure<QuotationPreviewResponse>(QuotationTemplateErrors.VersionNotFound);
        }

        var snapshot = quotation.CreateExportSnapshot(request.TaxPercent ?? quotation.TaxPercent);
        byte[] htmlBytes;
        try { htmlBytes = await _exportService.GenerateHtmlAsync(snapshot, templateVersion, cancellationToken); }
        catch (QuotationImageUnavailableException) { return Result.Failure<QuotationPreviewResponse>(QuotationErrors.ImageUnavailable); }
        var htmlContent = Encoding.UTF8.GetString(htmlBytes);

        var response = new QuotationPreviewResponse(quotation.Id, quotation.QuotationNumber, htmlContent);
        return Result.Success(response);
    }
}
