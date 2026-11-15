namespace OnePortal.Infrastructure.Services.Quoting;

using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using OnePortal.Application.Abstractions;

public sealed class SupabaseStorageService : IQuotationFileStorageService
{
    #region Configuration
    private readonly HttpClient _httpClient;
    private readonly string? _supabaseUrl;
    private readonly string? _apiKey;
    private readonly string _bucket;
    private readonly ILogger<SupabaseStorageService> _logger;
    private readonly ITenantContext? _tenantContext;

    public bool IsConfigured => Uri.TryCreate(_supabaseUrl, UriKind.Absolute, out var origin)
        && (origin.Scheme == "https" || (origin.Scheme == "http" && origin.IsLoopback))
        && origin.AbsolutePath == "/" && string.IsNullOrEmpty(origin.Query) && string.IsNullOrEmpty(origin.Fragment)
        && !string.IsNullOrWhiteSpace(_apiKey) && _bucket.Length is > 0 and <= 100 && _bucket is not ("." or "..")
        && _bucket.All(character => char.IsAsciiLetterOrDigit(character) || character is '-' or '_' or '.');

    public SupabaseStorageService(HttpClient httpClient, IConfiguration configuration, ILogger<SupabaseStorageService> logger, ITenantContext? tenantContext = null)
    {
        _httpClient = httpClient;
        _logger = logger;
        _tenantContext = tenantContext;
        _supabaseUrl = FirstConfigured(configuration, "Supabase:Url", "SupabaseStorage:Url");
        _apiKey = FirstConfigured(configuration, "Supabase:ServiceRoleKey", "Supabase:SecretKey", "Supabase:Key", "SupabaseStorage:ServiceRoleKey");
        _bucket = FirstConfigured(configuration, "Supabase:Bucket", "SupabaseStorage:Bucket") ?? "quotations";
    }

    #endregion

    #region Upload and retrieval
    public async Task<(string FileUrl, string StorageProvider)> UploadFileAsync(
        string fileName,
        string contentType,
        Stream fileStream,
        CancellationToken cancellationToken = default)
    {
        if (!IsConfigured)
        {
            throw new InvalidOperationException("Supabase Storage is not configured. Missing Supabase URL or Key.");
        }

        var safeFileName = Path.GetFileName(fileName);
        var objectKey = _tenantContext?.TenantId is Guid tenantId ? $"tenants/{tenantId:N}/quoting/exports/{safeFileName}" : safeFileName;
        var uploadEndpoint = $"{_supabaseUrl!.TrimEnd('/')}/storage/v1/object/{_bucket}/{objectKey}";

        using var buffer = new MemoryStream();
        await fileStream.CopyToAsync(buffer, cancellationToken);
        var bytes = buffer.ToArray();
        using var first = await SendUploadAsync(uploadEndpoint, contentType, bytes, cancellationToken);
        if (await HasStorageStatusAsync(first, HttpStatusCode.NotFound, cancellationToken))
        {
            // Bucket creation can race across replicas. Recover once without overwriting any existing file.
            await EnsureBucketAsync(cancellationToken);
            using var retry = await SendUploadAsync(uploadEndpoint, contentType, bytes, cancellationToken);
            await EnsureSuccessAsync(retry, "upload", cancellationToken);
        }
        else await EnsureSuccessAsync(first, "upload", cancellationToken);

        var publicUrl = $"{_supabaseUrl!.TrimEnd('/')}/storage/v1/object/authenticated/{_bucket}/{string.Join("/", objectKey.Split('/').Select(Uri.EscapeDataString))}";
        _logger.LogInformation("Successfully uploaded file to Supabase Storage: {Url}", publicUrl);

        return (publicUrl, "Supabase");
    }

    public async Task<Stream?> DownloadFileAsync(string fileUrl, CancellationToken cancellationToken = default)
    {
        if (!IsConfigured)
        {
            return null;
        }

        if (!Uri.TryCreate(_supabaseUrl, UriKind.Absolute, out var origin) || !Uri.TryCreate(fileUrl, UriKind.Absolute, out var target)
            || target.Scheme != origin.Scheme || target.Host != origin.Host || target.Port != origin.Port
            || (!target.AbsolutePath.StartsWith($"/storage/v1/object/public/{_bucket}/", StringComparison.Ordinal)
                && !target.AbsolutePath.StartsWith($"/storage/v1/object/authenticated/{_bucket}/", StringComparison.Ordinal))) return null;

        if (_tenantContext?.TenantId is Guid tenantId)
        {
            var key = Uri.UnescapeDataString(target.AbsolutePath.Split($"/{_bucket}/", 2, StringSplitOptions.None)[1]);
            var prefix = $"tenants/{tenantId:N}/quoting/exports/";
            if (!key.StartsWith(prefix, StringComparison.Ordinal) && !(tenantId == OnePortal.Domain.Entities.Tenancy.TenantDefaults.QuotingId && !key.Contains('/')))
                return null;
            if (key.Contains("..", StringComparison.Ordinal) || key.Contains('\\')) return null;
        }

        var authenticatedUrl = fileUrl.Replace("/storage/v1/object/public/", "/storage/v1/object/authenticated/", StringComparison.Ordinal);
        using var request = CreateRequest(HttpMethod.Get, authenticatedUrl);

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        return new MemoryStream(await response.Content.ReadAsByteArrayAsync(cancellationToken), writable: false);
    }
    #endregion

