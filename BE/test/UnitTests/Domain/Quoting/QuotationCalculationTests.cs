namespace OnePortal.UnitTests.Domain.Quoting;

using FluentAssertions;
using OnePortal.Domain.Entities.Quoting;
using Xunit;

public class QuotationCalculationTests
{
    [Fact]
    public void QuotationItem_CalculateTotal_ShouldApplyDiscountCorrectly()
    {
        // Arrange
        var quotationId = Guid.NewGuid();
        var item = QuotationItem.Create(
            quotationId,
            Guid.NewGuid(),
            "CB-01",
            "Combo nguyên bản",
            null,
            "Phần",
            null,
            "A/ DÒNG COMBO",
            quantity: 10,
            unitPrice: 18000,
            discountPercent: 10,
            notes: null,
            sortOrder: 1);

        // Assert
        // Gross: 10 * 18000 = 180,000
        // Discount 10%: 18,000
        // Total: 162,000
        item.DiscountAmount.Should().Be(18000m);
        item.TotalAmount.Should().Be(162000m);
    }

    [Fact]
    public void Quotation_RecalculateTotals_ShouldCalculateSubTotalDiscountAndVatCorrectly()
    {
        // Arrange
        var quotation = Quotation.Create(
            "BG-202611-0001",
            Guid.NewGuid(),
            "Khách hàng Test",
            "Anh A",
            "0901234567",
            "test@customer.com",
            "Hồ Chí Minh",
            "0319999999",
            Guid.NewGuid(),
            1,
            DateTime.UtcNow,
            DateTime.UtcNow.AddDays(30),
            discountPercent: 5, // 5% discount on total
            taxPercent: 10,     // 10% VAT
            notes: "Ghi chú test",
            Guid.NewGuid());

        var items = new List<QuotationItem>
        {
            QuotationItem.Create(quotation.Id, null, "CB-01", "Combo nguyên bản", null, "Phần", null, "A/ DÒNG COMBO", 10, 18000, 0, null, 1), // 180,000
            QuotationItem.Create(quotation.Id, null, "XQ-01", "Xiên que surimi", null, "Xiên", null, "B/ DÒNG XIÊN QUE", 2, 25000, 0, null, 2)  // 50,000
        };

        // Act
        quotation.SetItems(items, Guid.NewGuid());

        // Assert
        // SubTotal = 180,000 + 50,000 = 230,000
        // Discount 5% = 11,500
        // Taxable = 230,000 - 11,500 = 218,500
        // VAT 10% = 21,850
        // TotalAmount = 218,500 + 21,850 = 240,350
        quotation.SubTotal.Should().Be(230000m);
        quotation.DiscountPercent.Should().Be(5m);
        quotation.DiscountAmount.Should().Be(11500m);
        quotation.TaxPercent.Should().Be(10m);
        quotation.TaxAmount.Should().Be(21850m);
        quotation.TotalAmount.Should().Be(240350m);
    }

    [Fact]
    public void Quotation_UpdateDetails_ShouldThrowException_WhenStatusIsNotDraft()
    {
        // Arrange
        var quotation = Quotation.Create(
            "BG-202611-0002",
            Guid.NewGuid(),
            "Khách hàng Test",
            null,
            "0901234567",
            null,
            null,
            null,
            Guid.NewGuid(),
            1,
            DateTime.UtcNow,
            null,
            0,
            10,
            null,
            Guid.NewGuid());

        quotation.ChangeStatus("Approved", Guid.NewGuid(), "Đã duyệt");

        // Act & Assert
        var act = () => quotation.UpdateDetails(
            Guid.NewGuid(),
            "Tên mới",
            null,
            "0909999999",
            null,
            null,
            null,
            DateTime.UtcNow,
            null,
            0,
            10,
            null,
            Guid.NewGuid());

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Draft*");
    }

    [Fact]
    public void QuotationTemplate_AddNewVersion_ShouldIncrementVersionCorrectly()
    {
        // Arrange
        var template = QuotationTemplate.Create("TPL-TEST", "Mẫu Test", "Mô tả", false);
        var v1 = template.AddNewVersion("BÁO GIÁ", "{}", "Lời mở đầu", "{}", "{}", "{}", null, null);

        // Act
        var v2 = template.AddNewVersion("BÁO GIÁ V2", "{}", "Lời mở đầu 2", "{}", "{}", "{}", null, null);

        // Assert
        v1.Version.Should().Be(1);
        v2.Version.Should().Be(2);
        template.CurrentVersion.Should().Be(2);
        template.Versions.Should().HaveCount(2);
    }
}
