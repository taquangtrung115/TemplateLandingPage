namespace TemplateLandingPage.Application.Abstractions;

public interface IQuotationFileStorageService
{
    Task<(string FileUrl, string StorageProvider)> UploadFileAsync(string fileName, string contentType, Stream fileStream, CancellationToken cancellationToken = default);
    Task<Stream?> DownloadFileAsync(string fileUrl, CancellationToken cancellationToken = default);
}
