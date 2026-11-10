namespace TemplateLandingPage.IntegrationTests;

using System.Net;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using TemplateLandingPage.Persistence.Data;
using Xunit;

[Collection(PostgresApiCollection.Name)]
public sealed class QuotingRegressionIntegrationTests(PostgresApiFixture fixture)
{
    #region Setup
    private async Task<HttpClient> AdminAsync()
    {
        await fixture.WithDatabaseAsync(async context => { await QuotingSeeder.SeedAsync(context); return true; });
        var user = await fixture.AddUserAsync("Admin");
        return fixture.CreateClientFor(user.Id, "Admin");
    }

    private static async Task<JsonElement> SendAsync(HttpClient client, HttpMethod method, string uri, object data)
    {
        using var response = await ApiTestJson.SendJsonAsync(client, method, uri, data);
        response.IsSuccessStatusCode.Should().BeTrue(await response.Content.ReadAsStringAsync());
        using var json = await ApiTestJson.ReadAsync(response);
        return json.RootElement.GetProperty("value").Clone();
    }

    private static async Task<JsonElement> GetAsync(HttpClient client, string uri)
    {
        using var response = await client.GetAsync(uri);
        response.IsSuccessStatusCode.Should().BeTrue(await response.Content.ReadAsStringAsync());
        using var json = await ApiTestJson.ReadAsync(response);
        return json.RootElement.GetProperty("value").Clone();
    }

    private static object Item(decimal price = 12000m, decimal quantity = 1.5m, Guid? productId = null) => new
    {
        productId, productCode = "CB-01", productName = "Combo nguyên bản", description = "Sản phẩm thử nghiệm tiếng Việt", unit = "GÓI",
        quantity, unitPrice = price, discountPercent = 0m,
        imageUrl = "/api/v1/quoting/product-images/CB-01.png", sortOrder = 1
    };

    private static async Task<Guid> CreateQuotationAsync(HttpClient client, decimal price = 12000m, Guid? productId = null, Guid? templateId = null, int? templateVersion = null, Guid? customerId = null)
    {
        var value = await SendAsync(client, HttpMethod.Post, "/api/v1/quoting/quotations", new
        {
            customerId, templateId, templateVersion, issueDate = DateTime.UtcNow, validUntil = DateTime.UtcNow.AddDays(30),
            discountPercent = 10m, taxPercent = 8m, notes = "Kiểm tra giá theo khách hàng", items = new[] { Item(price, productId: productId) }
        });
        return value.GetGuid();
    }

    private static async Task<Guid> CreateProductAsync(HttpClient client) => (await SendAsync(client, HttpMethod.Post, "/api/v1/quoting/products", new
    {
        code = $"TEST-{Guid.NewGuid():N}", name = "Sản phẩm kiểm thử", unit = "GÓI", price = 18000m, category = "A/ DÒNG COMBO", isActive = true
    })).GetGuid();
    #endregion

    [Fact]
    public async Task ExportVatOptions_ChangeOnlyTheSelectedFileAndPreview_AndAreValidated()
    {
        using var client = await AdminAsync();
        var id = await CreateQuotationAsync(client);
        var before = await GetAsync(client, $"/api/v1/quoting/quotations/{id}");
        var withoutVat = await GetAsync(client, $"/api/v1/quoting/quotations/{id}/preview?taxPercent=0");
        withoutVat.GetProperty("htmlContent").GetString().Should().NotContain("Thuế VAT (");
        var withVat = await GetAsync(client, $"/api/v1/quoting/quotations/{id}/preview?taxPercent=10");
        withVat.GetProperty("htmlContent").GetString().Should().Contain("Thuế VAT (10%)");
        foreach (var rate in new[] { 0m, 10m })
        {
            var file = await SendAsync(client, HttpMethod.Post, $"/api/v1/quoting/quotations/{id}/export", new { fileType = "html", taxPercent = rate });
            using var download = await client.GetAsync($"/api/v1/quoting/quotations/{id}/files/{file.GetProperty("id").GetGuid()}/download");
            var html = await download.Content.ReadAsStringAsync();
            html.Contains("Thuế VAT (").Should().Be(rate > 0);
        }
        var after = await GetAsync(client, $"/api/v1/quoting/quotations/{id}");
        after.GetProperty("taxPercent").GetDecimal().Should().Be(before.GetProperty("taxPercent").GetDecimal());
        after.GetProperty("totalAmount").GetDecimal().Should().Be(before.GetProperty("totalAmount").GetDecimal());
        foreach (var invalidRate in new[] { -1m, 101m, 8.123m })
        {
            using var invalid = await ApiTestJson.SendJsonAsync(client, HttpMethod.Post, $"/api/v1/quoting/quotations/{id}/export", new { fileType = "pdf", taxPercent = invalidRate });
            invalid.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }
    }

