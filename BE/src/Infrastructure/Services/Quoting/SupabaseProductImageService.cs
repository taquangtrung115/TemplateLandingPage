namespace OnePortal.Infrastructure.Services.Quoting;

using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SkiaSharp;
using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Quoting.Products.Dtos;
using OnePortal.Application.UseCases.V1.Quoting.Products.Helpers;
using OnePortal.Contract.Abstractions.Shared;

public sealed class SupabaseProductImageService(HttpClient httpClient, IConfiguration configuration, ILogger<SupabaseProductImageService> logger, ITenantContext? tenantContext = null) : IQuotingProductImageService
{
    #region Configuration
    private string ObjectPrefix => tenantContext?.TenantId is Guid tenantId ? $"tenants/{tenantId:N}/quoting/uploads/" : "uploads/";
    private bool CanReadLegacy => tenantContext?.TenantId is null || tenantContext.TenantId == OnePortal.Domain.Entities.Tenancy.TenantDefaults.QuotingId;
    private const int MaximumBytes = 5 * 1024 * 1024;
    private const int MaximumPixels = 16_000_000;
    private const int OutputEdge = 1600;
    private readonly HttpClient _httpClient = httpClient;
    private readonly ILogger<SupabaseProductImageService> _logger = logger;
    private readonly string? _origin = configuration["Quoting:Images:SupabaseUrl"] ?? configuration["Supabase:Url"] ?? configuration["SupabaseStorage:Url"];
    private readonly string? _key = configuration["Quoting:Images:SecretKey"] ?? configuration["Quoting:Images:ServiceRoleKey"] ?? configuration["Supabase:SecretKey"] ?? configuration["Supabase:ServiceRoleKey"] ?? configuration["Supabase:Key"] ?? configuration["SupabaseStorage:ServiceRoleKey"];
    private readonly string _bucket = configuration["Quoting:Images:Bucket"] ?? "product-images";
    private bool IsConfigured => Uri.TryCreate(_origin, UriKind.Absolute, out var uri) && (uri.Scheme == "https" || (uri.Scheme == "http" && uri.IsLoopback))
        && !string.IsNullOrWhiteSpace(_key) && _bucket.Length > 0 && _bucket.All(character => char.IsAsciiLetterOrDigit(character) || character == '-');
    private static readonly Error InvalidImage = new("QuotingProductImage.InvalidImage", "Ảnh không hợp lệ. Chọn ảnh JPG hoặc PNG, tối đa 5 MB và 16 triệu điểm ảnh.");
    private static readonly Error UploadUnavailable = new("QuotingProductImage.Unavailable", "Chưa thể tải ảnh. Vui lòng thử lại hoặc liên hệ quản trị viên.");
    #endregion

    #region Upload and retrieval
    public async Task<Result<UploadedQuotingProductImageDto>> UploadAsync(Stream fileStream, string contentType, CancellationToken cancellationToken)
    {
        if (!IsConfigured) return Result.Failure<UploadedQuotingProductImageDto>(UploadUnavailable);
        if (contentType is not ("image/png" or "image/jpeg")) return Result.Failure<UploadedQuotingProductImageDto>(InvalidImage);
        var input = await ReadBoundedAsync(fileStream, cancellationToken);
        if (input is null || input.Length == 0) return Result.Failure<UploadedQuotingProductImageDto>(InvalidImage);
        var normalized = Normalize(input, contentType);
        if (normalized is null) return Result.Failure<UploadedQuotingProductImageDto>(InvalidImage);
        try
        {
            await EnsureBucketAsync(cancellationToken);
            var extension = normalized.ContentType == "image/png" ? ".png" : ".jpg";
            var fileName = Guid.NewGuid().ToString("N") + extension;
            using var request = Request(HttpMethod.Post, $"/storage/v1/object/{_bucket}/{ObjectPrefix}{fileName}");
            request.Content = new ByteArrayContent(normalized.Data);
            request.Content.Headers.ContentType = new MediaTypeHeaderValue(normalized.ContentType);
            using var response = await _httpClient.SendAsync(request, cancellationToken);
            response.EnsureSuccessStatusCode();
            return Result.Success(new UploadedQuotingProductImageDto((tenantContext?.TenantKey is string key ? $"/t/{key}" : "") + QuotingProductImageAddress.Prefix + fileName, fileName, normalized.ContentType, normalized.Width, normalized.Height, normalized.Data.Length));
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested) { throw; }
        catch (Exception error) when (error is HttpRequestException or TaskCanceledException)
        {
            _logger.LogWarning("Product image upload failed ({ExceptionType}).", error.GetType().Name);
            return Result.Failure<UploadedQuotingProductImageDto>(UploadUnavailable);
        }
    }

