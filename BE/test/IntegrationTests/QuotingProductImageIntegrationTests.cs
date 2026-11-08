namespace TemplateLandingPage.IntegrationTests;

using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using PdfSharp.Pdf;
using PdfSharp.Pdf.Advanced;
using PdfSharp.Pdf.IO;
using SkiaSharp;
using Xunit;

[Collection(PostgresApiCollection.Name)]
public sealed class QuotingProductImageIntegrationTests(PostgresApiFixture fixture)
{
    #region Helpers
    private static byte[] Png(SKColor color, int width = 113, int height = 79)
    {
        using var bitmap = new SKBitmap(width, height); using var canvas = new SKCanvas(bitmap); canvas.Clear(color);
        using var image = SKImage.FromBitmap(bitmap); using var encoded = image.Encode(SKEncodedImageFormat.Png, 100); return encoded.ToArray();
    }
    private static async Task<HttpResponseMessage> UploadAsync(HttpClient client, byte[] bytes, string type = "image/png")
    {
        using var multipart = new MultipartFormDataContent(); var content = new ByteArrayContent(bytes); content.Headers.ContentType = new MediaTypeHeaderValue(type);
        multipart.Add(content, "file", "user-photo.png"); return await client.PostAsync("/api/v1/quoting/products/images", multipart);
    }
    private static async Task<JsonElement> ValueAsync(HttpResponseMessage response)
    {
        response.IsSuccessStatusCode.Should().BeTrue(await response.Content.ReadAsStringAsync()); using var json = await ApiTestJson.ReadAsync(response); return (json.RootElement.TryGetProperty("value", out var value) ? value : json.RootElement).Clone();
    }
    private static async Task<JsonElement> SendAsync(HttpClient client, HttpMethod method, string url, object body)
    {
        using var response = await ApiTestJson.SendJsonAsync(client, method, url, body); return await ValueAsync(response);
    }
    #endregion

