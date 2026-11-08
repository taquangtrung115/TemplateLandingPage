namespace TemplateLandingPage.Infrastructure.Services.Quoting;

using System.Net.Http.Headers;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using TemplateLandingPage.Application.Abstractions;

public sealed class SupabaseStorageService : IQuotationFileStorageService
{
    private readonly HttpClient _httpClient;
    private readonly string? _supabaseUrl;
    private readonly string? _apiKey;
    private readonly string _bucket;
    private readonly ILogger<SupabaseStorageService> _logger;

    public bool IsConfigured => !string.IsNullOrWhiteSpace(_supabaseUrl) && !string.IsNullOrWhiteSpace(_apiKey);

    public SupabaseStorageService(HttpClient httpClient, IConfiguration configuration, ILogger<SupabaseStorageService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _supabaseUrl = configuration["Supabase:Url"] ?? configuration["SupabaseStorage:Url"];
        _apiKey = configuration["Supabase:ServiceRoleKey"] ?? configuration["Supabase:Key"] ?? configuration["SupabaseStorage:ServiceRoleKey"];
        _bucket = configuration["Supabase:Bucket"] ?? configuration["SupabaseStorage:Bucket"] ?? "quotations";
    }

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
        var uploadEndpoint = $"{_supabaseUrl!.TrimEnd('/')}/storage/v1/object/{_bucket}/{safeFileName}";

        using var request = new HttpRequestMessage(HttpMethod.Post, uploadEndpoint);
        request.Headers.Add("apikey", _apiKey);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        using var buffer = new MemoryStream();
        await fileStream.CopyToAsync(buffer, cancellationToken);
        using var content = new ByteArrayContent(buffer.ToArray());
        content.Headers.ContentType = new MediaTypeHeaderValue(contentType);
        request.Content = content;

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException($"Supabase storage upload failed with status {(int)response.StatusCode}.");
        }

        var publicUrl = $"{_supabaseUrl!.TrimEnd('/')}/storage/v1/object/authenticated/{_bucket}/{Uri.EscapeDataString(safeFileName)}";
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

        var authenticatedUrl = fileUrl.Replace("/storage/v1/object/public/", "/storage/v1/object/authenticated/", StringComparison.Ordinal);
        using var request = new HttpRequestMessage(HttpMethod.Get, authenticatedUrl);
        request.Headers.Add("apikey", _apiKey);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        return new MemoryStream(await response.Content.ReadAsByteArrayAsync(cancellationToken), writable: false);
    }
}
