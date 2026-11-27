namespace OnePortal.Contract.Services.V1.PhotoPrint.Uploads;

using OnePortal.Contract.Abstractions.Message;

public sealed record GetPhotoFileQuery(string FileName) : IQuery<PhotoDownloadResponse>;
