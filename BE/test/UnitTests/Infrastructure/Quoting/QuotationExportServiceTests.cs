namespace TemplateLandingPage.UnitTests.Infrastructure.Quoting;

using System.Text;
using FluentAssertions;
using PdfSharp.Pdf;
using PdfSharp.Pdf.Advanced;
using PdfSharp.Pdf.IO;
using TemplateLandingPage.Domain.Entities.Quoting;
using TemplateLandingPage.Infrastructure.Services.Quoting;
using Xunit;

public class QuotationExportServiceTests
{
    private readonly QuotationHtmlExportService _exportService = new();

    private static QuotationTemplateVersion CreateTestTemplateVersion(string? sellerJson = null)
    {
        var template = QuotationTemplate.Create("TPL-STD", "Mẫu Chuẩn Chuỗi Ăn Vặt", "Mô tả mẫu", true);
        var defaultSeller = sellerJson ?? """
        {
          "companyName": "CHUỖI ĂN VẶT",
          "address": "19 NGÔ VĂN NĂM PHÚ THẠNH TPHCM",
          "taxCode": "0319645690",
          "phone": "0901 234 567",
          "bankAccount": "68681068",
          "bankName": "AB BANK",
          "bankHolder": "CTY TNHH MARVISION"
        }
        """;

        return template.AddNewVersion(
            "BẢNG BÁO GIÁ THƯƠNG MẠI",
            defaultSeller,
            "Lời nói đầu công ty chúng tôi xin cảm ơn Quý khách hàng...",
            "{}",
            "{}",
            "{}",
            null,
            null);
    }

    #region 1. Happy Paths (Đường chạy thuận lợi)

    [Fact]
    public async Task BuildHtmlContent_WhenCustomerIdIsNull_ShouldRenderSalutationQuyKhachHang_AndOmitCustomerBox()
    {
        // Arrange
        var templateVersion = CreateTestTemplateVersion();
        var quotation = Quotation.Create(
            "BG-202611-GENERIC",
            customerId: null,
            customerName: null,
            customerContactPerson: null,
            customerPhone: null,
            customerEmail: null,
            customerAddress: null,
            customerTaxCode: null,
            templateId: Guid.NewGuid(),
            templateVersion: 1,
            issueDate: new DateTime(2026, 11, 8),
            validUntil: new DateTime(2026, 12, 8),
            discountPercent: 0,
            taxPercent: 10,
            notes: "Báo giá áp dụng trên toàn quốc",
            createdByUserId: Guid.NewGuid());

        var items = new List<QuotationItem>
        {
            QuotationItem.Create(quotation.Id, null, "CB-01", "COMBO NGUYÊN BẢN BAO NGON", "Surimi, khoai tây", "GÓI", null, "A/ DÒNG COMBO", 5, 18000, 0, null, 1),
            QuotationItem.Create(quotation.Id, null, "XQ-01", "XIÊN QUE SURIMI HẢI SẢN", "10 que xiên giòn", "10 QUE/GÓI", null, "B/ DÒNG SẢN PHẨM XIÊN QUE", 2, 25000, 0, null, 2)
        };
        quotation.SetItems(items, Guid.NewGuid());

        // Act
        var html = QuotationHtmlExportService.BuildHtmlContent(quotation, templateVersion);
        var htmlBytes = await _exportService.GenerateHtmlAsync(quotation, templateVersion);

        // Assert
        html.Should().NotBeNullOrWhiteSpace();
        htmlBytes.Should().NotBeEmpty();

        // 1. Phải hiển thị lời chào "Kính gửi: QUÝ KHÁCH HÀNG"
        html.Should().Contain("<strong>Kính gửi:</strong> QUÝ KHÁCH HÀNG");

        // 2. Tuyệt đối KHÔNG append khối .customer-box khi không có khách hàng cụ thể
        html.Should().NotContain("<div class=\"customer-box\">");
        html.Should().NotContain("Khách hàng:</strong> —");
        html.Should().NotContain("ĐẠI DIỆN KHÁCH HÀNG").And.NotContain("Ký và ghi rõ họ tên");

        // 3. Hiển thị thông tin thương hiệu Chuỗi Ăn Vặt
        html.Should().Contain("CHUỖI ĂN VẶT");
        html.Should().Contain("19 NGÔ VĂN NĂM PHÚ THẠNH TPHCM");
        html.Should().Contain("0319645690");
    }

