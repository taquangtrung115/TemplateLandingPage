namespace OnePortal.UnitTests.Application.Quoting.Validators;

using FluentAssertions;
using OnePortal.Application.UseCases.V1.Quoting.Customers.Commands.Validators;
using OnePortal.Application.UseCases.V1.Quoting.Products.Commands.Validators;
using OnePortal.Application.UseCases.V1.Quoting.Quotations.Commands.Validators;
using OnePortal.Application.UseCases.V1.Quoting.Templates.Commands.Validators;
using OnePortal.Contract.Services.V1.Quoting.Customers;
using OnePortal.Contract.Services.V1.Quoting.Products;
using OnePortal.Contract.Services.V1.Quoting.Quotations;
using OnePortal.Contract.Services.V1.Quoting.Templates;
using Xunit;

public class QuotingValidatorTests
{
    private readonly CreateQuotationCommandValidator _createQuotationValidator = new();
    private readonly UpdateQuotationCommandValidator _updateQuotationValidator = new();
    private readonly CreateQuotingProductCommandValidator _createProductValidator = new();
    private readonly CreateQuotingCustomerCommandValidator _createCustomerValidator = new();
    private readonly CreateQuotationTemplateCommandValidator _createTemplateValidator = new();
    private readonly CreateTemplateVersionCommandValidator _createTemplateVersionValidator = new();

    #region 1. Happy Path Tests

