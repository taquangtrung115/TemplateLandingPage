namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Quotations.Commands;

using Microsoft.Extensions.Logging;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Quoting.Quotations;
using TemplateLandingPage.Contract.Services.V1.Quoting.Templates;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Repositories.Quoting;

public sealed class ExportQuotationFileCommandHandler : ICommandHandler<ExportQuotationFileCommand, QuotationFileResponse>
{
    private readonly IQuotationRepository _quotationRepository;
    private readonly IQuotationTemplateRepository _templateRepository;
    private readonly IQuotationExportService _exportService;
    private readonly IQuotationFileStorageService _storageService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ExportQuotationFileCommandHandler> _logger;

    public ExportQuotationFileCommandHandler(
        IQuotationRepository quotationRepository,
        IQuotationTemplateRepository templateRepository,
        IQuotationExportService exportService,
        IQuotationFileStorageService storageService,
        IUnitOfWork unitOfWork,
        ILogger<ExportQuotationFileCommandHandler> logger)
    {
        _quotationRepository = quotationRepository;
        _templateRepository = templateRepository;
        _exportService = exportService;
        _storageService = storageService;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<QuotationFileResponse>> Handle(ExportQuotationFileCommand request, CancellationToken cancellationToken)
    {
        if (request.TaxPercent is < 0 or > 100 || (request.TaxPercent.HasValue && decimal.Round(request.TaxPercent.Value, 2) != request.TaxPercent.Value))
            return Result.Failure<QuotationFileResponse>(QuotationErrors.InvalidTax);

        var quotation = await _quotationRepository.GetByIdWithDetailsAsync(request.QuotationId, cancellationToken);
        if (quotation is null || quotation.IsDeleted)
        {
            return Result.Failure<QuotationFileResponse>(QuotationErrors.NotFound);
        }

        var template = await _templateRepository.GetByIdWithVersionsAsync(quotation.TemplateId, cancellationToken);
        if (template is null)
        {
            return Result.Failure<QuotationFileResponse>(QuotationTemplateErrors.NotFound);
        }

        var templateVersion = template.Versions.FirstOrDefault(v => v.Version == quotation.TemplateVersion);
        if (templateVersion is null)
        {
            return Result.Failure<QuotationFileResponse>(QuotationTemplateErrors.VersionNotFound);
        }

        var normalizedType = request.FileType?.Trim().ToLowerInvariant();
        if (normalizedType != "pdf" && normalizedType != "html")
        {
            return Result.Failure<QuotationFileResponse>(QuotationErrors.InvalidFileType);
        }

        var exportSnapshot = quotation.CreateExportSnapshot(request.TaxPercent ?? quotation.TaxPercent);
        byte[] fileBytes;
        string contentType;
        if (normalizedType == "pdf")
        {
            fileBytes = await _exportService.GeneratePdfAsync(exportSnapshot, templateVersion, cancellationToken);
            contentType = "application/pdf";
        }
        else
        {
            fileBytes = await _exportService.GenerateHtmlAsync(exportSnapshot, templateVersion, cancellationToken);
            contentType = "text/html";
        }

        var fileName = $"{quotation.QuotationNumber}_{Guid.NewGuid():N}.{normalizedType}";
        using var stream = new MemoryStream(fileBytes);
        var (fileUrl, storageProvider) = await _storageService.UploadFileAsync(fileName, contentType, stream, cancellationToken);

        quotation.AddExportedFile(fileName, normalizedType, fileUrl, fileBytes.Length, storageProvider, request.UserId);
        _quotationRepository.Update(quotation);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var exportedFile = quotation.Files.Last();
        _logger.LogInformation("Exported quotation {QuotationNumber} as {FileName} via {StorageProvider}", quotation.QuotationNumber, fileName, storageProvider);

        var response = new QuotationFileResponse(
            exportedFile.Id,
            quotation.Id,
            exportedFile.FileName,
            exportedFile.FileType,
            exportedFile.FileUrl,
            exportedFile.FileSize,
            exportedFile.StorageProvider,
            exportedFile.CreatedAtUtc);

        return Result.Success(response);
    }
}