    public async Task<QuotingProductImageContentDto?> GetAsync(string fileName, CancellationToken cancellationToken)
    {
        if (!IsConfigured || !QuotingProductImageAddress.IsFileName(fileName)) return null;
        using var request = Request(HttpMethod.Get, $"/storage/v1/object/authenticated/{_bucket}/{ObjectPrefix}{fileName}");
        try
        {
            using var response = await _httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
            if (!response.IsSuccessStatusCode && CanReadLegacy && ObjectPrefix != "uploads/")
                return await GetLegacyAsync(fileName, cancellationToken);
            if (!response.IsSuccessStatusCode || response.Content.Headers.ContentLength > MaximumBytes) return null;
            await using var source = await response.Content.ReadAsStreamAsync(cancellationToken);
            var bytes = await ReadBoundedAsync(source, cancellationToken);
            return bytes is null ? null : new QuotingProductImageContentDto(bytes, fileName.EndsWith(".png", StringComparison.Ordinal) ? "image/png" : "image/jpeg");
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested) { throw; }
        catch (Exception error) when (error is HttpRequestException or TaskCanceledException)
        {
            _logger.LogWarning("Product image retrieval failed ({ExceptionType}).", error.GetType().Name);
            return null;
        }
    }
    #endregion

    private async Task<QuotingProductImageContentDto?> GetLegacyAsync(string fileName, CancellationToken cancellationToken)
    {
        using var request = Request(HttpMethod.Get, $"/storage/v1/object/authenticated/{_bucket}/uploads/{fileName}");
        using var response = await _httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        if (!response.IsSuccessStatusCode || response.Content.Headers.ContentLength > MaximumBytes) return null;
        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        var bytes = await ReadBoundedAsync(stream, cancellationToken);
        return bytes is null ? null : new QuotingProductImageContentDto(bytes, fileName.EndsWith(".png", StringComparison.Ordinal) ? "image/png" : "image/jpeg");
    }

