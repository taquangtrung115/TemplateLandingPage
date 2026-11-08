namespace TemplateLandingPage.IntegrationTests;

using System.Collections.Concurrent;
using System.Net;
using System.Text;
using System.Text.Json;

internal sealed class FakeSupabaseImageHandler : HttpMessageHandler
{
    private readonly ConcurrentDictionary<string, (byte[] Bytes, string Mime)> _objects = new();
    private bool _hasBucket;
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        if (request.Headers.Authorization?.Parameter != "synthetic-image-key") return new(HttpStatusCode.Unauthorized);
        var path = request.RequestUri!.AbsolutePath;
        if (path == "/storage/v1/bucket/product-images" && request.Method == HttpMethod.Get) return new(_hasBucket ? HttpStatusCode.OK : HttpStatusCode.BadRequest) { Content = new StringContent(_hasBucket ? "{}" : "{\"statusCode\":\"404\",\"code\":\"NoSuchBucket\"}", Encoding.UTF8, "application/json") };
        if (path == "/storage/v1/bucket" && request.Method == HttpMethod.Post)
        {
            using var content = JsonDocument.Parse(await request.Content!.ReadAsStringAsync(cancellationToken));
            if (content.RootElement.GetProperty("public").GetBoolean()) throw new InvalidOperationException("Product image bucket must be private.");
            _hasBucket = true; return new(HttpStatusCode.OK) { Content = new StringContent("{}") };
        }
        if (path.StartsWith("/storage/v1/object/product-images/uploads/", StringComparison.Ordinal) && request.Method == HttpMethod.Post)
        {
            var key = path.Split('/')[^1];
            if (!_objects.TryAdd(key, (await request.Content!.ReadAsByteArrayAsync(cancellationToken), request.Content.Headers.ContentType!.MediaType!))) return new(HttpStatusCode.Conflict);
            return new(HttpStatusCode.OK) { Content = new StringContent("{}") };
        }
        if (path.StartsWith("/storage/v1/object/authenticated/product-images/uploads/", StringComparison.Ordinal) && request.Method == HttpMethod.Get)
        {
            if (!_objects.TryGetValue(path.Split('/')[^1], out var image)) return new(HttpStatusCode.NotFound);
            var response = new HttpResponseMessage(HttpStatusCode.OK) { Content = new ByteArrayContent(image.Bytes) };
            response.Content.Headers.ContentType = new(image.Mime); return response;
        }
        throw new InvalidOperationException("Unexpected storage request: " + path);
    }
}
