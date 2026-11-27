namespace OnePortal.Application.Abstractions;
using OnePortal.Contract.Services.V1.Quoting.Products;
using OnePortal.Contract.Abstractions.Shared;
public interface IQuotingProductImageService
{
    Task<Result<UploadedQuotingProductImageDto>> UploadAsync(Stream fileStream, string contentType, CancellationToken cancellationToken);
    Task<QuotingProductImageContentDto?> GetAsync(string fileName, CancellationToken cancellationToken);
}
