namespace OnePortal.UnitTests.Domain.Quoting;

using FluentAssertions;
using OnePortal.Domain.Entities.Quoting;
using Xunit;

public class QuotationDomainTests
{
    #region 1. Happy Path Tests

    [Fact]
    public void Quotation_Create_ShouldInitializeWithDraftStatusAndCreatedHistory()
    {
        // Arrange
        var customerId = Guid.NewGuid();
        var templateId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var issueDate = DateTime.UtcNow;
        var validUntil = issueDate.AddDays(15);

        // Act
        var quotation = Quotation.Create(
            "BG-202611-0001",
            customerId,
            "Công ty ABC",
            "Nguyen Van B",
            "0909123456",
            "abc@example.com",
            "123 Nguyen Trai, Q1, HCM",
            "0319888777",
            templateId,
            1,
            issueDate,
            validUntil,
            discountPercent: 5m,
            taxPercent: 8m,
            notes: "Báo giá đợt 1",
            userId);

        // Assert
        quotation.Id.Should().NotBeEmpty();
        quotation.QuotationNumber.Should().Be("BG-202611-0001");
        quotation.Status.Should().Be("Draft");
        quotation.CustomerId.Should().Be(customerId);
        quotation.CustomerName.Should().Be("Công ty ABC");
        quotation.CustomerContactPerson.Should().Be("Nguyen Van B");
        quotation.CustomerPhone.Should().Be("0909123456");
        quotation.CustomerEmail.Should().Be("abc@example.com");
        quotation.CustomerAddress.Should().Be("123 Nguyen Trai, Q1, HCM");
        quotation.CustomerTaxCode.Should().Be("0319888777");
        quotation.TemplateId.Should().Be(templateId);
        quotation.TemplateVersion.Should().Be(1);
        quotation.IssueDate.Should().Be(issueDate);
        quotation.ValidUntil.Should().Be(validUntil);
        quotation.DiscountPercent.Should().Be(5m);
        quotation.TaxPercent.Should().Be(8m);
        quotation.Notes.Should().Be("Báo giá đợt 1");
        quotation.CreatedByUserId.Should().Be(userId);
        quotation.IsDeleted.Should().BeFalse();
        quotation.DeletedAtUtc.Should().BeNull();

        // History check
        quotation.Histories.Should().HaveCount(1);
        var createdHistory = quotation.Histories.First();
        createdHistory.Action.Should().Be("Created");
        createdHistory.CreatedByUserId.Should().Be(userId);
    }

    [Fact]
    public void Quotation_ChangeStatus_ShouldTransitionStatusAndRecordHistory_WhenValid()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var quotation = CreateSampleQuotation();

        // Act - Transition Draft -> Sent
        quotation.ChangeStatus("Sent", userId, "Gửi email cho khách");

        // Assert
        quotation.Status.Should().Be("Sent");
        quotation.Histories.Should().Contain(h => h.Action == "StatusChanged" && h.Description.Contains("Sent"));

        // Act - Transition Sent -> Approved
        quotation.ChangeStatus("Approved", userId, "Khách hàng đồng ý báo giá");