    [Fact]
    public void BuildHtmlContent_WhenCustomerIdHasValue_ShouldRenderCustomerBoxWithAllDetails()
    {
        // Arrange
        var templateVersion = CreateTestTemplateVersion();
        var customerId = Guid.NewGuid();
        var quotation = Quotation.Create(
            "BG-202611-CUST",
            customerId: customerId,
            customerName: "CÔNG TY TNHH F&B MINH PHÁT",
            customerContactPerson: "Trần Văn Minh",
            customerPhone: "0908 123 456",
            customerEmail: "minh@minhphat.com",
            customerAddress: "123 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM",
            customerTaxCode: "0319888888",
            templateId: Guid.NewGuid(),
            templateVersion: 1,
            issueDate: new DateTime(2026, 11, 8),
            validUntil: null,
            discountPercent: 5,
            taxPercent: 10,
            notes: null,
            createdByUserId: Guid.NewGuid());

        var items = new List<QuotationItem>
        {
            QuotationItem.Create(quotation.Id, null, "CB-01", "COMBO NGUYÊN BẢN", null, "GÓI", null, "A/ DÒNG COMBO", 10, 18000, 0, null, 1)
        };
        quotation.SetItems(items, Guid.NewGuid());

        // Act
        var html = QuotationHtmlExportService.BuildHtmlContent(quotation, templateVersion);

        // Assert
        html.Should().Contain("<strong>Kính gửi:</strong> CÔNG TY TNHH F&amp;B MINH PHÁT");
        html.Should().Contain("<div class=\"customer-box\">");
        html.Should().Contain("Trần Văn Minh");
        html.Should().Contain("0908 123 456");
        html.Should().Contain("minh@minhphat.com");
        html.Should().Contain("123 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM");
        html.Should().Contain("0319888888");
    }

    [Fact]
    public async Task GeneratePdfAsync_WhenCustomerIdIsNull_ShouldGenerateValidPdfDocument()
    {
        // Arrange
        var templateVersion = CreateTestTemplateVersion();
        var quotation = Quotation.Create(
            "BG-202611-PDF",
            customerId: null,
            customerName: null,
            customerContactPerson: null,
            customerPhone: null,
            customerEmail: null,
            customerAddress: null,
            customerTaxCode: null,
            templateId: Guid.NewGuid(),
            templateVersion: 1,
            issueDate: DateTime.UtcNow,
            validUntil: null,
            discountPercent: 0,
            taxPercent: 10,
            notes: null,
            createdByUserId: Guid.NewGuid());

        var items = new List<QuotationItem>
        {
            QuotationItem.Create(quotation.Id, null, "CB-01", "Combo Surimi", null, "GÓI", null, "A/ DÒNG COMBO", 2, 18000, 0, null, 1)
        };
        quotation.SetItems(items, Guid.NewGuid());

        // Act
        var pdfBytes = await _exportService.GeneratePdfAsync(quotation, templateVersion);

        // Assert
        pdfBytes.Should().NotBeNull();
        pdfBytes.Length.Should().BeGreaterThan(100);

        var pdfHeader = Encoding.ASCII.GetString(pdfBytes.Take(8).ToArray());
        pdfHeader.Should().StartWith("%PDF-1.4");
    }

    #endregion

    #region 2. Edge Cases (Các trường hợp biên)

    [Theory]
    [InlineData(null, 0)]
    [InlineData("", 0)]
    [InlineData("/api/v1/quoting/product-images/CB-01.png", 1)]
    public async Task Pdf_RespectsRemovedImage_EvenWhenTheProductHasABundledPhoto(string? imageUrl, int expectedImages)
    {
        var quotation = Quotation.Create("BG-IMAGE", null, null, null, null, null, null, null,
            Guid.NewGuid(), 1, DateTime.UtcNow, null, 0, 0, null, Guid.NewGuid());
        quotation.SetItems([QuotationItem.Create(quotation.Id, null, "CB-01", "Sản phẩm", null, "Gói", imageUrl, "Combo", 1, 18000, 0, null, 1)], Guid.NewGuid());
        using var pdf = PdfReader.Open(new MemoryStream(await _exportService.GeneratePdfAsync(quotation, CreateTestTemplateVersion())), PdfDocumentOpenMode.Import);
        var resources = pdf.Pages[0].Resources.Elements.GetDictionary("/XObject");
        var count = resources?.Elements.Values.OfType<PdfReference>().Count(reference => reference.Value is PdfDictionary image && image.Elements.GetName("/Subtype") == "/Image") ?? 0;
        count.Should().Be(expectedImages);
    }

