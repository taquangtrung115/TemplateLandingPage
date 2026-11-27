namespace OnePortal.Application.UseCases.V1.Queries.PhotoPrint.Uploads;

using System.Text.RegularExpressions;
using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.PhotoPrint.Uploads;
using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.PhotoPrint.Uploads;

public sealed class GetPhotoFileQueryHandler(IPhotoFileStorage storage, ITenantContext scope) : IQueryHandler<GetPhotoFileQuery, PhotoDownloadResponse>
{
    public async Task<Result<PhotoDownloadResponse>> Handle(GetPhotoFileQuery request, CancellationToken cancellationToken)
    {
        var name = request.FileName;
        if (scope.AppKey != "photoprint" || scope.TenantId is not Guid tenantId || !Regex.IsMatch(name, "^[a-f0-9]{32}\\.(jpg|png|webp)$"))
            return Missing();
        var type = PhotoFileTypes.ForExtension(Path.GetExtension(name))!;
        try
        {
            var file = await storage.OpenAsync(tenantId, name, type, cancellationToken);
            return file is null ? Missing() : Result.Success(file);
        }
        catch (HttpRequestException)
        {
            return Result.Failure<PhotoDownloadResponse>(new Error("PhotoPrint.StorageUnavailable", "Không thể liên hệ kho ảnh."));
        }
    }

    private static Result<PhotoDownloadResponse> Missing() => Result.Failure<PhotoDownloadResponse>(new Error("PhotoPrint.NotFound", "Không tìm thấy ảnh."));
}
