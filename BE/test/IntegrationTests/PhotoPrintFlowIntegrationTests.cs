namespace OnePortal.IntegrationTests;

using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using OnePortal.Domain.Entities.Tenancy;
using Xunit;

[Collection(PostgresApiCollection.Name)]
public sealed class PhotoPrintFlowIntegrationTests(PostgresApiFixture fixture)
{
    private const string Root = "/t/photoprint-default/api/v1/photoprint";

    [Fact]
    public async Task SeededCatalogSupportsSizeSearchAndRejectsCrossModuleRoute()
    {
        using var guest = fixture.CreateAnonymousClient();
        using var categories = await guest.GetAsync(Root + "/categories");
        categories.EnsureSuccessStatusCode();
        using var family = await ApiTestJson.ReadAsync(categories);
        Assert.Equal(6, family.RootElement.GetProperty("value").GetArrayLength());
        using var products = await guest.GetAsync(Root + "/products?search=15x10&usage=memories");
        products.EnsureSuccessStatusCode();
        using var catalog = await ApiTestJson.ReadAsync(products);
        var productsFound = catalog.RootElement.GetProperty("value").GetProperty("items");
        Assert.Single(productsFound.EnumerateArray());
        Assert.Equal("in-anh-10x15", productsFound[0].GetProperty("slug").GetString());
        using var denied = await guest.GetAsync("/t/landing-default/api/v1/landing/photoprint/products");
        Assert.Equal(HttpStatusCode.NotFound, denied.StatusCode);
        using var newModule = await guest.GetAsync("/api/v1/portal/workspaces/photoprint-default/applications");
        newModule.EnsureSuccessStatusCode();
        using var workspace = await ApiTestJson.ReadAsync(newModule);
        Assert.Equal("photoprint", workspace.RootElement.GetProperty("value").GetProperty("appKeys")[0].GetString());
    }

