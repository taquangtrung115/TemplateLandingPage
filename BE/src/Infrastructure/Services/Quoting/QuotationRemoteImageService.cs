namespace TemplateLandingPage.Infrastructure.Services.Quoting;

using System.Net;
using Microsoft.Extensions.Configuration;
using SkiaSharp;
using TemplateLandingPage.Application.Abstractions;

public sealed class QuotationRemoteImageService(HttpClient httpClient, IConfiguration configuration) : IQuotationRemoteImageService
{
    private const int MaxBytes = 5 * 1024 * 1024;
    private const int MaxPixels = 16_000_000;
    private const int MaxEdge = 1600;
    private readonly HttpClient _httpClient = httpClient;
    private readonly HashSet<string> _allowedHosts = AllowedHosts(configuration);

    public async Task<byte[]?> GetAsync(string imageUrl, CancellationToken cancellationToken)
    {
        if (!Uri.TryCreate(imageUrl, UriKind.Absolute, out var uri) || uri.Scheme != Uri.UriSchemeHttps
            || uri.Port != 443 || uri.UserInfo.Length != 0 || !_allowedHosts.Contains(uri.IdnHost)
            || IPAddress.TryParse(uri.IdnHost, out _) || uri.IsLoopback)
            return null;

        try
        {
            // This client never receives storage credentials and never follows redirects to another host.
            using var request = new HttpRequestMessage(HttpMethod.Get, uri);
            request.Headers.Accept.ParseAdd("image/png, image/jpeg, image/webp");
            using var response = await _httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
            if (!response.IsSuccessStatusCode || response.Content.Headers.ContentLength > MaxBytes)
                return null;

            await using var input = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var buffer = new MemoryStream();
            var chunk = new byte[81920];
            int read;
            while ((read = await input.ReadAsync(chunk, cancellationToken)) != 0)
            {
                if (buffer.Length + read > MaxBytes) return null;
                buffer.Write(chunk, 0, read);
            }
            return Normalize(buffer.ToArray());
        }
        catch (HttpRequestException) { return null; }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested) { return null; }
    }

    private static byte[]? Normalize(byte[] bytes)
    {
        using var data = SKData.CreateCopy(bytes);
        using var codec = SKCodec.Create(data);
        if (codec is null || codec.Info.Width < 1 || codec.Info.Height < 1
            || (long)codec.Info.Width * codec.Info.Height > MaxPixels) return null;
        using var bitmap = SKBitmap.Decode(codec);
        if (bitmap is null) return null;
        if (Math.Max(bitmap.Width, bitmap.Height) <= MaxEdge
            && codec.EncodedFormat is SKEncodedImageFormat.Png or SKEncodedImageFormat.Jpeg)
            return bytes;

        var scale = Math.Min(1d, (double)MaxEdge / Math.Max(bitmap.Width, bitmap.Height));
        using var resized = bitmap.Resize(new SKImageInfo(Math.Max(1, (int)(bitmap.Width * scale)),
            Math.Max(1, (int)(bitmap.Height * scale))), new SKSamplingOptions(SKFilterMode.Linear));
        if (resized is null) return null;
        using var image = SKImage.FromBitmap(resized);
        using var encoded = image.Encode(SKEncodedImageFormat.Png, 100);
        return encoded?.Size <= MaxBytes ? encoded.ToArray() : null;
    }

    private static HashSet<string> AllowedHosts(IConfiguration configuration)
    {
        var hosts = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "images.unsplash.com" };
        foreach (var host in configuration.GetSection("Quoting:Images:AllowedRemoteHosts").GetChildren())
            if (!string.IsNullOrWhiteSpace(host.Value)) hosts.Add(host.Value.Trim());
        var storageUrl = configuration["Quoting:Images:SupabaseUrl"] ?? configuration["Supabase:Url"];
        if (Uri.TryCreate(storageUrl, UriKind.Absolute, out var storageUri) && storageUri.Scheme == Uri.UriSchemeHttps)
            hosts.Add(storageUri.IdnHost);
        return hosts;
    }
}
