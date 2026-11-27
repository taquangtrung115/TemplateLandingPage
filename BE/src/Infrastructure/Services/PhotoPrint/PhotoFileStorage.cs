namespace OnePortal.Infrastructure.Services.PhotoPrint;

using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using OnePortal.Application.Abstractions;
using OnePortal.Contract.Services.V1.PhotoPrint.Uploads;

public sealed class PhotoFileStorage(HttpClient client, IConfiguration configuration) : IPhotoFileStorage
{
    private readonly HttpClient _client = client;
    private readonly string? _origin = FirstConfigured(configuration, "Supabase:Url", "SupabaseStorage:Url")?.TrimEnd('/');
    private readonly string? _key = FirstConfigured(configuration, "Supabase:SecretKey", "Supabase:ServiceRoleKey", "Supabase:Key", "SupabaseStorage:ServiceRoleKey");
    private readonly string _bucket = configuration["PhotoPrint:Storage:Bucket"] ?? "photoprint";
    private readonly string? _localPath = configuration["PhotoPrint:Storage:LocalPath"];

    public async Task SaveAsync(Guid tenantId, string fileName, string contentType, Stream content, long length, CancellationToken cancellationToken)
    {
        if (UseLocalStorage())
        {
            var path = LocalPath(tenantId, fileName);
            Directory.CreateDirectory(Path.GetDirectoryName(path)!);
            try
            {
                await using var file = new FileStream(path, FileMode.CreateNew, FileAccess.Write, FileShare.None, 65536, FileOptions.Asynchronous);
                await content.CopyToAsync(file, cancellationToken);
            }
            catch
            {
                File.Delete(path);
                throw;
            }
            return;
        }

        using var request = CreateRequest(HttpMethod.Post, tenantId, fileName);
        request.Content = new StreamContent(content);
        request.Content.Headers.ContentType = new MediaTypeHeaderValue(contentType);
        request.Content.Headers.ContentLength = length;
        using var response = await _client.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode) throw new HttpRequestException("Photo storage write failed.", null, response.StatusCode);
    }

    public async Task<PhotoDownloadResponse?> OpenAsync(Guid tenantId, string fileName, string contentType, CancellationToken cancellationToken)
    {
        if (UseLocalStorage())
        {
            var path = LocalPath(tenantId, fileName);
            if (!File.Exists(path)) return null;
            return new PhotoDownloadResponse(File.OpenRead(path), contentType);
        }
        using var request = CreateRequest(HttpMethod.Get, tenantId, fileName);
        var response = await _client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        try
        {
            if (await IsMissingObjectAsync(response, cancellationToken)) { response.Dispose(); return null; }
            if (!response.IsSuccessStatusCode) throw new HttpRequestException("Photo storage read failed.", null, response.StatusCode);
            var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            return new PhotoDownloadResponse(stream, contentType, response);
        }
        catch
        {
            response.Dispose();
            throw;
        }
    }

    private static async Task<bool> IsMissingObjectAsync(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        if (response.StatusCode == HttpStatusCode.NotFound) return true;
        if (response.StatusCode != HttpStatusCode.BadRequest) return false;

        // Supabase's legacy storage response uses HTTP 400 with an embedded 404.
        try
        {
            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
            var error = document.RootElement;
            if (error.ValueKind != JsonValueKind.Object) return false;
            var code = error.TryGetProperty("code", out var currentCode) ? currentCode.ToString() : null;
            if (code == "NoSuchKey") return true;
            return error.TryGetProperty("statusCode", out var status) && status.ToString() == "404";
        }
        catch (JsonException) { return false; }
    }

    private bool UseLocalStorage() => (string.IsNullOrWhiteSpace(_origin) || string.IsNullOrWhiteSpace(_key)) && !string.IsNullOrWhiteSpace(_localPath);
    private string LocalPath(Guid tenantId, string fileName) => Path.Combine(_localPath!, tenantId.ToString("N"), fileName);
    private static string ObjectPath(Guid tenantId, string fileName) => $"tenants/{tenantId:N}/photoprint/uploads/{fileName}";
    private static string? FirstConfigured(IConfiguration configuration, params string[] keys) =>
        keys.Select(key => configuration[key]).FirstOrDefault(value => !string.IsNullOrWhiteSpace(value));

    private HttpRequestMessage CreateRequest(HttpMethod method, Guid tenantId, string fileName)
    {
        if (string.IsNullOrWhiteSpace(_origin) || string.IsNullOrWhiteSpace(_key)) throw new HttpRequestException("Photo storage is not configured.");
        var endpoint = method == HttpMethod.Get ? "object/authenticated" : "object";
        var request = new HttpRequestMessage(method, $"{_origin}/storage/v1/{endpoint}/{Uri.EscapeDataString(_bucket)}/{ObjectPath(tenantId, fileName)}");
        request.Headers.TryAddWithoutValidation("apikey", _key);
        if (!_key.StartsWith("sb_", StringComparison.Ordinal)) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _key);
        return request;
    }
}