    [Fact]
    public void CreateQuotationCommandValidator_ShouldPass_WhenCommandIsValid()
    {
        // Arrange
        var command = new CreateQuotationCommand(
            Guid.NewGuid(),
            Guid.NewGuid(),
            1,
            DateTime.UtcNow,
            DateTime.UtcNow.AddDays(30),
            5,
            10,
            "Ghi chú hợp lệ",
            new List<QuotationItemDto>
            {
                new(Guid.NewGuid(), "SKU1", "Sản phẩm 1", "Mô tả", "Cái", null, "Nhóm A", 2, 20000, 0, null, 1)
            },
            Guid.NewGuid());

        // Act
        var result = _createQuotationValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void UpdateQuotationCommandValidator_ShouldPass_WhenCommandIsValid()
    {
        // Arrange
        var command = new UpdateQuotationCommand(
            Guid.NewGuid(),
            Guid.NewGuid(),
            DateTime.UtcNow,
            DateTime.UtcNow.AddDays(30),
            0,
            8,
            "Cập nhật",
            new List<QuotationItemDto>
            {
                new(null, "SKU2", "Sản phẩm 2", null, "Phần", null, null, 1, 15000, 5, null, 1)
            },
            Guid.NewGuid());

        // Act
        var result = _updateQuotationValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void CreateQuotingProductCommandValidator_ShouldPass_WhenCommandIsValid()
    {
        // Arrange
        var command = new CreateQuotingProductCommand("SKU-01", "Surimi Tôm Tươi", "Tươi ngon", "Xiên", 30000m, "https://img.com/p.jpg", "Hải Sản");

        // Act
        var result = _createProductValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void CreateQuotingCustomerCommandValidator_ShouldPass_WhenCommandIsValid()
    {
        // Arrange
        var command = new CreateQuotingCustomerCommand("CTY TNHH TEST", "Nguyen Van A", "0901234567", "contact@test.com", "TPHCM", "0319888888", "Khách quen");

        // Act
        var result = _createCustomerValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void CreateQuotationTemplateCommandValidator_ShouldPass_WhenCommandIsValid()
    {
        // Arrange
        var command = new CreateQuotationTemplateCommand(
            "TPL-01",
            "Mẫu Báo Giá Mặc Định",
            "Mô tả mẫu",
            false,
            "BẢNG BÁO GIÁ",
            "{}",
            "Kính gửi Quý khách hàng",
            "{}",
            "{}",
            "{}",
            null);

        // Act
        var result = _createTemplateValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void CreateTemplateVersionCommandValidator_ShouldPass_WhenCommandIsValid()
    {
        // Arrange
        var command = new CreateTemplateVersionCommand(
            Guid.NewGuid(),
            "BẢNG BÁO GIÁ V2",
            "{}",
            "Kính gửi Quý khách hàng",
            "{}",
            "{}",
            "{}",
            null);

        // Act
        var result = _createTemplateVersionValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    #endregion

    #region 2. Edge Case Tests

    [Theory]
    [InlineData(0, 0)]
    [InlineData(100, 100)]
    [InlineData(0, 100)]
    [InlineData(100, 0)]
    public void CreateQuotationCommandValidator_ShouldPass_WhenDiscountAndTaxAreAtBoundaries(decimal discount, decimal tax)
    {
        // Arrange
        var command = new CreateQuotationCommand(
            Guid.NewGuid(),
            Guid.NewGuid(),
            1,
            DateTime.UtcNow,
            null,
            discount,
            tax,
            null,
            new List<QuotationItemDto>
            {
                new(null, "SKU", "Sản phẩm biên", null, "Cái", null, null, 1, 0, 0, null, 1)
            },
            Guid.NewGuid());

        // Act
        var result = _createQuotationValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void CreateQuotingProductCommandValidator_ShouldPass_WhenPriceIsZero()
    {
        // Arrange - Quà tặng / Dịch vụ miễn phí
        var command = new CreateQuotingProductCommand("SKU-FREE", "Dịch vụ tặng kèm", null, "Gói", 0m, null, null);

        // Act
        var result = _createProductValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    #endregion

    #region 3. Failure Path Tests

    [Fact]
    public void CreateQuotationCommandValidator_ShouldPass_WhenCustomerIdIsNull()
    {
        // Arrange - Hỗ trợ báo giá chung không cần chỉ định khách hàng
        var command = new CreateQuotationCommand(
            null,
            Guid.NewGuid(),
            1,
            DateTime.UtcNow,
            DateTime.UtcNow.AddDays(30),
            5,
            10,
            "Báo giá chung cho Quý khách hàng",
            new List<QuotationItemDto>
            {
                new(Guid.NewGuid(), "SKU1", "Sản phẩm 1", "Mô tả", "Cái", null, "Nhóm A", 2, 20000, 0, null, 1)
            },
            Guid.NewGuid());

        // Act
        var result = _createQuotationValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void CreateQuotationCommandValidator_ShouldPass_WhenTemplateIdIsEmptyOrNull()
    {
        // Arrange - Cho phép TemplateId là null hoặc Empty để handler tự fallback về mẫu hệ thống
        var command = new CreateQuotationCommand(
            null,
            null,
            1,
            DateTime.UtcNow,
            null,
            0,
            10,
            null,
            new List<QuotationItemDto>
            {
                new(null, "SKU", "Sản phẩm", null, "Cái", null, null, 1, 1000, 0, null, 1)
            },
            Guid.NewGuid());

        // Act
        var result = _createQuotationValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData(-0.01)]
    [InlineData(100.01)]
    [InlineData(-10)]
    [InlineData(150)]
    public void CreateQuotationCommandValidator_ShouldFail_WhenDiscountPercentIsOutOfRange(decimal discount)
    {
        // Arrange
        var command = new CreateQuotationCommand(
            Guid.NewGuid(),
            Guid.NewGuid(),
            1,
            DateTime.UtcNow,
            null,
            discount,
            10,
            null,
            new List<QuotationItemDto>
            {
                new(null, "SKU", "Sản phẩm", null, "Cái", null, null, 1, 1000, 0, null, 1)
            },
            Guid.NewGuid());

        // Act
        var result = _createQuotationValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateQuotationCommand.DiscountPercent));
    }

    [Theory]
    [InlineData(-0.01)]
    [InlineData(100.01)]
    public void CreateQuotationCommandValidator_ShouldFail_WhenTaxPercentIsOutOfRange(decimal tax)
    {
        // Arrange
        var command = new CreateQuotationCommand(
            Guid.NewGuid(),
            Guid.NewGuid(),
            1,
            DateTime.UtcNow,
            null,
            0,
            tax,
            null,
            new List<QuotationItemDto>
            {
                new(null, "SKU", "Sản phẩm", null, "Cái", null, null, 1, 1000, 0, null, 1)
            },
            Guid.NewGuid());

        // Act
        var result = _createQuotationValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateQuotationCommand.TaxPercent));
    }

    [Fact]
    public void CreateQuotationCommandValidator_ShouldFail_WhenItemsIsEmpty()
    {
        // Arrange
        var command = new CreateQuotationCommand(
            Guid.NewGuid(),
            Guid.NewGuid(),
            1,
            DateTime.UtcNow,
            null,
            0,
            10,
            null,
            new List<QuotationItemDto>(),
            Guid.NewGuid());

        // Act
        var result = _createQuotationValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateQuotationCommand.Items));
    }

    [Fact]
    public void CreateQuotationCommandValidator_ShouldFail_WhenItemFieldsAreInvalid()
    {
        // Arrange
        var command = new CreateQuotationCommand(
            Guid.NewGuid(),
            Guid.NewGuid(),
            1,
            DateTime.UtcNow,
            null,
            0,
            10,
            null,
            new List<QuotationItemDto>
            {
                new(null, "SKU", "", null, "Cái", null, null, 0, -500, 150, null, 1)
            },
            Guid.NewGuid());

        // Act
        var result = _createQuotationValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName.Contains(nameof(QuotationItemDto.ProductName)));
        result.Errors.Should().Contain(e => e.PropertyName.Contains(nameof(QuotationItemDto.Quantity)));
        result.Errors.Should().Contain(e => e.PropertyName.Contains(nameof(QuotationItemDto.UnitPrice)));
        result.Errors.Should().Contain(e => e.PropertyName.Contains(nameof(QuotationItemDto.DiscountPercent)));
    }

    [Theory]
    [InlineData("", "Tên SP", "Cái", 100)]
    [InlineData("SKU", "", "Cái", 100)]
    [InlineData("SKU", "Tên SP", "", 100)]
    [InlineData("SKU", "Tên SP", "Cái", -1)]
    public void CreateQuotingProductCommandValidator_ShouldFail_WhenFieldsAreInvalid(string code, string name, string unit, decimal price)
    {
        // Arrange
        var command = new CreateQuotingProductCommand(code, name, null, unit, price, null, null);

        // Act
        var result = _createProductValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
    }

    [Fact]
    public void CreateQuotingProductCommandValidator_ShouldFail_WhenLengthsExceedMaximum()
    {
        // Arrange
        var longCode = new string('A', 51);
        var longName = new string('B', 251);
        var command = new CreateQuotingProductCommand(longCode, longName, null, "Cái", 100, null, null);

        // Act
        var result = _createProductValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateQuotingProductCommand.Code));
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateQuotingProductCommand.Name));
    }

    [Theory]
    [InlineData("", "0901234567")]
    [InlineData("Khách A", "")]
    public void CreateQuotingCustomerCommandValidator_ShouldFail_WhenNameOrPhoneIsEmpty(string name, string phone)
    {
        // Arrange
        var command = new CreateQuotingCustomerCommand(name, null, phone, null, null, null, null);

        // Act
        var result = _createCustomerValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
    }

    [Fact]
    public void CreateQuotingCustomerCommandValidator_ShouldFail_WhenEmailIsInvalid()
    {
        // Arrange
        var command = new CreateQuotingCustomerCommand("Khách A", null, "0901234567", "invalid-email-format", null, null, null);

        // Act
        var result = _createCustomerValidator.Validate(command);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateQuotingCustomerCommand.Email));
    }

    #endregion
}
