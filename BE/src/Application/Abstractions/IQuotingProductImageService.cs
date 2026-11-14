namespace OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Quoting.Products.Dtos;
using OnePortal.Contract.Abstractions.Shared;
public interface IQuotingProductImageService
{
    Task<Result<UploadedQuotingProductImageDto>> UploadAsync(Stream fileStream, string contentType, CancellationToken cancellationToken);
    Task<QuotingProductImageContentDto?> GetAsync(string fileName, CancellationToken cancellationToken);
}
