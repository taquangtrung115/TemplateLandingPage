namespace OnePortal.UnitTests.Application.Quoting.Validators;

using FluentAssertions;
using OnePortal.Application.UseCases.V1.Quoting.Quotations.Commands.Validators;
using OnePortal.Contract.Services.V1.Quoting.Quotations;
using Xunit;

public sealed class QuotationPrecisionValidationTests
{
    [Theory]
    [InlineData("1.12345", "100", "0")]
    [InlineData("1", "100.123", "0")]
    [InlineData("1", "100", "8.123")]
    [InlineData("99999999999999", "9999999999999999.99", "0")]
    [InlineData("1", "9999999999999999", "100")]
    public void RejectsPrecisionAndFinancialOverflowBeforePersistence(string quantity, string price, string tax)
    {
        var culture = System.Globalization.CultureInfo.InvariantCulture;
        var command = new CreateQuotationCommand(TaxPercent: decimal.Parse(tax, culture), Items: new() { new(ProductName: "Sản phẩm", Quantity: decimal.Parse(quantity, culture), UnitPrice: decimal.Parse(price, culture)) });
        var action = () => new CreateQuotationCommandValidator().Validate(command);
        action.Should().NotThrow();
        action().IsValid.Should().BeFalse();
    }

    [Fact]
    public void RejectsNullItemAndInvalidDateWithoutThrowing()
    {
        var command = new CreateQuotationCommand(IssueDate: new DateTime(2026, 11, 8), ValidUntil: new DateTime(2026, 11, 7), Items: new() { null! });
        new CreateQuotationCommandValidator().Validate(command).IsValid.Should().BeFalse();
    }

    [Fact]
    public void AcceptsFractionalQuantityAndTwoDecimalMoney()
    {
        var command = new CreateQuotationCommand(TaxPercent: 8.25m, Items: new() { new(ProductName: "Sản phẩm", Quantity: 1.1234m, UnitPrice: 18000.25m) });
        new CreateQuotationCommandValidator().Validate(command).IsValid.Should().BeTrue();
    }
}
