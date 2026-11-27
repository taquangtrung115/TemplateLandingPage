namespace OnePortal.Application.Abstractions;

using OnePortal.Contract.Services.V1.PhotoPrint.Uploads;

public interface IPhotoFileStorage
{
    Task SaveAsync(Guid tenantId, string fileName, string contentType, Stream content, long length, CancellationToken cancellationToken);
    Task<PhotoDownloadResponse?> OpenAsync(Guid tenantId, string fileName, string contentType, CancellationToken cancellationToken);
}