    #region Storage protocol
    private async Task<HttpResponseMessage> SendUploadAsync(string endpoint, string contentType, byte[] bytes, CancellationToken cancellationToken)
    {
        using var request = CreateRequest(HttpMethod.Post, endpoint);
        request.Content = new ByteArrayContent(bytes);
        request.Content.Headers.ContentType = new MediaTypeHeaderValue(contentType);
        return await _httpClient.SendAsync(request, cancellationToken);
    }

    private async Task EnsureBucketAsync(CancellationToken cancellationToken)
    {
        using var lookup = CreateRequest(HttpMethod.Get, $"{_supabaseUrl!.TrimEnd('/')}/storage/v1/bucket/{_bucket}");
        using var existing = await _httpClient.SendAsync(lookup, cancellationToken);
        if (existing.IsSuccessStatusCode) return;
        if (!await HasStorageStatusAsync(existing, HttpStatusCode.NotFound, cancellationToken))
            await EnsureSuccessAsync(existing, "bucket lookup", cancellationToken);

        using var create = CreateRequest(HttpMethod.Post, $"{_supabaseUrl.TrimEnd('/')}/storage/v1/bucket");
        create.Content = JsonContent.Create(new { id = _bucket, name = _bucket, @public = false,
            file_size_limit = 50 * 1024 * 1024, allowed_mime_types = new[] { "application/pdf", "text/html" } });
        using var created = await _httpClient.SendAsync(create, cancellationToken);
        if (!await HasStorageStatusAsync(created, HttpStatusCode.Conflict, cancellationToken))
            await EnsureSuccessAsync(created, "bucket creation", cancellationToken);
    }

    private HttpRequestMessage CreateRequest(HttpMethod method, string endpoint)
    {
        var request = new HttpRequestMessage(method, endpoint);
        request.Headers.Add("apikey", _apiKey);
        if (!_apiKey!.StartsWith("sb_secret_", StringComparison.Ordinal))
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        return request;
    }

    private static async Task<bool> HasStorageStatusAsync(HttpResponseMessage response, HttpStatusCode expected, CancellationToken cancellationToken)
    {
        if (response.StatusCode == expected) return true;
        if (response.StatusCode != HttpStatusCode.BadRequest) return false;
        // Legacy Storage responses wrap a missing bucket or concurrent creation in HTTP 400.
        var error = await ReadErrorAsync(response, cancellationToken);
        return error is JsonElement value &&
            ((value.TryGetProperty("statusCode", out var status) && status.ToString() == ((int)expected).ToString(System.Globalization.CultureInfo.InvariantCulture))
            || (value.TryGetProperty("code", out var code) && code.ValueKind == JsonValueKind.String && code.GetString() == (expected == HttpStatusCode.NotFound ? "NoSuchBucket" : "BucketAlreadyExists")));
    }

    private async Task EnsureSuccessAsync(HttpResponseMessage response, string operation, CancellationToken cancellationToken)
    {
        if (response.IsSuccessStatusCode) return;
        var error = await ReadErrorAsync(response, cancellationToken);
        var code = error is JsonElement value && value.TryGetProperty("code", out var property) && property.ValueKind == JsonValueKind.String ? property.GetString() : null;
        var safeCode = code is "NoSuchBucket" or "AccessDenied" or "InvalidJWT" or "InvalidMimeType" or "EntityTooLarge" or "BucketAlreadyExists" or "KeyAlreadyExists" ? code : "Unrecognized";
        _logger.LogWarning("Quotation storage {Operation} failed: HTTP {StatusCode}, code {StorageCode}.", operation, (int)response.StatusCode, safeCode);
        throw new HttpRequestException($"Supabase storage {operation} failed (HTTP {(int)response.StatusCode}, {safeCode}).", null, response.StatusCode);
    }

    private static async Task<JsonElement?> ReadErrorAsync(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        try
        {
            using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
            return document.RootElement.ValueKind == JsonValueKind.Object ? document.RootElement.Clone() : null;
        }
        catch (JsonException) { return null; }
    }

    private static string? FirstConfigured(IConfiguration configuration, params string[] keys) =>
        keys.Select(key => configuration[key]?.Trim()).FirstOrDefault(value => !string.IsNullOrWhiteSpace(value));
    #endregion
}
