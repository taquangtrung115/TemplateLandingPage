namespace OnePortal.Contract.Services.V1.PhotoPrint.Uploads;

public sealed record UploadedPhotoResponse(string FileUrl, string ThumbnailUrl);

public sealed record PhotoDownloadResponse(Stream Content, string ContentType, IDisposable? Owner = null);
