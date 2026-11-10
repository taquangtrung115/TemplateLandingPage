namespace TemplateLandingPage.IntegrationTests;

using System.Net;
using System.Text.Json;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using TemplateLandingPage.Domain.Entities.Quoting;
using TemplateLandingPage.Persistence.Data;
using Xunit;

[Collection(PostgresApiCollection.Name)]
public sealed class QuotingGroupsAndDisplayIntegrationTests(PostgresApiFixture fixture)
{
    #region Helpers
    private async Task<HttpClient> AdminAsync()
    {
        await fixture.WithDatabaseAsync(async db => { await QuotingSeeder.SeedAsync(db); return true; });
        var user = await fixture.AddUserAsync("Admin");
        return fixture.CreateClientFor(user.Id, "Admin");
    }

    private static async Task<JsonElement> SendAsync(HttpClient client, HttpMethod method, string url, object data)
    {
        using var response = await ApiTestJson.SendJsonAsync(client, method, url, data);
        response.IsSuccessStatusCode.Should().BeTrue(await response.Content.ReadAsStringAsync());
        using var json = await ApiTestJson.ReadAsync(response);
        return (json.RootElement.TryGetProperty("value", out var value) ? value : json.RootElement).Clone();
    }

    private static async Task<JsonElement> GetAsync(HttpClient client, string url)
    {
        using var response = await client.GetAsync(url);
        response.IsSuccessStatusCode.Should().BeTrue(await response.Content.ReadAsStringAsync());
        using var json = await ApiTestJson.ReadAsync(response);
        return (json.RootElement.TryGetProperty("value", out var value) ? value : json.RootElement).Clone();
    }
    #endregion

