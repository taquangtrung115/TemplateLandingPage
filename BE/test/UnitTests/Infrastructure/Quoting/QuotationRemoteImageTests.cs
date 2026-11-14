namespace OnePortal.UnitTests.Infrastructure.Quoting;

using System.Net;
using System.Text;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moq;
using PdfSharp.Pdf;
using PdfSharp.Pdf.Advanced;
using PdfSharp.Pdf.IO;
using SkiaSharp;
using OnePortal.Application.Abstractions;
using OnePortal.Application.Exceptions;
using OnePortal.Domain.Entities.Quoting;
using OnePortal.Infrastructure.Services.Quoting;
using Xunit;

public sealed class QuotationRemoteImageTests
{
    private sealed class Handler(Func<HttpRequestMessage, HttpResponseMessage> send) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) => Task.FromResult(send(request));
    }
    private static byte[] Image(SKEncodedImageFormat format = SKEncodedImageFormat.Png, int width = 48, int height = 32)
    {
        using var bitmap = new SKBitmap(width, height);
        bitmap.Erase(SKColors.Blue);
        using var image = SKImage.FromBitmap(bitmap);
        using var encoded = image.Encode(format, 90);
        return encoded.ToArray();
    }
    private static QuotationRemoteImageService Service(HttpMessageHandler handler, Dictionary<string, string?>? settings = null) => new(
        new HttpClient(handler), new ConfigurationBuilder().AddInMemoryCollection(settings ?? []).Build());

    [Theory]
    [InlineData("http://images.unsplash.com/photo")]
    [InlineData("https://images.unsplash.com.evil.test/photo")]
    [InlineData("https://images.unsplash.com:444/photo")]
    [InlineData("https://user:password@images.unsplash.com/photo")]
    [InlineData("https://127.0.0.1/photo")]
    [InlineData("https://[::1]/photo")]
    [InlineData("https://localhost/photo")]
    [InlineData("file:///photo.png")]
    [InlineData("/unmanaged/photo.png")]
    public async Task UntrustedUrls_NeverMakeAnHttpRequest(string url)
    {
        var service = Service(new Handler(_ => throw new InvalidOperationException("Unexpected HTTP call")));
        (await service.GetAsync(url, default)).Should().BeNull();
    }

    [Fact]
    public async Task AllowedImage_PreservesTheFullSnapshotUrlAndBytes_WithoutStorageCredentials()
    {
        var png = Image();
        const string url = "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=400&fit=crop";
        var service = Service(new Handler(request =>
        {
            request.RequestUri!.AbsoluteUri.Should().Be(url);
            request.Headers.Authorization.Should().BeNull();
            request.Headers.Contains("apikey").Should().BeFalse();
            return new(HttpStatusCode.OK) { Content = new ByteArrayContent(png) };
        }), new() { ["Supabase:ServiceRoleKey"] = "synthetic-private-key" });
        (await service.GetAsync(url, default)).Should().Equal(png);
    }

    [Fact]
    public async Task ConfiguredCdn_IsAllowedExplicitly()
    {
        var png = Image();
        var service = Service(new Handler(_ => new(HttpStatusCode.OK) { Content = new ByteArrayContent(png) }),
            new() { ["Quoting:Images:AllowedRemoteHosts:0"] = "cdn.example.test" });
        (await service.GetAsync("https://cdn.example.test/image.png", default)).Should().Equal(png);
    }

    [Theory]
    [InlineData(HttpStatusCode.Redirect)]
    [InlineData(HttpStatusCode.NotFound)]
    [InlineData(HttpStatusCode.Unauthorized)]
    public async Task FailedOrRedirectedResponses_AreRejected(HttpStatusCode status)
    {
        var service = Service(new Handler(_ => new(status) { Headers = { Location = new Uri("https://127.0.0.1/private") } }));
        (await service.GetAsync("https://images.unsplash.com/photo", default)).Should().BeNull();
    }

    [Theory]
    [InlineData("<svg><script>private()</script></svg>")]
    [InlineData("<html>Not an image</html>")]
    public async Task NonImageBodies_AreRejected(string body)
    {
        var service = Service(new Handler(_ => new(HttpStatusCode.OK) { Content = new StringContent(body) }));
        (await service.GetAsync("https://images.unsplash.com/photo", default)).Should().BeNull();
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task OversizedResponses_AreRejectedWithOrWithoutDeclaredLength(bool declaresLength)
    {
        var service = Service(new Handler(_ =>
        {
            HttpContent content = declaresLength ? new ByteArrayContent(new byte[5 * 1024 * 1024 + 1])
                : new StreamContent(new MemoryStream(new byte[5 * 1024 * 1024 + 1]));
            return new(HttpStatusCode.OK) { Content = content };
        }));
        (await service.GetAsync("https://images.unsplash.com/photo", default)).Should().BeNull();
    }

    [Theory]
    [InlineData(SKEncodedImageFormat.Webp)]
    [InlineData(SKEncodedImageFormat.Png)]
    public async Task LargeOrWebpImages_AreConvertedToBoundedPdfCompatiblePng(SKEncodedImageFormat format)
    {
        var bytes = Image(format, 1800, 1200);
        var service = Service(new Handler(_ => new(HttpStatusCode.OK) { Content = new ByteArrayContent(bytes) }));
        var result = await service.GetAsync("https://images.unsplash.com/photo", default);
        using var decoded = SKBitmap.Decode(result);
        decoded.Width.Should().Be(1600); decoded.Height.Should().Be(1066);
        result![0].Should().Be(0x89);
    }

    [Fact]
    public async Task HtmlAndPdf_EmbedTheDownloadedImage_DeduplicateRepeatedRows_AndDoNotUseProductCode()
    {
        const string url = "https://images.unsplash.com/photo-snapshot?w=400";
        var image = Image();
        var remote = new Mock<IQuotationRemoteImageService>();
        remote.Setup(service => service.GetAsync(url, It.IsAny<CancellationToken>())).ReturnsAsync(image);
        var exporter = new QuotationHtmlExportService(remoteImageService: remote.Object);
        var quotation = Quote(url);
        var template = QuotationTemplate.Create("TPL", "Mẫu", null, true).AddNewVersion("BẢNG BÁO GIÁ", "{}", "Kính gửi", "{}", "{}", "{}", null, null);
        var html = Encoding.UTF8.GetString(await exporter.GenerateHtmlAsync(quotation, template));
        html.Should().Contain("data:image/png;base64," + Convert.ToBase64String(image)).And.NotContain("src=\"https://");
        remote.Verify(service => service.GetAsync(url, It.IsAny<CancellationToken>()), Times.Once);
        remote.Invocations.Clear();
        using var pdf = PdfReader.Open(new MemoryStream(await exporter.GeneratePdfAsync(quotation, template)), PdfDocumentOpenMode.Import);
        var images = pdf.Pages.Cast<PdfPage>().SelectMany(page => page.Resources.Elements.GetDictionary("/XObject")!.Elements.Values)
            .OfType<PdfReference>().Select(reference => reference.Value).OfType<PdfDictionary>().Where(value => value.Elements.GetName("/Subtype") == "/Image");
        images.Should().Contain(value => value.Elements.GetInteger("/Width") == 48 && value.Elements.GetInteger("/Height") == 32);
        remote.Verify(service => service.GetAsync(url, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task UnavailableSavedImage_FailsBothFormatsInsteadOfExportingBlankCells(bool pdf)
    {
        var remote = new Mock<IQuotationRemoteImageService>();
        var exporter = new QuotationHtmlExportService(remoteImageService: remote.Object);
        var template = QuotationTemplate.Create("TPL", "Mẫu", null, true).AddNewVersion("BẢNG BÁO GIÁ", "{}", "Kính gửi", "{}", "{}", "{}", null, null);
        Func<Task> export = async () => { if (pdf) await exporter.GeneratePdfAsync(Quote("https://images.unsplash.com/missing"), template); else await exporter.GenerateHtmlAsync(Quote("https://images.unsplash.com/missing"), template); };
        await export.Should().ThrowAsync<QuotationImageUnavailableException>();
    }

    private static Quotation Quote(string url)
    {
        var quotation = Quotation.Create("BG-REMOTE", null, null, null, null, null, null, null, Guid.NewGuid(), 1, DateTime.UtcNow, null, 0, 0, null, Guid.NewGuid());
        quotation.SetItems(Enumerable.Range(1, 2).Select(index => QuotationItem.Create(quotation.Id, null, "CB-01", "Sản phẩm", null, "Gói", url, "Combo", 1, 18000, 0, null, index)), Guid.NewGuid());
        return quotation;
    }
}
