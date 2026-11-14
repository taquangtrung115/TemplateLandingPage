namespace OnePortal.Application.Abstractions;

public interface IQuotationRemoteImageService
{
    Task<byte[]?> GetAsync(string imageUrl, CancellationToken cancellationToken);
}