    [Fact]
    public async Task Groups_AreOrdered_AdminManaged_AndCannotBeDeletedWhileUsed()
    {
        using var client = await AdminAsync();
        var group = await SendAsync(client, HttpMethod.Post, "/api/v1/quoting/product-groups",
            new { code = $"GROUP-{Guid.NewGuid():N}", name = "Dòng mới", description = "Nhóm quản lý", sortOrder = 0, isActive = true });
        var id = group.GetProperty("id").GetGuid();
        var groups = (await GetAsync(client, "/api/v1/quoting/product-groups")).GetProperty("groups").EnumerateArray().ToList();
        groups.First().GetProperty("id").GetGuid().Should().Be(id);
        var code = $"PRODUCT-{Guid.NewGuid():N}";
        var productId = (await SendAsync(client, HttpMethod.Post, "/api/v1/quoting/products",
            new { code, name = "Sản phẩm nhóm mới", unit = "Gói", price = 15000, groupId = id })).GetGuid();
        var product = await GetAsync(client, $"/api/v1/quoting/products/{productId}");
        product.GetProperty("category").GetString().Should().Be("Dòng mới");
        product.GetProperty("groupSortOrder").GetInt32().Should().Be(0);
        using var blocked = await client.DeleteAsync($"/api/v1/quoting/product-groups/{id}");
        blocked.StatusCode.Should().Be(HttpStatusCode.Conflict);
        await SendAsync(client, HttpMethod.Put, $"/api/v1/quoting/product-groups/{id}",
            new { code = $"RENAMED-{Guid.NewGuid():N}", name = "Dòng đổi tên", sortOrder = 7, isActive = false });
        var inactiveProduct = await GetAsync(client, $"/api/v1/quoting/products/{productId}");
        inactiveProduct.GetProperty("category").GetString().Should().Be("Dòng đổi tên");
        var activeProducts = await GetAsync(client, "/api/v1/quoting/products");
        activeProducts.EnumerateArray().Should().NotContain(item => item.GetProperty("id").GetGuid() == productId);
        using var invalid = await ApiTestJson.SendJsonAsync(client, HttpMethod.Post, "/api/v1/quoting/products",
            new { code = $"INVALID-{Guid.NewGuid():N}", name = "Không nhận nhóm ngưng dùng", unit = "Gói", price = 1, groupId = id });
        invalid.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        await client.DeleteAsync($"/api/v1/quoting/products/{productId}");
        using var removed = await client.DeleteAsync($"/api/v1/quoting/product-groups/{id}");
        removed.StatusCode.Should().Be(HttpStatusCode.OK);
        var user = await fixture.AddUserAsync("User");
        using var staff = fixture.CreateClientFor(user.Id, "User");
        using var forbidden = await ApiTestJson.SendJsonAsync(staff, HttpMethod.Post, "/api/v1/quoting/product-groups",
            new { code = "FORBIDDEN", name = "Nhóm trái quyền", sortOrder = 0 });
        forbidden.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Theory]
    [InlineData(false, false, false, false)]
    [InlineData(true, false, false, false)]
    [InlineData(false, true, false, false)]
    [InlineData(false, false, true, false)]
    [InlineData(false, false, false, true)]
    [InlineData(true, true, true, true)]
    public async Task DisplayFlags_RoundTrip_AndDraftPreviewUsesTheSavedExportRendererWithoutWrites(
        bool showDiscount, bool showQuantity, bool showSubTotal, bool showGrandTotal)
    {
        using var client = await AdminAsync();
        var templateId = (await GetAsync(client, "/api/v1/quoting/templates")).EnumerateArray()
            .First(template => template.GetProperty("isSystem").GetBoolean()).GetProperty("id").GetGuid();
        var customerId = (await SendAsync(client, HttpMethod.Post, "/api/v1/quoting/customers",
            new { name = "Khách kiểm tra preview", phone = "0901234567" })).GetGuid();
        var data = new
        {
            templateId, templateVersion = 1, customerId,
            issueDate = new DateTime(2026, 11, 10, 0, 0, 0, DateTimeKind.Utc),
            showDiscount, showQuantity, showSubTotal, showGrandTotal,
            items = new[] {
                new { productCode = "XQ-01", productName = "Xiên que kiểm tra", unit = "Gói", quantity = 1, unitPrice = 25000, itemGroup = "B/ DÒNG SẢN PHẨM XIÊN QUE", groupSortOrder = 2 },
                new { productCode = "CB-01", productName = "Combo kiểm tra", unit = "Gói", quantity = 1, unitPrice = 18000, itemGroup = "A/ DÒNG COMBO", groupSortOrder = 1 },
            }
        };
        var before = await fixture.WithDatabaseAsync(db => db.Quotations.CountAsync());
        var transient = await SendAsync(client, HttpMethod.Post, "/api/v1/quoting/quotations/preview-draft", data);
        (await fixture.WithDatabaseAsync(db => db.Quotations.CountAsync())).Should().Be(before);
        var draftHtml = transient.GetProperty("htmlContent").GetString()!;
        var id = (await SendAsync(client, HttpMethod.Post, "/api/v1/quoting/quotations", data)).GetGuid();
        var detail = await GetAsync(client, $"/api/v1/quoting/quotations/{id}");
        detail.GetProperty("showDiscount").GetBoolean().Should().Be(showDiscount);
        detail.GetProperty("showQuantity").GetBoolean().Should().Be(showQuantity);
        detail.GetProperty("showSubTotal").GetBoolean().Should().Be(showSubTotal);
        detail.GetProperty("showGrandTotal").GetBoolean().Should().Be(showGrandTotal);
        var savedHtml = (await GetAsync(client, $"/api/v1/quoting/quotations/{id}/preview")).GetProperty("htmlContent").GetString()!;
        foreach (var html in new[] { draftHtml, savedHtml })
        {
            html.Contains("<th>Số lượng</th>").Should().Be(showQuantity);
            html.Contains("<th>CK (%)</th>").Should().Be(showDiscount);
            html.Contains("Tạm tính hàng hóa:").Should().Be(showSubTotal);
            html.Contains("TỔNG CỘNG:").Should().Be(showGrandTotal);
            html.IndexOf("A/ DÒNG COMBO", StringComparison.Ordinal).Should().BeLessThan(html.IndexOf("B/ DÒNG SẢN PHẨM XIÊN QUE", StringComparison.Ordinal));
            html.Should().Contain("TP.HCM, ngày 10 tháng 11 năm 2026").And.Contain("(Ký và đóng dấu)");
        }
        // Legacy clients omit display flags when editing; preserve each saved choice.
        await SendAsync(client, HttpMethod.Put, $"/api/v1/quoting/quotations/{id}", new {
            customerId, issueDate = data.issueDate, items = data.items, discountPercent = 0, taxPercent = 0
        });
        var updated = await GetAsync(client, $"/api/v1/quoting/quotations/{id}");
        foreach (var flag in new[] { "showDiscount", "showQuantity", "showSubTotal", "showGrandTotal" })
            updated.GetProperty(flag).GetBoolean().Should().Be(detail.GetProperty(flag).GetBoolean());

        var export = await SendAsync(client, HttpMethod.Post, $"/api/v1/quoting/quotations/{id}/export", new { fileType = "pdf" });
        using var pdf = await client.GetAsync($"/api/v1/quoting/quotations/{id}/files/{export.GetProperty("id").GetGuid()}/download");
        pdf.StatusCode.Should().Be(HttpStatusCode.OK);
        var bytes = await pdf.Content.ReadAsByteArrayAsync();
        System.Text.Encoding.ASCII.GetString(bytes, 0, 4).Should().Be("%PDF");
    }

    [Fact]
    public async Task NewQuotationDefaults_AreOff_AndInvalidDraftPreviewIsRejected()
    {
        using var client = await AdminAsync();
        using var invalid = await ApiTestJson.SendJsonAsync(client, HttpMethod.Post, "/api/v1/quoting/quotations/preview-draft",
            new { items = Array.Empty<object>() });
        invalid.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var id = (await SendAsync(client, HttpMethod.Post, "/api/v1/quoting/quotations", new {
            items = new[] { new { productName = "Bảng đơn giá", unit = "Gói", unitPrice = 15000, quantity = 1 } }
        })).GetGuid();
        var detail = await GetAsync(client, $"/api/v1/quoting/quotations/{id}");
        foreach (var flag in new[] { "showDiscount", "showQuantity", "showSubTotal", "showGrandTotal" }) detail.GetProperty(flag).GetBoolean().Should().BeFalse();
    }
}