        // Assert
        quotation.Status.Should().Be("Approved");
        quotation.Histories.Should().Contain(h => h.Action == "StatusChanged" && h.Description.Contains("Approved"));
    }

    [Fact]
    public void Quotation_AddExportedFile_ShouldAppendFileAndAuditHistory()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var quotation = CreateSampleQuotation();

        // Act
        quotation.AddExportedFile(
            "BG-202611-0001_20261108.pdf",
            "pdf",
            "https://storage.example.com/quotations/bg1.pdf",
            102400,
            "Supabase",
            userId);

        // Assert
        quotation.Files.Should().HaveCount(1);
        var file = quotation.Files.First();
        file.FileName.Should().Be("BG-202611-0001_20261108.pdf");
        file.FileType.Should().Be("pdf");
        file.FileUrl.Should().Be("https://storage.example.com/quotations/bg1.pdf");
        file.FileSize.Should().Be(102400);
        file.StorageProvider.Should().Be("Supabase");
        file.CreatedByUserId.Should().Be(userId);

        quotation.Histories.Should().Contain(h => h.Action == "FileExported");
    }

    [Fact]
    public void Quotation_Delete_ShouldSetIsDeletedAndTimestamp()
    {
        // Arrange
        var quotation = CreateSampleQuotation();

        // Act
        quotation.Delete();

        // Assert
        quotation.IsDeleted.Should().BeTrue();
        quotation.DeletedAtUtc.Should().NotBeNull();
    }

    #endregion

    #region 2. Edge Case Tests

    [Fact]
    public void Quotation_FinancialCalculations_ShouldHandleRoundingAccurately()
    {
        // Arrange
        var quotation = Quotation.Create(
            "BG-TEST-ROUND",
            Guid.NewGuid(),
            "Khách hàng Lẻ",
            null,
            "0900000000",
            null,
            null,
            null,
            Guid.NewGuid(),
            1,
            DateTime.UtcNow,
            null,
            discountPercent: 7.5m, // 7.5% tổng đơn
            taxPercent: 8m,        // 8% VAT
            notes: null,
            Guid.NewGuid());

        var items = new List<QuotationItem>
        {
            // Item 1: Qty 3.5, UnitPrice 18500, Discount 5%
            // Gross: 3.5 * 18500 = 64,750
            // Discount 5%: 64,750 * 0.05 = 3,237.5 -> rounded 3,237.50
            // Net: 64,750 - 3,237.5 = 61,512.50
            QuotationItem.Create(quotation.Id, null, "SKU1", "Sản phẩm 1", null, "Kg", null, "Nhóm 1", 3.5m, 18500m, 5m, null, 1),

            // Item 2: Qty 10, UnitPrice 23500, Discount 0%
            // Gross = Net = 235,000
            QuotationItem.Create(quotation.Id, null, "SKU2", "Sản phẩm 2", null, "Phần", null, "Nhóm 2", 10m, 23500m, 0m, null, 2)
        };

        // Act
        quotation.SetItems(items, Guid.NewGuid());

        // Assert
        // Item 1
        items[0].DiscountAmount.Should().Be(3237.50m);
        items[0].TotalAmount.Should().Be(61512.50m);

        // SubTotal = 61,512.50 + 235,000 = 296,512.50
        quotation.SubTotal.Should().Be(296512.50m);

        // DiscountAmount = 296,512.50 * 0.075 = 22,238.4375 -> rounded to 22,238.44
        quotation.DiscountAmount.Should().Be(22238.44m);

        // Taxable = 296,512.50 - 22,238.44 = 274,274.06
        // TaxAmount (8%) = 274,274.06 * 0.08 = 21,941.9248 -> rounded to 21,941.92
        quotation.TaxAmount.Should().Be(21941.92m);

        // TotalAmount = 274,274.06 + 21,941.92 = 296,215.98
        quotation.TotalAmount.Should().Be(296215.98m);
    }

    [Fact]
    public void Quotation_UpdateDetails_ShouldThrowInvalidOperationException_WhenStatusIsNotDraft()
    {
        // Arrange
        var quotation = CreateSampleQuotation();
        quotation.ChangeStatus("Sent", Guid.NewGuid(), "Đã gửi khách");

        // Act
        var act = () => quotation.UpdateDetails(
            Guid.NewGuid(),
            "Tên mới",
            null,
            "0900000001",
            null,
            null,
            null,
            DateTime.UtcNow,
            null,
            0,
            0,
            null,
            Guid.NewGuid());

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Draft*");
    }

    [Fact]
    public void Quotation_SetItems_ShouldThrowInvalidOperationException_WhenStatusIsNotDraft()
    {
        // Arrange
        var quotation = CreateSampleQuotation();
        quotation.ChangeStatus("Approved", Guid.NewGuid(), "Đã duyệt");

        var newItems = new List<QuotationItem>
        {
            QuotationItem.Create(quotation.Id, null, "SKU-NEW", "SP Mới", null, "Cái", null, "A", 1, 10000, 0, null, 1)
        };

        // Act
        var act = () => quotation.SetItems(newItems, Guid.NewGuid());

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Draft*");
    }

    #endregion

    #region 3. Failure Path Tests

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Quotation_Create_ShouldThrowArgumentException_WhenQuotationNumberIsEmpty(string? number)
    {
        // Act
        var act = () => Quotation.Create(
            number!,
            Guid.NewGuid(),
            "Khách hàng",
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

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("quotationNumber");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Quotation_Create_ShouldThrowArgumentException_WhenCustomerNameIsEmpty(string? customerName)
    {
        // Act
        var act = () => Quotation.Create(
            "BG-202611-0001",
            Guid.NewGuid(),
            customerName!,
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

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("customerName");
    }

    [Theory]
    [InlineData(-0.01)]
    [InlineData(100.01)]
    [InlineData(-50)]
    [InlineData(150)]
    public void Quotation_Create_ShouldThrowArgumentException_WhenDiscountPercentOutOfRange(decimal discount)
    {
        // Act
        var act = () => Quotation.Create(
            "BG-202611-0001",
            Guid.NewGuid(),
            "Khách hàng",
            null,
            "0901234567",
            null,
            null,
            null,
            Guid.NewGuid(),
            1,
            DateTime.UtcNow,
            null,
            discount,
            10,
            null,
            Guid.NewGuid());

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("discountPercent");
    }

    [Theory]
    [InlineData(-0.01)]
    [InlineData(100.01)]
    [InlineData(-10)]
    [InlineData(105)]
    public void Quotation_Create_ShouldThrowArgumentException_WhenTaxPercentOutOfRange(decimal tax)
    {
        // Act
        var act = () => Quotation.Create(
            "BG-202611-0001",
            Guid.NewGuid(),
            "Khách hàng",
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
            tax,
            null,
            Guid.NewGuid());

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("taxPercent");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("InvalidStatus")]
    [InlineData("PendingReview")]
    [InlineData("Deleted")]
    public void Quotation_ChangeStatus_ShouldThrowArgumentException_WhenStatusIsInvalid(string invalidStatus)
    {
        // Arrange
        var quotation = CreateSampleQuotation();

        // Act
        var act = () => quotation.ChangeStatus(invalidStatus, Guid.NewGuid(), null);

        // Assert
        act.Should().Throw<ArgumentException>();
    }

    #endregion

    private static Quotation CreateSampleQuotation()
    {
        return Quotation.Create(
            "BG-202611-SAMPLE",
            Guid.NewGuid(),
            "Cty TNHH Thử Nghiệm",
            "Trần Thị C",
            "0912345678",
            "sample@corp.com",
            "456 Le Loi, Q1, TP.HCM",
            "0319888888",
            Guid.NewGuid(),
            1,
            DateTime.UtcNow,
            DateTime.UtcNow.AddDays(30),
            discountPercent: 0,
            taxPercent: 10,
            notes: "Ghi chú mẫu",
            Guid.NewGuid());
    }
}