    #region Storage protocol
    private HttpRequestMessage Request(HttpMethod method, string path)
    {
        var request = new HttpRequestMessage(method, _origin!.TrimEnd('/') + path);
        // New Supabase secret keys are API keys, not JWT bearer tokens.
        if (!_key!.StartsWith("sb_secret_", StringComparison.Ordinal)) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _key);
        request.Headers.Add("apikey", _key);
        return request;
    }

    private async Task EnsureBucketAsync(CancellationToken cancellationToken)
    {
        using var lookup = Request(HttpMethod.Get, $"/storage/v1/bucket/{_bucket}");
        using var existing = await _httpClient.SendAsync(lookup, cancellationToken);
        if (existing.IsSuccessStatusCode) return;
        if (!await HasStorageStatusAsync(existing, HttpStatusCode.NotFound, cancellationToken)) existing.EnsureSuccessStatusCode();
        using var create = Request(HttpMethod.Post, "/storage/v1/bucket");
        create.Content = JsonContent.Create(new { id = _bucket, name = _bucket, @public = false, file_size_limit = MaximumBytes, allowed_mime_types = new[] { "image/png", "image/jpeg" } });
        using var created = await _httpClient.SendAsync(create, cancellationToken);
        if (!await HasStorageStatusAsync(created, HttpStatusCode.Conflict, cancellationToken)) created.EnsureSuccessStatusCode();
    }

    private static async Task<bool> HasStorageStatusAsync(HttpResponseMessage response, HttpStatusCode expected, CancellationToken cancellationToken)
    {
        if (response.StatusCode == expected) return true;
        if (response.StatusCode != HttpStatusCode.BadRequest) return false;
        // Storage's legacy HTTP API wraps 404/409 errors in HTTP 400.
        try
        {
            var error = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken);
            return error.ValueKind == JsonValueKind.Object && error.TryGetProperty("statusCode", out var status)
                && status.ToString() == ((int)expected).ToString(System.Globalization.CultureInfo.InvariantCulture);
        }
        catch (JsonException) { return false; }
    }
    #endregion

    #region Image normalization
    private sealed record NormalizedImage(byte[] Data, string ContentType, int Width, int Height);
    private static NormalizedImage? Normalize(byte[] input, string contentType)
    {
        using var data = SKData.CreateCopy(input);
        using var codec = SKCodec.Create(data);
        if (codec is null || codec.Info.Width <= 0 || codec.Info.Height <= 0 || (long)codec.Info.Width * codec.Info.Height > MaximumPixels
            || (codec.EncodedFormat != SKEncodedImageFormat.Png && codec.EncodedFormat != SKEncodedImageFormat.Jpeg)
            || (codec.EncodedFormat == SKEncodedImageFormat.Png) != (contentType == "image/png")) return null;
        using var bitmap = SKBitmap.Decode(codec);
        if (bitmap is null) return null;
        var swapped = (int)codec.EncodedOrigin >= 5;
        var orientedWidth = swapped ? bitmap.Height : bitmap.Width;
        var orientedHeight = swapped ? bitmap.Width : bitmap.Height;
        var scale = Math.Min(1f, (float)OutputEdge / Math.Max(orientedWidth, orientedHeight));
        var width = Math.Max(1, (int)Math.Round(orientedWidth * scale));
        var height = Math.Max(1, (int)Math.Round(orientedHeight * scale));
        using var output = new SKBitmap(width, height, SKColorType.Rgba8888, SKAlphaType.Premul);
        using (var canvas = new SKCanvas(output))
        {
            canvas.Clear(contentType == "image/png" ? SKColors.Transparent : SKColors.White);
            var matrix = Orientation(codec.EncodedOrigin, bitmap.Width, bitmap.Height, scale);
            canvas.SetMatrix(matrix);
            using var image = SKImage.FromBitmap(bitmap);
            canvas.DrawImage(image, 0, 0, new SKSamplingOptions(SKCubicResampler.Mitchell));
        }
        using var normalized = SKImage.FromBitmap(output);
        using var encoded = normalized.Encode(contentType == "image/png" ? SKEncodedImageFormat.Png : SKEncodedImageFormat.Jpeg, 88);
        if (encoded is null || encoded.Size > MaximumBytes) return null;
        return new NormalizedImage(encoded.ToArray(), contentType, width, height);
    }

    private static SKMatrix Orientation(SKEncodedOrigin origin, int width, int height, float scale)
    {
        var matrix = SKMatrix.Identity;
        switch ((int)origin)
        {
            case 2: matrix.ScaleX = -1; matrix.TransX = width; break;
            case 3: matrix.ScaleX = -1; matrix.ScaleY = -1; matrix.TransX = width; matrix.TransY = height; break;
            case 4: matrix.ScaleY = -1; matrix.TransY = height; break;
            case 5: matrix.ScaleX = 0; matrix.ScaleY = 0; matrix.SkewX = 1; matrix.SkewY = 1; break;
            case 6: matrix.ScaleX = 0; matrix.ScaleY = 0; matrix.SkewX = -1; matrix.SkewY = 1; matrix.TransX = height; break;
            case 7: matrix.ScaleX = 0; matrix.ScaleY = 0; matrix.SkewX = -1; matrix.SkewY = -1; matrix.TransX = height; matrix.TransY = width; break;
            case 8: matrix.ScaleX = 0; matrix.ScaleY = 0; matrix.SkewX = 1; matrix.SkewY = -1; matrix.TransY = width; break;
        }
        matrix.ScaleX *= scale; matrix.ScaleY *= scale; matrix.SkewX *= scale; matrix.SkewY *= scale; matrix.TransX *= scale; matrix.TransY *= scale;
        return matrix;
    }

    private static async Task<byte[]?> ReadBoundedAsync(Stream source, CancellationToken cancellationToken)
    {
        using var buffer = new MemoryStream();
        var chunk = new byte[81920];
        int read;
        while ((read = await source.ReadAsync(chunk, cancellationToken)) > 0)
        {
            if (buffer.Length + read > MaximumBytes) return null;
            await buffer.WriteAsync(chunk.AsMemory(0, read), cancellationToken);
        }
        return buffer.ToArray();
    }
    #endregion
}
