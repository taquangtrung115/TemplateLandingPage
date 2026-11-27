namespace OnePortal.Contract.Services.V1.PhotoPrint.Support;

public sealed record PhotoSupportInput(string FullName, string Phone, string? Email, string Topic, string Priority, string? OrderCode, string? AttachmentUrl, string Message);
