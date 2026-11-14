namespace OnePortal.Application.UseCases.V1.Quoting.Quotations.Queries.Download;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Quoting.Quotations;
using OnePortal.Domain.Repositories.Quoting;

public sealed class DownloadQuotationFileQueryHandler(
    IQuotationRepository quotationRepository,
    IQuotationFileStorageService storageService) : IQueryHandler<DownloadQuotationFileQuery, DownloadQuotationFileResult>
{
    #region Queries
    public async Task<Result<DownloadQuotationFileResult>> Handle(DownloadQuotationFileQuery request, CancellationToken cancellationToken)
    {
        var quotation = await quotationRepository.GetByIdForReadAsync(request.QuotationId, cancellationToken);
        if (quotation is null || quotation.IsDeleted)
            return Result.Failure<DownloadQuotationFileResult>(QuotationErrors.NotFound);

        var file = quotation.Files.SingleOrDefault(file => file.Id == request.FileId);
        if (file is null) return Result.Failure<DownloadQuotationFileResult>(QuotationErrors.FileNotFound);

        var stream = await storageService.DownloadFileAsync(file.FileUrl, cancellationToken);
        if (stream is null) return Result.Failure<DownloadQuotationFileResult>(QuotationErrors.FileNotFound);

        return Result.Success(new DownloadQuotationFileResult(
            stream, file.FileType == "pdf" ? "application/pdf" : "text/html; charset=utf-8", file.FileName));
    }
    #endregion
}