    [Fact]
    public void BuildHtmlContent_WithGroupedItems_ShouldRenderBothGroupHeaders()
    {
        // Arrange
        var templateVersion = CreateTestTemplateVersion();
        var quotation = Quotation.Create(
            "BG-202611-GROUP",
            customerId: null,
            customerName: "QUÝ KHÁCH HÀNG",
            customerContactPerson: null,
            customerPhone: null,
            customerEmail: null,
            customerAddress: null,
            customerTaxCode: null,
            templateId: Guid.NewGuid(),
            templateVersion: 1,
            issueDate: DateTime.UtcNow,
            validUntil: null,
            discountPercent: 0,
            taxPercent: 10,
            notes: null,
            createdByUserId: Guid.NewGuid());

        var items = new List<QuotationItem>
        {
            QuotationItem.Create(quotation.Id, null, "CB-01", "Combo", null, "GÓI", null, "A/ DÒNG COMBO", 1, 18000, 0, null, 1),
            QuotationItem.Create(quotation.Id, null, "XQ-01", "Xiên que", null, "10 QUE/GÓI", null, "B/ DÒNG SẢN PHẨM XIÊN QUE", 1, 25000, 0, null, 2)
        };
        quotation.SetItems(items, Guid.NewGuid());

        // Act
        var html = QuotationHtmlExportService.BuildHtmlContent(quotation, templateVersion);

        // Assert
        html.Should().Contain("<tr class=\"group-row\">");
        html.Should().Contain("A/ DÒNG COMBO");
        html.Should().Contain("B/ DÒNG SẢN PHẨM XIÊN QUE");
    }

    #endregion

    #region 3. Negative / Failure Cases (Trường hợp dữ liệu hỏng & Fallback an toàn)

    [Fact]
    public void BuildHtmlContent_WhenSellerInfoJsonIsMalformed_ShouldGracefullyFallbackToDefaults()
    {
        // Arrange: Chuỗi JSON bán hàng bị lỗi cú pháp
        var templateVersion = CreateTestTemplateVersion("MALFORMED_JSON_{{{");
        var quotation = Quotation.Create(
            "BG-202611-ERR",
            customerId: null,
            customerName: null,
            customerContactPerson: null,
            customerPhone: null,
            customerEmail: null,
            customerAddress: null,
            customerTaxCode: null,
            templateId: Guid.NewGuid(),
            templateVersion: 1,
            issueDate: DateTime.UtcNow,
            validUntil: null,
            discountPercent: 0,
            taxPercent: 10,
            notes: null,
            createdByUserId: Guid.NewGuid());

        // Act: Không ném JsonException mà phải fallback an toàn
        var html = QuotationHtmlExportService.BuildHtmlContent(quotation, templateVersion);

        // Assert
        html.Should().NotBeNullOrWhiteSpace();
        html.Should().Contain("CHUỖI ĂN VẶT");
        html.Should().Contain("19 NGÔ VĂN NĂM PHÚ THẠNH TPHCM");
        html.Should().Contain("0319645690");
    }

