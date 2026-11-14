namespace OnePortal.Infrastructure.Services.Quoting;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using OnePortal.Application.Abstractions;

public sealed class LocalStorageService : IQuotationFileStorageService
{
    private readonly string _storagePath;
    private readonly string _baseUrl;
    private readonly string _legacyStoragePath;
    private readonly ILogger<LocalStorageService> _logger;
    private readonly string _preTenantPath;
    private readonly bool _canReadLegacy;

    public LocalStorageService(IConfiguration configuration, ILogger<LocalStorageService> logger, ITenantContext? tenantContext = null)
    {
        _logger = logger;
        _baseUrl = configuration["Quoting:Storage:BaseUrl"] ?? "/exports/quotations";
        _legacyStoragePath = configuration["Quoting:Storage:LegacyPath"] ?? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "wwwroot", "exports", "quotations");

        var configuredPath = configuration["Quoting:Storage:LocalPath"];
        if (!string.IsNullOrWhiteSpace(configuredPath))
        {
            _storagePath = configuredPath;
        }
        else
        {
            _storagePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "App_Data", "quotations");
        }

        _preTenantPath = _storagePath;
        _canReadLegacy = tenantContext?.TenantId is null || tenantContext.TenantId == OnePortal.Domain.Entities.Tenancy.TenantDefaults.QuotingId;
        if (tenantContext?.TenantId is Guid tenantId) _storagePath = Path.Combine(_storagePath, "tenants", tenantId.ToString("N"), "quoting");
    }

    public async Task<(string FileUrl, string StorageProvider)> UploadFileAsync(
        string fileName,
        string contentType,
        Stream fileStream,
        CancellationToken cancellationToken = default)
    {
        var safeFileName = Path.GetFileName(fileName);
        Directory.CreateDirectory(_storagePath);
        var destinationPath = Path.Combine(_storagePath, safeFileName);

        using (var destStream = new FileStream(destinationPath, FileMode.Create, FileAccess.Write, FileShare.None))
        {
            await fileStream.CopyToAsync(destStream, cancellationToken);
        }

        var fileUrl = $"{_baseUrl.TrimEnd('/')}/{safeFileName}";
        _logger.LogInformation("Saved quotation file locally: {FilePath} -> {Url}", destinationPath, fileUrl);

        return (fileUrl, "Local");
    }

    public Task<Stream?> DownloadFileAsync(string fileUrl, CancellationToken cancellationToken = default)
    {
        var fileName = Path.GetFileName(fileUrl);
        var fullPath = Path.Combine(_storagePath, fileName);

        // Older exports remain available through the authenticated download endpoint.
        if (!File.Exists(fullPath) && _canReadLegacy) fullPath = Path.Combine(_preTenantPath, fileName);
        if (!File.Exists(fullPath) && _canReadLegacy) fullPath = Path.Combine(_legacyStoragePath, fileName);
        if (!File.Exists(fullPath)) return Task.FromResult<Stream?>(null);

        var stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read);
        return Task.FromResult<Stream?>(stream);
    }
}
