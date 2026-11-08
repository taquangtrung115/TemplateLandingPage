namespace TemplateLandingPage.UnitTests.Domain.Quoting;

using FluentAssertions;
using TemplateLandingPage.Domain.Entities.Quoting;
using Xunit;

public class QuotingEntitiesDomainTests
{
    #region 1. Happy Path Tests

    [Fact]
    public void QuotingProduct_Create_ShouldInitializePropertiesCorrectly()
    {
        // Act
        var product = QuotingProduct.Create(
            "cb-01",
            "Combo nguyên bản bao ngon",
            "6 viên surimi + khoai tây",
            "Phần",
            18000m,
            "https://img.example.com/cb01.jpg",
            "A/ DÒNG COMBO");

        // Assert
        product.Id.Should().NotBeEmpty();
        product.Code.Should().Be("CB-01"); // Auto uppercase
        product.Name.Should().Be("Combo nguyên bản bao ngon");
        product.Description.Should().Be("6 viên surimi + khoai tây");
        product.Unit.Should().Be("Phần");
        product.Price.Should().Be(18000m);
        product.ImageUrl.Should().Be("https://img.example.com/cb01.jpg");
        product.Category.Should().Be("A/ DÒNG COMBO");
        product.IsActive.Should().BeTrue();
        product.IsDeleted.Should().BeFalse();
        product.CreatedAtUtc.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(2));
    }

    [Fact]
    public void QuotingProduct_Update_ShouldModifyFieldsAndSetModifiedAt()
    {
        // Arrange
        var product = QuotingProduct.Create("XQ-01", "Xiên que surimi hải sản", null, "Xiên", 25000m, null, "B/ DÒNG XIÊN QUE");

        // Act
        product.Update("xq-01-edit", "Xiên que Surimi đặc biệt", "Nâng cấp topping", "Cây", 28000m, "https://img.com/edit.jpg", "B/ DÒNG XIÊN QUE", false);

        // Assert
        product.Code.Should().Be("XQ-01-EDIT");
        product.Name.Should().Be("Xiên que Surimi đặc biệt");
        product.Description.Should().Be("Nâng cấp topping");
        product.Unit.Should().Be("Cây");
        product.Price.Should().Be(28000m);
        product.ImageUrl.Should().Be("https://img.com/edit.jpg");
        product.IsActive.Should().BeFalse();
        product.ModifiedAtUtc.Should().NotBeNull();
    }

    [Fact]
    public void QuotingProduct_Delete_ShouldSetSoftDeleteFlag()
    {
        // Arrange
        var product = QuotingProduct.Create("SKU-DEL", "Sản phẩm xóa", null, "Cái", 1000m, null, null);

        // Act
        product.Delete();

        // Assert
        product.IsDeleted.Should().BeTrue();
        product.DeletedAtUtc.Should().NotBeNull();
    }

    [Fact]
    public void QuotingCustomer_Create_ShouldInitializePropertiesCorrectly()
    {
        // Act
        var customer = QuotingCustomer.Create(
            "Công ty TNHH Marvision",
            "Trần Quốc Trung",
            "0909123456",
            "trung@marvision.com",
            "19 Ngô Văn Năm, Phú Thạnh, TPHCM",
            "0319645690",
            "Khách hàng VIP");

        // Assert
        customer.Id.Should().NotBeEmpty();
        customer.Name.Should().Be("Công ty TNHH Marvision");
        customer.ContactPerson.Should().Be("Trần Quốc Trung");
        customer.Phone.Should().Be("0909123456");
        customer.Email.Should().Be("trung@marvision.com");
        customer.Address.Should().Be("19 Ngô Văn Năm, Phú Thạnh, TPHCM");
        customer.TaxCode.Should().Be("0319645690");
        customer.Notes.Should().Be("Khách hàng VIP");
        customer.IsActive.Should().BeTrue();
        customer.IsDeleted.Should().BeFalse();
    }

    [Fact]
    public void QuotingCustomer_Update_ShouldModifyFieldsAndSetModifiedAt()
    {
        // Arrange
        var customer = QuotingCustomer.Create("Tên Cũ", null, "0900000000", null, null, null, null);

        // Act
        customer.Update("Tên Mới Đổi", "Người đại diện", "0911111111", "email@new.com", "Địa chỉ mới", "MST123", "Ghi chú mới", false);

        // Assert
        customer.Name.Should().Be("Tên Mới Đổi");
        customer.ContactPerson.Should().Be("Người đại diện");
        customer.Phone.Should().Be("0911111111");
        customer.Email.Should().Be("email@new.com");
        customer.Address.Should().Be("Địa chỉ mới");
        customer.TaxCode.Should().Be("MST123");
        customer.Notes.Should().Be("Ghi chú mới");
        customer.IsActive.Should().BeFalse();
        customer.ModifiedAtUtc.Should().NotBeNull();
    }

    [Fact]
    public void QuotingCustomer_Delete_ShouldSetSoftDeleteFlag()
    {
        // Arrange
        var customer = QuotingCustomer.Create("Khách xóa", null, "0900000000", null, null, null, null);

        // Act
        customer.Delete();

        // Assert
        customer.IsDeleted.Should().BeTrue();
        customer.DeletedAtUtc.Should().NotBeNull();
    }

    [Fact]
    public void QuotationTemplate_AddNewVersion_ShouldIncrementAndMaintainAllVersions()
    {
        // Arrange
        var template = QuotationTemplate.Create("TPL-STD", "Mẫu Báo Giá Chuẩn", "Dành cho F&B", isSystem: false);

        // Act
        var v1 = template.AddNewVersion("BẢNG BÁO GIÁ V1", "{}", "Kính gửi V1", "{}", "{}", "{}", null, null);
        var v2 = template.AddNewVersion("BẢNG BÁO GIÁ V2", "{}", "Kính gửi V2", "{}", "{}", "{}", null, null);
        var v3 = template.AddNewVersion("BẢNG BÁO GIÁ V3", "{}", "Kính gửi V3", "{}", "{}", "{}", null, null);

        // Assert
        v1.Version.Should().Be(1);
        v2.Version.Should().Be(2);
        v3.Version.Should().Be(3);
        template.CurrentVersion.Should().Be(3);
        template.Versions.Should().HaveCount(3);
        template.Versions.Select(v => v.Title).Should().ContainInOrder("BẢNG BÁO GIÁ V1", "BẢNG BÁO GIÁ V2", "BẢNG BÁO GIÁ V3");
    }

    [Fact]
    public void Quotation_Create_ShouldSucceed_WhenCustomerIdIsNull_AndDefaultCustomerName()
    {
        // Act
        var quotation = Quotation.Create(
            "BG-202611-001",
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
            validUntil: DateTime.UtcNow.AddDays(30),
            discountPercent: 0,
            taxPercent: 10,
            notes: "Báo giá chung",
            createdByUserId: Guid.NewGuid());

        // Assert
        quotation.CustomerId.Should().BeNull();
        quotation.CustomerName.Should().Be("QUÝ KHÁCH HÀNG");
        quotation.Status.Should().Be("Draft");
    }

    [Fact]
    public void Quotation_UpdateDetails_ShouldSucceed_WhenCustomerIdIsNull()
    {
        // Arrange
        var quotation = Quotation.Create(
            "BG-202611-002",
            customerId: Guid.NewGuid(),
            customerName: "Khách Cũ",
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

        // Act
        quotation.UpdateDetails(
            customerId: null,
            customerName: null,
            customerContactPerson: null,
            customerPhone: null,
            customerEmail: null,
            customerAddress: null,
            customerTaxCode: null,
            issueDate: DateTime.UtcNow,
            validUntil: null,
            discountPercent: 5,
            taxPercent: 10,
            notes: "Cập nhật thành báo giá chung",
            updatedByUserId: Guid.NewGuid());

        // Assert
        quotation.CustomerId.Should().BeNull();
        quotation.CustomerName.Should().Be("QUÝ KHÁCH HÀNG");
        quotation.DiscountPercent.Should().Be(5);
    }

    #endregion

    #region 2. Edge Case Tests

    [Fact]
    public void QuotationTemplate_Delete_ShouldThrowInvalidOperationException_WhenIsSystemIsTrue()
    {
        // Arrange
        var systemTemplate = QuotationTemplate.Create("TPL-SYS", "Mẫu Hệ Thống", "Không thể xóa", isSystem: true);

        // Act
        var act = () => systemTemplate.Delete();

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*System templates cannot be deleted*");
    }

    [Fact]
    public void QuotingProduct_Create_ShouldDefaultUnitToCai_WhenUnitIsNullOrWhitespace()
    {
        // Act
        var product = QuotingProduct.Create("SKU-TEST", "Sản phẩm", null, "", 1000m, null, null);

        // Assert
        product.Unit.Should().Be("Cái");
    }

    #endregion

    #region 3. Failure Path Tests

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void QuotingProduct_Create_ShouldThrowArgumentException_WhenCodeIsEmpty(string? code)
    {
        // Act
        var act = () => QuotingProduct.Create(code!, "Tên SP", null, "Cái", 100m, null, null);

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("code");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void QuotingProduct_Create_ShouldThrowArgumentException_WhenNameIsEmpty(string? name)
    {
        // Act
        var act = () => QuotingProduct.Create("CODE1", name!, null, "Cái", 100m, null, null);

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("name");
    }

    [Fact]
    public void QuotingProduct_Create_ShouldThrowArgumentException_WhenPriceIsNegative()
    {
        // Act
        var act = () => QuotingProduct.Create("CODE1", "Tên SP", null, "Cái", -0.01m, null, null);

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("price");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void QuotingCustomer_Create_ShouldThrowArgumentException_WhenNameIsEmpty(string? name)
    {
        // Act
        var act = () => QuotingCustomer.Create(name!, null, "0901234567", null, null, null, null);

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("name");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void QuotingCustomer_Create_ShouldThrowArgumentException_WhenPhoneIsEmpty(string? phone)
    {
        // Act
        var act = () => QuotingCustomer.Create("Khách A", null, phone!, null, null, null, null);

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("phone");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void QuotationTemplate_Create_ShouldThrowArgumentException_WhenCodeIsEmpty(string? code)
    {
        // Act
        var act = () => QuotationTemplate.Create(code!, "Mẫu A", null, false);

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("code");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public void QuotationTemplate_Create_ShouldThrowArgumentException_WhenNameIsEmpty(string? name)
    {
        // Act
        var act = () => QuotationTemplate.Create("TPL-01", name!, null, false);

        // Assert
        act.Should().Throw<ArgumentException>()
            .WithParameterName("name");
    }

    #endregion
}
