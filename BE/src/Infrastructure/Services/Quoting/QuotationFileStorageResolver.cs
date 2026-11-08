namespace TemplateLandingPage.Infrastructure.Services.Quoting;

using Microsoft.Extensions.Logging;
using TemplateLandingPage.Application.Abstractions;

public sealed class QuotationFileStorageResolver : IQuotationFileStorageService
{
    private readonly SupabaseStorageService _supabaseService;
    private readonly LocalStorageService _localService;
    private readonly ILogger<QuotationFileStorageResolver> _logger;

    public QuotationFileStorageResolver(
        SupabaseStorageService supabaseService,
        LocalStorageService localService,
        ILogger<QuotationFileStorageResolver> logger)
    {
        _supabaseService = supabaseService;
        _localService = localService;
        _logger = logger;
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
                _logger.LogWarning("Supabase upload failed ({ExceptionType}); using local storage for {FileName}.", ex.GetType().Name, fileName);
                if (!fileStream.CanSeek) throw;
                if (fileStream.CanSeek)
                {
                    fileStream.Position = startPosition;
                }
            }
        }

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
