namespace OnePortal.UnitTests.Infrastructure.Quoting;

using System.Net;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using SkiaSharp;
using OnePortal.Infrastructure.Services.Quoting;
using OnePortal.Application.UseCases.V1.Quoting.Products.Helpers;
using Xunit;

public sealed class ProductImageStorageTests
{
    private sealed class StubHandler(Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> send) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) => send(request, cancellationToken);
    }
    private static SupabaseProductImageService Service(HttpMessageHandler handler, bool configured = true) => new(new HttpClient(handler),
        new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string,string?> { ["Supabase:Url"] = configured ? "https://storage.example.test" : null, ["Supabase:ServiceRoleKey"] = configured ? "synthetic-secret" : null }).Build(), NullLogger<SupabaseProductImageService>.Instance);
    private static byte[] Png()
    {
        using var bitmap = new SKBitmap(48, 32); using var canvas = new SKCanvas(bitmap); canvas.Clear(SKColors.Purple); using var image = SKImage.FromBitmap(bitmap); using var encoded = image.Encode(SKEncodedImageFormat.Png, 100); return encoded.ToArray();
    }

    [Theory]
    [InlineData(HttpStatusCode.NotFound)]
    [InlineData(HttpStatusCode.BadRequest)]
    public async Task Upload_AutoCreatesPrivateBucket_UsesServerCredentialsAndImmutableObjectKey(HttpStatusCode missingBucketStatus)
    {
        var calls = new List<string>();
        var service = Service(new StubHandler(async (request, ct) =>
        {
            calls.Add(request.Method + " " + request.RequestUri!.AbsolutePath);
            request.Headers.Authorization!.Parameter.Should().Be("synthetic-secret");
            if(request.Method == HttpMethod.Get) return new(missingBucketStatus) { Content = new StringContent("{\"statusCode\":\"404\"}", Encoding.UTF8, "application/json") };
            if(request.RequestUri.AbsolutePath == "/storage/v1/bucket")
            {
                using var json = JsonDocument.Parse(await request.Content!.ReadAsStringAsync(ct)); json.RootElement.GetProperty("public").GetBoolean().Should().BeFalse(); return new(HttpStatusCode.OK);
            }
            request.RequestUri.AbsolutePath.Should().StartWith("/storage/v1/object/product-images/uploads/");
            QuotingProductImageAddress.IsFileName(request.RequestUri.Segments[^1]).Should().BeTrue();
            using var decoded = SKBitmap.Decode(await request.Content!.ReadAsByteArrayAsync(ct)); decoded.Width.Should().Be(48); decoded.Height.Should().Be(32);
            return new(HttpStatusCode.OK);
        }));
        using var source = new MemoryStream(Png()); var result = await service.UploadAsync(source, "image/png", default);
        result.IsSuccess.Should().BeTrue(); result.Value.ImageUrl.Should().StartWith(QuotingProductImageAddress.Prefix); result.Value.ImageUrl.Should().NotContain("synthetic-secret"); calls.Should().HaveCount(3); source.CanRead.Should().BeTrue();
    }

    [Theory]
    [InlineData(HttpStatusCode.Conflict)]
    [InlineData(HttpStatusCode.BadRequest)]
    public async Task ConcurrentBucketCreation_ContinuesWhenAnotherUploadCreatedTheBucket(HttpStatusCode conflictStatus)
    {
        var service = Service(new StubHandler((request, _) => Task.FromResult(request.Method == HttpMethod.Get
            ? new HttpResponseMessage(HttpStatusCode.NotFound)
            : request.RequestUri!.AbsolutePath == "/storage/v1/bucket"
                ? new HttpResponseMessage(conflictStatus) { Content = new StringContent("{\"statusCode\":\"409\"}", Encoding.UTF8, "application/json") }
                : new HttpResponseMessage(HttpStatusCode.OK))));
        using var source = new MemoryStream(Png()); (await service.UploadAsync(source, "image/png", default)).IsSuccess.Should().BeTrue();
    }

    [Fact]
    public async Task NewSecretApiKey_IsSentOnlyInApiKeyHeader()
    {
        var service = new SupabaseProductImageService(new HttpClient(new StubHandler((request, _) =>
        {
            request.Headers.GetValues("apikey").Should().ContainSingle().Which.Should().Be("sb_secret_synthetic");
            request.Headers.Authorization.Should().BeNull(); return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK));
        })), new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        { ["Quoting:Images:SupabaseUrl"] = "https://storage.example.test", ["Quoting:Images:SecretKey"] = "sb_secret_synthetic" }).Build(), NullLogger<SupabaseProductImageService>.Instance);
        using var source = new MemoryStream(Png()); (await service.UploadAsync(source, "image/png", default)).IsSuccess.Should().BeTrue();
    }

    [Fact]
    public async Task JpegWithPhoneOrientation_IsRotatedAndReencodedWithoutExif()
    {
        using var bitmap = new SKBitmap(48, 32); using var canvas = new SKCanvas(bitmap); canvas.Clear(SKColors.Green);
        using var image = SKImage.FromBitmap(bitmap); using var jpeg = image.Encode(SKEncodedImageFormat.Jpeg, 90);
        // APP1: EXIF little-endian TIFF with orientation=6 (90 degrees clockwise).
        var exif = Convert.FromHexString("FFE1002245786966000049492A0008000000010012010300010000000600000000000000");
        var bytes = jpeg.ToArray(); using var source = new MemoryStream(bytes[..2].Concat(exif).Concat(bytes[2..]).ToArray());
        var service = Service(new StubHandler(async (request, ct) =>
        {
            if (request.Method == HttpMethod.Post && request.RequestUri!.AbsolutePath.Contains("/object/"))
            {
                request.Content!.Headers.ContentType!.MediaType.Should().Be("image/jpeg");
                var output = await request.Content.ReadAsByteArrayAsync(ct); using var decoded = SKBitmap.Decode(output);
                decoded.Width.Should().Be(32); decoded.Height.Should().Be(48); Encoding.ASCII.GetString(output).Should().NotContain("Exif");
            }
            return new(HttpStatusCode.OK);
        }));
        var result = await service.UploadAsync(source, "image/jpeg", default); result.IsSuccess.Should().BeTrue(); result.Value.ImageUrl.Should().EndWith(".jpg");
    }

    [Fact]
    public async Task MissingConfiguration_FailsClearlyInsteadOfPretendingTheUploadSucceeded()
    {
        var service = Service(new StubHandler((_,_) => throw new InvalidOperationException("Network must not be called")), configured:false);
        using var source = new MemoryStream(Png()); var result = await service.UploadAsync(source,"image/png",default);
        result.IsFailure.Should().BeTrue(); result.Error.Code.Should().Be("QuotingProductImage.Unavailable");
    }

    [Fact]
    public async Task ProviderErrors_DoNotLeakSecretOrResponseBody()
    {
        var service = Service(new StubHandler((_,_) => Task.FromResult(new HttpResponseMessage(HttpStatusCode.Unauthorized) {Content = new StringContent("secret provider details synthetic-secret")})));
        using var source = new MemoryStream(Png()); var result = await service.UploadAsync(source,"image/png",default);
        result.IsFailure.Should().BeTrue(); result.Error.Message.Should().NotContain("synthetic-secret").And.NotContain("provider details");
    }

    [Theory]
    [InlineData("https://attacker.test/image.png")]
    [InlineData("../quote.pdf")]
    [InlineData("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.svg")]
    public async Task Read_DoesNotFetchCallerAddressesOrForeignFileTypes(string fileName)
    {
        var service = Service(new StubHandler((_,_) => throw new InvalidOperationException("Network must not be called")));
        (await service.GetAsync(fileName,default)).Should().BeNull();
    }

    [Fact]
    public async Task Cancellation_PropagatesWithoutReportingSuccess()
    {
        using var cancellation = new CancellationTokenSource(); cancellation.Cancel();
        var service = Service(new StubHandler((_,_) => throw new InvalidOperationException("Network must not be called"))); using var stream = new MemoryStream(Png());
        await ((Func<Task>)(async()=>await service.UploadAsync(stream,"image/png",cancellation.Token))).Should().ThrowAsync<OperationCanceledException>();
    }

    [Theory]
    [InlineData("not-an-image")]
    [InlineData("<svg xmlns='http://www.w3.org/2000/svg'><script>alert(1)</script></svg>")]
    public async Task FakePngContent_IsRejectedBeforeStorage(string payload)
    {
        var service = Service(new StubHandler((_,_) => throw new InvalidOperationException("Network must not be called"))); using var stream = new MemoryStream(Encoding.UTF8.GetBytes(payload));
        var result = await service.UploadAsync(stream,"image/png",default); result.IsFailure.Should().BeTrue(); result.Error.Code.Should().Be("QuotingProductImage.InvalidImage");
    }
}
