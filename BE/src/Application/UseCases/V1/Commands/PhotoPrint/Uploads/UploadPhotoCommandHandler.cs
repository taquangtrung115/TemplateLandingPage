namespace OnePortal.Application.UseCases.V1.Commands.PhotoPrint.Uploads;

using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.PhotoPrint.Uploads;
using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.PhotoPrint.Uploads;

public sealed class UploadPhotoCommandHandler(IPhotoFileStorage storage, ITenantContext scope, IRequestActor actor)
    : ICommandHandler<UploadPhotoCommand, UploadedPhotoResponse>
{
    public async Task<Result<UploadedPhotoResponse>> Handle(UploadPhotoCommand request, CancellationToken cancellationToken)
    {
        if (scope.AppKey != "photoprint" || scope.TenantId is not Guid tenantId)
            return Failure("Forbidden", "Workspace tải ảnh không hợp lệ.");

        var kind = request.Kind ?? "print";
        if (kind is not ("print" or "support" or "qr" or "catalog")) return Failure("Invalid", "Loại ảnh tải lên không hợp lệ.");
        if (kind is ("qr" or "catalog") && actor.Role != "Admin") return Failure("Forbidden", "Cần quyền quản trị để tải ảnh mẫu.");
        var maxMb = kind switch { "qr" => 5, "support" => 10, _ => 15 };
        if (request.Length < 12 || request.Length > maxMb * 1024 * 1024L || !request.Content.CanSeek)
            return Failure("Invalid", $"Giới hạn ảnh tối đa {maxMb} MB.");

        var header = new byte[12];
        try { await request.Content.ReadExactlyAsync(header, cancellationToken); }
        catch (EndOfStreamException) { return Failure("Invalid", "Không đọc được tệp ảnh."); }
        var type = PhotoFileTypes.Detect(header);
        if (type is null) return Failure("Invalid", "Chọn ảnh JPEG, PNG hoặc WebP.");
        request.Content.Position = 0;
        var name = Guid.NewGuid().ToString("N") + type.Value.Extension;
        try { await storage.SaveAsync(tenantId, name, type.Value.Mime, request.Content, request.Length, cancellationToken); }
        catch (HttpRequestException) { return Failure("StorageUnavailable", "Kho ảnh đang bận. Vui lòng tải lại."); }
        var path = "/api/v1/photoprint/uploads/" + name;
        return Result.Success(new UploadedPhotoResponse(path, path));
    }

    private static Result<UploadedPhotoResponse> Failure(string code, string message) =>
        Result.Failure<UploadedPhotoResponse>(new Error("PhotoPrint." + code, message));
}