    [Fact]
    public async Task UploadToSaveToQuotation_UsesTheUploadedImageInHtmlPdf_AndPreservesOldImageAfterReplacement()
    {
        var user = await fixture.AddUserAsync("Admin"); using var admin = fixture.CreateClientFor(user.Id, "Admin");
        using var upload = await UploadAsync(admin, Png(SKColors.Red)); var uploaded = (await ValueAsync(upload)).GetProperty("image");
        var url = uploaded.GetProperty("imageUrl").GetString()!; url.Should().StartWith("/api/v1/quoting/product-images/uploads/");
        using var anonymous = fixture.CreateAnonymousClient(); using var imageResponse = await anonymous.GetAsync(url);
        imageResponse.StatusCode.Should().Be(HttpStatusCode.OK); imageResponse.Content.Headers.ContentType!.MediaType.Should().Be("image/png");
        var photo = await imageResponse.Content.ReadAsByteArrayAsync(); using var decoded = SKBitmap.Decode(photo); decoded.Width.Should().Be(113); decoded.Height.Should().Be(79);
        var code = "IMAGE-" + Guid.NewGuid().ToString("N");
        var product = await SendAsync(admin, HttpMethod.Post, "/api/v1/quoting/products", new { code, name = "Sản phẩm có ảnh tải lên", unit = "Gói", price = 18000, imageUrl = url });
        await fixture.WithDatabaseAsync(async db => { await TemplateLandingPage.Persistence.Data.QuotingSeeder.SeedAsync(db); return true; });
        var quote = await SendAsync(admin, HttpMethod.Post, "/api/v1/quoting/quotations", new { issueDate = DateTime.UtcNow, items = new[] { new { productId = product.GetGuid(), productCode = code, productName = "Ảnh theo báo giá", unit = "Gói", unitPrice = 20000, quantity = 1, imageUrl = url } } });
        using var secondUpload = await UploadAsync(admin, Png(SKColors.Blue)); var replacement = (await ValueAsync(secondUpload)).GetProperty("image").GetProperty("imageUrl").GetString(); replacement.Should().NotBe(url);
        await SendAsync(admin, HttpMethod.Put, $"/api/v1/quoting/products/{product.GetGuid()}", new { code, name = "Sản phẩm đã đổi ảnh", unit = "Gói", price = 18000, imageUrl = replacement, isActive = true });
        using var detailResponse = await admin.GetAsync($"/api/v1/quoting/quotations/{quote.GetGuid()}");
        (await ValueAsync(detailResponse)).GetProperty("items")[0].GetProperty("imageUrl").GetString().Should().Be(url);
        foreach(var format in new[] { "html", "pdf" })
        {
            var export = await SendAsync(admin, HttpMethod.Post, $"/api/v1/quoting/quotations/{quote.GetGuid()}/export", new { fileType = format });
            using var downloaded = await admin.GetAsync($"/api/v1/quoting/quotations/{quote.GetGuid()}/files/{export.GetProperty("id").GetGuid()}/download");
            downloaded.StatusCode.Should().Be(HttpStatusCode.OK); var bytes = await downloaded.Content.ReadAsByteArrayAsync();
            if(format == "html") Encoding.UTF8.GetString(bytes).Should().Contain("data:image/png;base64," + Convert.ToBase64String(photo));
            else
            {
                using var pdf = PdfReader.Open(new MemoryStream(bytes), PdfDocumentOpenMode.Import);
                var images = pdf.Pages[0].Resources.Elements.GetDictionary("/XObject")!.Elements.Values.OfType<PdfReference>().Select(reference => reference.Value).OfType<PdfDictionary>();
                images.Should().Contain(image => image.Elements.GetName("/Subtype") == "/Image" && image.Elements.GetInteger("/Width") == 113 && image.Elements.GetInteger("/Height") == 79);
            }
        }
        using var oldImage = await anonymous.GetAsync(url); oldImage.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Upload_IsAdminOnly_AndCannotBeEnabledByForgingTheTokenRole()
    {
        var user = await fixture.AddUserAsync(); using var anonymous = fixture.CreateAnonymousClient(); using var normal = fixture.CreateClientFor(user.Id, "User"); using var forged = fixture.CreateClientFor(user.Id, "Admin");
        foreach(var client in new[] { anonymous, normal, forged }) { using var response = await UploadAsync(client, Png(SKColors.Red)); response.StatusCode.Should().Be(client == anonymous ? HttpStatusCode.Unauthorized : HttpStatusCode.Forbidden); }
    }

    [Theory]
    [InlineData("image/svg+xml")]
    [InlineData("image/png")]
    [InlineData("image/jpeg")]
    public async Task FakeOrUnsupportedImages_ReturnValidation(string contentType)
    {
        var user = await fixture.AddUserAsync("Admin"); using var admin = fixture.CreateClientFor(user.Id, "Admin"); using var response = await UploadAsync(admin, Encoding.UTF8.GetBytes("<svg>not a valid product photo</svg>"), contentType); response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task OversizedFilesAndPixelBombs_AreRejected_AndNormalPhotosAreReduced()
    {
        var user = await fixture.AddUserAsync("Admin"); using var admin = fixture.CreateClientFor(user.Id, "Admin");
        using var tooLarge = await UploadAsync(admin, new byte[5 * 1024 * 1024 + 1]); tooLarge.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        using var tooManyPixels = await UploadAsync(admin, Png(SKColors.Red, 5000, 4000)); tooManyPixels.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        using var normal = await UploadAsync(admin, Png(SKColors.Red, 2400, 1200)); var resized = (await ValueAsync(normal)).GetProperty("image"); resized.GetProperty("width").GetInt32().Should().Be(1600); resized.GetProperty("height").GetInt32().Should().Be(800);
    }

    [Theory]
    [InlineData("invalid.png")]
    [InlineData("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.svg")]
    public async Task UnknownImageIdentifiers_ReturnNotFound(string fileName)
    {
        using var client = fixture.CreateAnonymousClient(); using var response = await client.GetAsync("/api/v1/quoting/product-images/uploads/" + fileName); response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
