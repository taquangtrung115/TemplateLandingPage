namespace OnePortal.Contract.Services.V1.PhotoPrint.Uploads;

using OnePortal.Contract.Abstractions.Message;

public sealed record UploadPhotoCommand(Stream Content, long Length, string? Kind) : ICommand<UploadedPhotoResponse>;
