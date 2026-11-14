namespace OnePortal.Infrastructure.Services.Quoting;

using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using OnePortal.Application.Abstractions;

public sealed class QuotationFileStorageResolver : IQuotationFileStorageService
{
    private readonly SupabaseStorageService _supabaseService;
    private readonly LocalStorageService _localService;
    private readonly ILogger<QuotationFileStorageResolver> _logger;
    private readonly bool _allowLocalFallback;

    public QuotationFileStorageResolver(
        SupabaseStorageService supabaseService,
        LocalStorageService localService,
        ILogger<QuotationFileStorageResolver> logger, IConfiguration? configuration = null)
    {
        _supabaseService = supabaseService;
        _localService = localService;
        _logger = logger;
        _allowLocalFallback = configuration is null || configuration.GetValue<bool>("Quoting:Storage:AllowLocalFallback");
    }

    public async Task<(string FileUrl, string StorageProvider)> UploadFileAsync(
        string fileName,
        string contentType,
        Stream fileStream,
        CancellationToken cancellationToken = default)
    {
        if (!fileStream.CanSeek)
        {
            using var buffer = new MemoryStream();
            await fileStream.CopyToAsync(buffer, cancellationToken);
            buffer.Position = 0;
            return await UploadFileAsync(fileName, contentType, buffer, cancellationToken);
        }
        if (_supabaseService.IsConfigured)
        {
            var startPosition = fileStream.CanSeek ? fileStream.Position : 0;
            try
            {
                var result = await _supabaseService.UploadFileAsync(fileName, contentType, fileStream, cancellationToken);
                return result;
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested) { throw; }
            catch (Exception ex)
            {
                _logger.LogWarning("Supabase upload failed ({ExceptionType}); file {FileName}.", ex.GetType().Name, fileName);
                if (!_allowLocalFallback) throw new OnePortal.Application.Exceptions.QuotationStorageUnavailableException();
                if (!fileStream.CanSeek) throw;
                if (fileStream.CanSeek)
                {
                    fileStream.Position = startPosition;
                }
            }
        }

        if (!_allowLocalFallback) throw new OnePortal.Application.Exceptions.QuotationStorageUnavailableException();
        return await _localService.UploadFileAsync(fileName, contentType, fileStream, cancellationToken);
    }

    public async Task<Stream?> DownloadFileAsync(string fileUrl, CancellationToken cancellationToken = default)
    {
        if ((fileUrl.Contains("/storage/v1/object/public/") || fileUrl.Contains("/storage/v1/object/authenticated/")) && _supabaseService.IsConfigured)
        {
            var stream = await _supabaseService.DownloadFileAsync(fileUrl, cancellationToken);
            if (stream is not null) return stream;
        }

        return await _localService.DownloadFileAsync(fileUrl, cancellationToken);
    }
}