    #endregion
    [Fact]
    public async Task Pdf_WithManyVietnameseItems_IsMultipageAndCanBeReadByAStandardPdfReader()
    {
        var quote = Quotation.Create("BG-UNICODE", null, null, null, null, null, null, null, Guid.NewGuid(), 1, DateTime.UtcNow, null, 0, 0, "Địa chỉ và ghi chú tiếng Việt", Guid.NewGuid());
        quote.SetItems(Enumerable.Range(1, 40).Select(index => QuotationItem.Create(quote.Id, null, "CB-01", $"Sản phẩm số {index}", "Tôm tươi cuộn rong biển", "Gói", null, "Dòng sản phẩm", 1.25m, 18000.25m, 0, null, index)), Guid.NewGuid());
        var bytes = await _exportService.GeneratePdfAsync(quote, CreateTestTemplateVersion());
        using var stream = new MemoryStream(bytes);
        using var document = PdfSharp.Pdf.IO.PdfReader.Open(stream, PdfSharp.Pdf.IO.PdfDocumentOpenMode.Import);
        document.PageCount.Should().BeGreaterThan(3);
        document.Info.Title.Should().Contain("BG-UNICODE");
        bytes.Length.Should().BeGreaterThan(20000);
        var originalTotal = quote.TotalAmount;
        var snapshot = quote.CreateExportSnapshot(8);
        snapshot.TotalAmount.Should().Be(decimal.Round(originalTotal * 1.08m, 2, MidpointRounding.AwayFromZero));
        quote.TaxPercent.Should().Be(0);
        quote.TotalAmount.Should().Be(originalTotal);
        var html = QuotationHtmlExportService.BuildHtmlContent(quote, CreateTestTemplateVersion());
        html.Should().Contain("Sản phẩm số 40").And.NotContain("Thuế VAT (").And.NotContain("Hiệu lực báo giá:").And.NotContain("30 ngày kể từ ngày lập");
    }
    [Fact]
    public async Task Pdf_NormalizesDecomposedVietnameseToTheSameGlyphsAsComposedText()
    {
        var version = CreateTestTemplateVersion();
        var quote = Quotation.Create("BG-NORMALIZE", null, null, null, null, null, null, null, Guid.NewGuid(), 1, DateTime.UtcNow, null, 0, 0, null, Guid.NewGuid());
        var text = "Ắ Ằ Ẳ Ẵ Ặ Ế Ề Ể Ễ Ệ Ớ Ờ Ở Ỡ Ợ Ứ Ừ Ử Ữ Ự Đặng Nguyễn";
        quote.SetItems(new[] { QuotationItem.Create(quote.Id, null, null, text, text, "Gói", null, null, 1, 18000, 0, null, 1) }, Guid.NewGuid());
        var composed = await _exportService.GeneratePdfAsync(quote, version);
        quote.SetItems(new[] { QuotationItem.Create(quote.Id, null, null, text.Normalize(NormalizationForm.FormD), text.Normalize(NormalizationForm.FormD), "Gói", null, null, 1, 18000, 0, null, 1) }, Guid.NewGuid());
        var decomposed = await _exportService.GeneratePdfAsync(quote, version);
        using var first = PdfSharp.Pdf.IO.PdfReader.Open(new MemoryStream(composed), PdfSharp.Pdf.IO.PdfDocumentOpenMode.Import);
        using var second = PdfSharp.Pdf.IO.PdfReader.Open(new MemoryStream(decomposed), PdfSharp.Pdf.IO.PdfDocumentOpenMode.Import);
        first.Pages[0].Contents.CreateSingleContent().Stream.UnfilteredValue.Should().Equal(second.Pages[0].Contents.CreateSingleContent().Stream.UnfilteredValue);
    }

    [Theory]
    [InlineData("/api/v1/quoting/product-images/CB-01.png")]
    [InlineData("https://api.example.test/api/v1/quoting/product-images/CB-01.png")]
    public void Html_EmbedsSourceImageBytesInsteadOfDependingOnApiOrigin(string imageUrl)
    {
        var quote = Quotation.Create("BG-IMAGE", null, null, null, null, null, null, null, Guid.NewGuid(), 1, DateTime.UtcNow, null, 0, 0, null, Guid.NewGuid());
        quote.SetItems(new[] { QuotationItem.Create(quote.Id, null, "CB-01", "Combo", null, "Gói", imageUrl, null, 1, 18000, 0, null, 1) }, Guid.NewGuid());
        var html = QuotationHtmlExportService.BuildHtmlContent(quote, CreateTestTemplateVersion());
        html.Should().Contain("src=\"data:image/png;base64,").And.NotContain("src=\"/api/").And.NotContain("src=\"https://api.example.test");
    }
}