    #region Security and contracts
    [Theory]
    [InlineData("GET", "/api/v1/quoting/products")]
    [InlineData("GET", "/api/v1/quoting/customers")]
    [InlineData("GET", "/api/v1/quoting/templates")]
    [InlineData("GET", "/api/v1/quoting/quotations")]
    [InlineData("GET", "/api/v1/quoting/quotations/summary")]
    [InlineData("POST", "/api/v1/quoting/support-requests")]
    public async Task QuotingEndpoints_RequireAuthentication(string method, string route)
    {
        using var client = fixture.CreateAnonymousClient();
        using var response = await client.SendAsync(new HttpRequestMessage(new HttpMethod(method), route) { Content = ApiTestJson.Json(new { }) });
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Theory]
    [InlineData("/api/v1/quoting/products")]
    [InlineData("/api/v1/quoting/templates")]
    public async Task AUserClaimingAdmin_CannotWriteCatalogOrTemplates(string route)
    {
        var user = await fixture.AddUserAsync("User");
        using var client = fixture.CreateClientFor(user.Id, "Admin");
        using var response = await ApiTestJson.SendJsonAsync(client, HttpMethod.Post, route, new { });
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Theory]
    [InlineData("page=0")]
    [InlineData("page=-1")]
    [InlineData("pageSize=0")]
    [InlineData("pageSize=101")]
    [InlineData("page=abc")]
    public async Task InvalidPaging_ReturnsBadRequest(string query)
    {
        using var client = await AdminAsync();
        using var response = await client.GetAsync($"/api/v1/quoting/quotations?{query}");
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Theory]
    [InlineData(-1, 0, 1, 1)]
    [InlineData(101, 0, 1, 1)]
    [InlineData(0, 101, 1, 1)]
    [InlineData(0, 0, 0, 1)]
    [InlineData(0, 0, 1, -1)]
    public async Task InvalidAmounts_ReturnValidationRatherThanInternalError(decimal discount, decimal tax, decimal quantity, decimal price)
    {
        using var client = await AdminAsync();
        using var response = await ApiTestJson.SendJsonAsync(client, HttpMethod.Post, "/api/v1/quoting/quotations", new
        {
            discountPercent = discount, taxPercent = tax, items = new[] { Item(price, quantity) }
        });
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
    #endregion

    #region Complete workflows
    [Fact]
    public async Task GenericQuotation_UsesDefaultTemplate_AndExportsAnAuthenticatedPdf()
    {
        using var client = await AdminAsync();
        var id = await CreateQuotationAsync(client);
        var detail = await GetAsync(client, $"/api/v1/quoting/quotations/{id}");
        detail.GetProperty("customerId").ValueKind.Should().Be(JsonValueKind.Null);
        detail.GetProperty("customerName").GetString().Should().Be("QUÝ KHÁCH HÀNG");
        detail.GetProperty("totalAmount").GetDecimal().Should().Be(17496m);
        var preview = await GetAsync(client, $"/api/v1/quoting/quotations/{id}/preview");
        preview.GetProperty("htmlContent").GetString().Should().NotContain("<div class=\"customer-box\">");

        var file = await SendAsync(client, HttpMethod.Post, $"/api/v1/quoting/quotations/{id}/export", new { fileType = "pdf" });
        var fileId = file.GetProperty("id").GetGuid();
        using var download = await client.GetAsync($"/api/v1/quoting/quotations/{id}/files/{fileId}/download");
        download.StatusCode.Should().Be(HttpStatusCode.OK);
        download.Content.Headers.ContentType!.MediaType.Should().Be("application/pdf");
        Encoding.ASCII.GetString((await download.Content.ReadAsByteArrayAsync())[..8]).Should().Be("%PDF-1.4");
        using var anonymous = fixture.CreateAnonymousClient();
        (await anonymous.GetAsync(file.GetProperty("fileUrl").GetString())).StatusCode.Should().Be(HttpStatusCode.NotFound);
        (await anonymous.GetAsync($"/api/v1/quoting/quotations/{id}/files/{fileId}/download")).StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        (await client.GetAsync($"/api/v1/quoting/quotations/{id}/files/{Guid.NewGuid()}/download")).StatusCode.Should().Be(HttpStatusCode.NotFound);
        var anotherId = await CreateQuotationAsync(client);
        (await client.GetAsync($"/api/v1/quoting/quotations/{anotherId}/files/{fileId}/download")).StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task QuotationPriceOverrides_AndDraftEdits_DoNotModifyTheCatalog()
    {
        using var client = await AdminAsync();
        var productId = await CreateProductAsync(client);
        var id = await CreateQuotationAsync(client, price: 10000, productId: productId);
        var product = await GetAsync(client, $"/api/v1/quoting/products/{productId}");
        product.GetProperty("price").GetDecimal().Should().Be(18000);
        var update = new { code = product.GetProperty("code").GetString(), name = "Sản phẩm đã đổi giá", unit = "GÓI", price = 22000m, isActive = true };
        (await ApiTestJson.SendJsonAsync(client, HttpMethod.Put, $"/api/v1/quoting/products/{productId}", update)).StatusCode.Should().Be(HttpStatusCode.OK);
        var unchanged = await GetAsync(client, $"/api/v1/quoting/quotations/{id}");
        unchanged.GetProperty("items")[0].GetProperty("unitPrice").GetDecimal().Should().Be(10000);
        using var edit = await ApiTestJson.SendJsonAsync(client, HttpMethod.Put, $"/api/v1/quoting/quotations/{id}", new
        {
            customerId = (Guid?)null, issueDate = DateTime.UtcNow, validUntil = DateTime.UtcNow.AddDays(10), discountPercent = 5m, taxPercent = 8m, notes = "Đổi riêng báo giá",
            items = new[] { Item(20000, 2.5m, productId) }
        });
        edit.StatusCode.Should().Be(HttpStatusCode.OK, await edit.Content.ReadAsStringAsync());
        var changed = await GetAsync(client, $"/api/v1/quoting/quotations/{id}");
        changed.GetProperty("items").GetArrayLength().Should().Be(1);
        changed.GetProperty("totalAmount").GetDecimal().Should().Be(51300);
        (await GetAsync(client, $"/api/v1/quoting/products/{productId}")).GetProperty("price").GetDecimal().Should().Be(22000);
        changed.GetProperty("histories").EnumerateArray().Select(history => history.GetProperty("id").GetGuid()).Should().OnlyHaveUniqueItems();
    }

    [Fact]
    public async Task PublishingNewTemplateVersion_DoesNotChangeExistingQuotationPreview()
    {
        using var client = await AdminAsync();
        var code = $"TPL-{Guid.NewGuid():N}";
        var v1 = new { code, name = "Mẫu riêng", isSystem = false, title = "TIÊU ĐỀ PHIÊN BẢN MỘT", sellerInfoJson = "{\"companyName\":\"Đơn vị bán\"}", salutationText = "Xin chào", columnsConfigJson = "{}", paymentTermsJson = "{}", signatureConfigJson = "{}" };
        var templateId = (await SendAsync(client, HttpMethod.Post, "/api/v1/quoting/templates", v1)).GetGuid();
        var oldId = await CreateQuotationAsync(client, templateId: templateId, templateVersion: 1);
        await SendAsync(client, HttpMethod.Post, $"/api/v1/quoting/templates/{templateId}/versions", new
        {
            title = "TIÊU ĐỀ PHIÊN BẢN HAI", v1.sellerInfoJson, v1.salutationText, v1.columnsConfigJson,
            paymentTermsJson = "{\"bankAccounts\":[{\"accountNumber\":\"999888\",\"accountHolder\":\"Chủ mới\",\"bankName\":\"Ngân hàng mới\"}]}", v1.signatureConfigJson
        });
        var oldPreview = (await GetAsync(client, $"/api/v1/quoting/quotations/{oldId}/preview")).GetProperty("htmlContent").GetString();
        oldPreview.Should().Contain(v1.title).And.NotContain("TIÊU ĐỀ PHIÊN BẢN HAI");
        var newId = await CreateQuotationAsync(client, templateId: templateId);
        var newPreview = (await GetAsync(client, $"/api/v1/quoting/quotations/{newId}/preview")).GetProperty("htmlContent").GetString();
        newPreview.Should().Contain("TIÊU ĐỀ PHIÊN BẢN HAI").And.Contain("999888").And.Contain("Chủ mới");
    }

    [Fact]
    public async Task StatusIsCanonical_InvalidStatusFails_AndSentQuotationCannotBeEdited()
    {
        using var client = await AdminAsync();
        var id = await CreateQuotationAsync(client);
        using var invalid = await ApiTestJson.SendJsonAsync(client, HttpMethod.Put, $"/api/v1/quoting/quotations/{id}/status", new { status = "invalid" });
        invalid.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        using var sent = await ApiTestJson.SendJsonAsync(client, HttpMethod.Put, $"/api/v1/quoting/quotations/{id}/status", new { status = " sent " });
        sent.StatusCode.Should().Be(HttpStatusCode.OK);
        (await GetAsync(client, $"/api/v1/quoting/quotations/{id}")).GetProperty("status").GetString().Should().Be("Sent");
        using var edit = await ApiTestJson.SendJsonAsync(client, HttpMethod.Put, $"/api/v1/quoting/quotations/{id}", new { issueDate = DateTime.UtcNow, items = new[] { Item() } });
        edit.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task ConcurrentQuotationCreates_AllocateDifferentPersistedNumbers()
    {
        using var client = await AdminAsync();
        var ids = await Task.WhenAll(Enumerable.Range(0, 8).Select(_ => CreateQuotationAsync(client)));
        var details = await Task.WhenAll(ids.Select(id => GetAsync(client, $"/api/v1/quoting/quotations/{id}")));
        details.Select(detail => detail.GetProperty("quotationNumber").GetString()).Should().OnlyHaveUniqueItems();
    }

    [Fact]
    public async Task PaginationAndSummary_IncludeRowsBeyondTheFirstPage()
    {
        using var client = await AdminAsync();
        for (var index = 0; index < 22; index++) await CreateQuotationAsync(client);
        var first = await GetAsync(client, "/api/v1/quoting/quotations?page=1&pageSize=20");
        var second = await GetAsync(client, "/api/v1/quoting/quotations?page=2&pageSize=20");
        first.GetProperty("data").GetArrayLength().Should().Be(20);
        second.GetProperty("data").GetArrayLength().Should().BeGreaterThan(0);
        first.GetProperty("data").EnumerateArray().Select(row => row.GetProperty("id").GetGuid()).Should().NotIntersectWith(second.GetProperty("data").EnumerateArray().Select(row => row.GetProperty("id").GetGuid()));
        var summary = await GetAsync(client, "/api/v1/quoting/quotations/summary");
        summary.GetProperty("totalCount").GetInt32().Should().Be(first.GetProperty("total").GetInt32());
        summary.GetProperty("monthlyAmounts").EnumerateObject().Should().HaveCount(6);
    }

    [Fact]
    public async Task ContactRequest_IsValidatedAndPersistedWithTheAuthenticatedUser()
    {
        var user = await fixture.AddUserAsync();
        using var client = fixture.CreateClientFor(user.Id, "User");
        using var invalid = await ApiTestJson.SendJsonAsync(client, HttpMethod.Post, "/api/v1/quoting/support-requests", new { fullName = "", email = "bad", topic = "Hỗ trợ", priority = "invalid", message = "" });
        invalid.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var result = await SendAsync(client, HttpMethod.Post, "/api/v1/quoting/support-requests", new { fullName = "Người liên hệ", email = "contact@example.test", topic = "Báo giá", priority = "normal", message = "Cần hỗ trợ mẫu in", userId = Guid.NewGuid() });
        var requestId = result.GetProperty("id").GetGuid();
        var savedUser = await fixture.WithDatabaseAsync(context => context.QuotingSupportRequests.Where(request => request.Id == requestId).Select(request => request.CreatedByUserId).SingleAsync());
        savedUser.Should().Be(user.Id);
    }

    [Fact]
    public async Task SourceImages_AreServedAsStaticProductAssets()
    {
        using var client = fixture.CreateAnonymousClient();
        using var image = await client.GetAsync("/api/v1/quoting/product-images/CB-01.png");
        image.StatusCode.Should().Be(HttpStatusCode.OK);
        image.Content.Headers.ContentType!.MediaType.Should().Be("image/png");
    }
    #endregion
}