    [Fact]
    public async Task GuestUploadsOrdersAndTracks_OnlyWorkspaceAdminCanInspectCropAndManage()
    {
        using var guest = fixture.CreateAnonymousClient();
        using var orderPage = await guest.GetAsync(Root + "/products/in-anh-10x15");
        orderPage.EnsureSuccessStatusCode();
        using var product = await ApiTestJson.ReadAsync(orderPage);
        var productId = ApiTestJson.GuidValue(product.RootElement, "value", "id");
        var image = Convert.FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aSuQAAAAASUVORK5CYII=");
        using var request = new MultipartFormDataContent();
        var file = new ByteArrayContent(image);
        file.Headers.ContentType = new MediaTypeHeaderValue("image/png");
        request.Add(file, "file", "sample.png");
        using var upload = await guest.PostAsync(Root + "/uploads/photos?kind=print", request);
        Assert.Equal(HttpStatusCode.Created, upload.StatusCode);
        using var uploaded = await ApiTestJson.ReadAsync(upload);
        var fileUrl = ApiTestJson.StringValue(uploaded.RootElement, "value", "fileUrl");
        using var download = await guest.GetAsync(Root + fileUrl["/api/v1/photoprint".Length..] + "?download=true");
        Assert.Equal(HttpStatusCode.OK, download.StatusCode);
        Assert.Equal("image/png", download.Content.Headers.ContentType!.MediaType);
        Assert.Equal(image, await download.Content.ReadAsByteArrayAsync());
        using var order = await guest.PostAsJsonAsync(Root + "/orders", new
        {
            customerName = "Khách thử ảnh", customerPhone = "0901234567", deliveryMethod = "Pickup", paymentMethod = "Cash",
            items = new[] { new
            {
                productId, sizeLabel = "10 × 15 cm", widthCm = 10, heightCm = 15, surfaceName = "Giấy Fujifilm bóng",
                turnaroundMode = "Standard", quantity = 2, lineTotal = 1,
                photoFiles = new[] { new { fileUrl, originalFileName = "sample.png", widthPx = 3000, heightPx = 4000,
                    computedDpi = 1, fitMode = "Fill", focalX = .3, focalY = .8, printQty = 2, note = "Cân sáng" } },
            } },
        });
        Assert.Equal(HttpStatusCode.Created, order.StatusCode);
        using var confirmed = await ApiTestJson.ReadAsync(order);
        var result = confirmed.RootElement.GetProperty("value");
        var code = result.GetProperty("orderCode").GetString();
        Assert.Equal(5000, result.GetProperty("grandTotal").GetInt32());
        Assert.Equal(2, result.GetProperty("totalPhotoCount").GetInt32());
        Assert.Equal(System.Text.Json.JsonValueKind.Null, result.GetProperty("items")[0].GetProperty("photoFilesJson").ValueKind);

        using var track = await guest.GetAsync(Root + "/orders/track?code=" + code + "&phone=%2B84901234567");
        track.EnsureSuccessStatusCode();
        using var wrong = await guest.GetAsync(Root + "/orders/track?code=" + code + "&phone=0911111111");
        Assert.Equal(HttpStatusCode.NotFound, wrong.StatusCode);
        using var protectedList = await guest.GetAsync(Root + "/orders");
        Assert.Equal(HttpStatusCode.Unauthorized, protectedList.StatusCode);

        var user = await fixture.AddUserAsync("Admin");
        using var otherApp = fixture.CreateClientFor(user.Id, "Admin");
        using var forbidden = await otherApp.GetAsync(Root + "/orders");
        Assert.Equal(HttpStatusCode.Forbidden, forbidden.StatusCode);
        await fixture.WithTenantDatabaseAsync(TenantDefaults.PhotoPrintId, "photoprint", async scoped =>
        {
            scoped.TenantMemberships.Add(TenantMembership.Create(TenantDefaults.PhotoPrintId, user.Id, "photoprint", "Admin"));
            return await scoped.SaveChangesAsync();
        });
        using var admin = fixture.CreateClientFor(user.Id, "User");
        using var orders = await admin.GetAsync(Root + "/orders?search=" + code);
        orders.EnsureSuccessStatusCode();
        using var board = await ApiTestJson.ReadAsync(orders);
        var row = board.RootElement.GetProperty("value").GetProperty("items")[0];
        var orderId = row.GetProperty("id").GetGuid();
        using var pictures = System.Text.Json.JsonDocument.Parse(row.GetProperty("items")[0].GetProperty("photoFilesJson").GetString()!);
        Assert.Equal(677, pictures.RootElement[0].GetProperty("computedDpi").GetInt32());
        Assert.Equal(.3m, pictures.RootElement[0].GetProperty("focalX").GetDecimal());
        using var update = await admin.PutAsJsonAsync($"{Root}/orders/{orderId}/status", new { status = "Printing", expectedRevision = 0, adminNote = "Đang in ảnh." });
        update.EnsureSuccessStatusCode();
        using var conflict = await admin.PutAsJsonAsync($"{Root}/orders/{orderId}/status", new { status = "Completed", expectedRevision = 0 });
        Assert.Equal(HttpStatusCode.Conflict, conflict.StatusCode);
    }

    [Fact]
    public async Task SupportTracksByPhoneOrEmailAndRejectsNonPhotoBytes()
    {
        using var guest = fixture.CreateAnonymousClient();
        using var bad = new MultipartFormDataContent();
        bad.Add(new StringContent("<svg xmlns=\"http://www.w3.org/2000/svg\" />"), "file", "not-an-image.png");
        using var denied = await guest.PostAsync(Root + "/uploads/photos", bad);
        Assert.Equal(HttpStatusCode.BadRequest, denied.StatusCode);
        using var response = await guest.PostAsJsonAsync(Root + "/support-requests", new
        {
            fullName = "Khách hỏi in ảnh", phone = "0903405070", email = "photo@example.test",
            topic = "Kiểm tra độ nét / DPI file", priority = "normal", message = "Nhờ kiểm tra ảnh.",
        });
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        using var data = await ApiTestJson.ReadAsync(response);
        var code = ApiTestJson.StringValue(data.RootElement, "value", "ticketCode");
        using var result = await guest.GetAsync(Root + "/support-requests/track?code=" + code + "&contact=photo%40example.test");
        result.EnsureSuccessStatusCode();
        using var ticket = await ApiTestJson.ReadAsync(result);
        Assert.Equal("New", ApiTestJson.StringValue(ticket.RootElement, "value", "status"));
    }
}
