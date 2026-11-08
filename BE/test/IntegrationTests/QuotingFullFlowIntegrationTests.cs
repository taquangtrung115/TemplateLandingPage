namespace TemplateLandingPage.IntegrationTests;

using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using FluentAssertions;
using Xunit;

[Collection(PostgresApiCollection.Name)]
public sealed class QuotingFullFlowIntegrationTests(PostgresApiFixture fixture)
{
    [Fact]
    public async Task FullFlow_CreateCustomer_Product_Quotation_ExportPdf_ChangeStatus_Delete()
    {
        var user = await fixture.AddUserAsync("Admin");
        using var client = fixture.CreateClientFor(user.Id, "Admin");

        // 1. Tạo Khách Hàng
        var customerPayload = new
        {
            name = "Đại Lý Ăn Vặt Hà Nội",
            contactPerson = "Trần Văn Bình",
            phone = "0988776655",
            email = "binh@anvat.vn",
            address = "456 Cầu Giấy, Hà Nội",
            taxCode = "0109988776",
            notes = "Đại lý cấp 1 miền Bắc"
        };
        using var createCustomerRes = await ApiTestJson.SendJsonAsync(client, HttpMethod.Post, "/api/v1/quoting/customers", customerPayload);
        createCustomerRes.StatusCode.Should().Be(HttpStatusCode.Created);
        using var custBody = await ApiTestJson.ReadAsync(createCustomerRes);
        var customerId = ApiTestJson.GuidValue(custBody.RootElement, "value");

        // 2. Tạo Sản Phẩm
        var productCode = $"SKU-TEST-{Guid.NewGuid():N}"[..12].ToUpperInvariant();
        var productPayload = new
        {
            code = productCode,
            name = "Thanh Cua Hoàng Gia Surimi",
            description = "Thanh cua chất lượng cao chuẩn Nhật",
            unit = "GÓI",
            price = 28000m,
            imageUrl = "https://cdn.example.com/thanh-cua.jpg",
            category = "Surimi Chế Biến"
        };
        using var createProductRes = await ApiTestJson.SendJsonAsync(client, HttpMethod.Post, "/api/v1/quoting/products", productPayload);
        createProductRes.StatusCode.Should().Be(HttpStatusCode.Created);
        using var prodBody = await ApiTestJson.ReadAsync(createProductRes);
        var productId = ApiTestJson.GuidValue(prodBody.RootElement, "value");

        // 3. Tạo Mẫu Báo Giá Hệ Thống
        var templateCode = $"TPL-{Guid.NewGuid():N}"[..10].ToUpperInvariant();
        var templatePayload = new
        {
            code = templateCode,
            name = "Mẫu Báo Giá Đại Lý Ăn Vặt",
            description = "Mẫu chuẩn thương mại",
            isSystem = true,
            title = "BẢNG BÁO GIÁ THƯƠNG MẠI",
            sellerInfoJson = "{\"company\":\"CÔNG TY TNHH CHUỖI ĂN VẶT\"}",
            salutationText = "Kính gửi Quý Khách hàng & Đối tác",
            columnsConfigJson = "{}",
            paymentTermsJson = "{}",
            signatureConfigJson = "{}",
            customCss = (string?)null
        };
        using var createTplRes = await ApiTestJson.SendJsonAsync(client, HttpMethod.Post, "/api/v1/quoting/templates", templatePayload);
        createTplRes.StatusCode.Should().Be(HttpStatusCode.Created);
        using var tplBody = await ApiTestJson.ReadAsync(createTplRes);
        var templateId = ApiTestJson.GuidValue(tplBody.RootElement, "value");

        // 4. Tạo Báo Giá (Sử dụng templateId vừa tạo, và kiểm tra fallback khi templateId = null)
        var quotationPayload = new
        {
            customerId,
            templateId,
            templateVersion = 1,
            issueDate = DateTime.UtcNow,
            validUntil = DateTime.UtcNow.AddDays(30),
            discountPercent = 10m,
            taxPercent = 8m,
            notes = "Chiết khấu đặc biệt cho đại lý mới",
            items = new[]
            {
                new
                {
                    productId = (Guid?)productId,
                    productCode,
                    productName = "Thanh Cua Hoàng Gia Surimi",
                    description = "Thanh cua chuẩn Nhật",
                    unit = "GÓI",
                    imageUrl = "https://cdn.example.com/thanh-cua.jpg",
                    itemGroup = "Surimi Chế Biến",
                    quantity = 20m,
                    unitPrice = 28000m,
                    discountPercent = 0m,
                    notes = "Hàng tươi date mới",
                    sortOrder = 1
                }
            }
        };

        using var createQuotationRes = await ApiTestJson.SendJsonAsync(client, HttpMethod.Post, "/api/v1/quoting/quotations", quotationPayload);
        createQuotationRes.StatusCode.Should().Be(HttpStatusCode.Created);
        using var quotBody = await ApiTestJson.ReadAsync(createQuotationRes);
        var quotationId = ApiTestJson.GuidValue(quotBody.RootElement, "value");

        // 5. Xem Chi Tiết Báo Giá
        using var detailRes = await client.GetAsync($"/api/v1/quoting/quotations/{quotationId}");
        detailRes.StatusCode.Should().Be(HttpStatusCode.OK);
        using var detailBody = await ApiTestJson.ReadAsync(detailRes);
        ApiTestJson.StringValue(detailBody.RootElement, "value", "status").Should().Be("Draft");
        ApiTestJson.StringValue(detailBody.RootElement, "value", "customerName").Should().Be("Đại Lý Ăn Vặt Hà Nội");

        // 6. Xem Preview HTML Báo Giá
        using var previewRes = await client.GetAsync($"/api/v1/quoting/quotations/{quotationId}/preview");
        previewRes.StatusCode.Should().Be(HttpStatusCode.OK);

        // 7. Xuất File PDF
        using var exportRes = await ApiTestJson.SendJsonAsync(client, HttpMethod.Post, $"/api/v1/quoting/quotations/{quotationId}/export", new { fileType = "pdf" });
        exportRes.StatusCode.Should().Be(HttpStatusCode.OK);

        // 8. Đổi Trạng Thái Báo Giá (Draft -> Sent -> Approved)
        using var sendRes = await ApiTestJson.SendJsonAsync(client, HttpMethod.Put, $"/api/v1/quoting/quotations/{quotationId}/status", new { status = "Sent", reason = "Đã gửi email đối tác" });
        sendRes.StatusCode.Should().Be(HttpStatusCode.OK);

        using var approveRes = await ApiTestJson.SendJsonAsync(client, HttpMethod.Put, $"/api/v1/quoting/quotations/{quotationId}/status", new { status = "Approved", reason = "Đại lý đồng ý hợp đồng" });
        approveRes.StatusCode.Should().Be(HttpStatusCode.OK);

        // 9. Xóa Báo Giá
        using var deleteRes = await client.DeleteAsync($"/api/v1/quoting/quotations/{quotationId}");
        deleteRes.StatusCode.Should().Be(HttpStatusCode.OK);

        // Sau khi xóa, truy vấn lại báo giá phải trả về 404 NotFound
        using var verifyDeleteRes = await client.GetAsync($"/api/v1/quoting/quotations/{quotationId}");
        verifyDeleteRes.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
