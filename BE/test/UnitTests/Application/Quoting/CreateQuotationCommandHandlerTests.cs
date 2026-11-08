namespace TemplateLandingPage.UnitTests.Application.Quoting;

using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using TemplateLandingPage.Application.UseCases.V1.Quoting.Quotations.Commands;
using TemplateLandingPage.Contract.Services.V1.Quoting.Customers;
using TemplateLandingPage.Contract.Services.V1.Quoting.Quotations;
using TemplateLandingPage.Contract.Services.V1.Quoting.Templates;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities.Quoting;
using TemplateLandingPage.Domain.Repositories.Quoting;
using Xunit;

public class CreateQuotationCommandHandlerTests
{
    private readonly Mock<IQuotationRepository> _quotationRepoMock = new();
    private readonly Mock<IQuotingCustomerRepository> _customerRepoMock = new();
    private readonly Mock<IQuotationTemplateRepository> _templateRepoMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();

    #region 1. Happy Paths (Đường chạy thuận lợi)

    [Fact]
    public async Task Handle_ValidCommand_WithCustomer_ShouldCreateQuotationAndReturnId()
    {
        // Arrange
        var customerId = Guid.NewGuid();
        var templateId = Guid.NewGuid();

        var customer = QuotingCustomer.Create(
            "Cty TNHH ABC",
            "Nguyen Van A",
            "0901234567",
            "a@abc.com",
            "TP.HCM",
            "0319888888",
            null);

        var template = QuotationTemplate.Create("TPL-01", "Template Standard", null, false);
        template.AddNewVersion("BẢNG BÁO GIÁ", "{}", "Kính gửi", "{}", "{}", "{}", null, null);

        _customerRepoMock.Setup(r => r.GetByIdAsync(customerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(customer);

        _templateRepoMock.Setup(r => r.GetByIdWithVersionsAsync(templateId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(template);

        _quotationRepoMock.Setup(r => r.GenerateNextQuotationNumberAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync("BG-202611-0001");

        var handler = new CreateQuotationCommandHandler(
            _quotationRepoMock.Object,
            _customerRepoMock.Object,
            _templateRepoMock.Object,
            _unitOfWorkMock.Object,
            NullLogger<CreateQuotationCommandHandler>.Instance);

        var command = new CreateQuotationCommand(
            customerId,
            templateId,
            1,
            DateTime.UtcNow,
            DateTime.UtcNow.AddDays(30),
            0,
            10,
            "Ghi chu don hang",
            new List<QuotationItemDto>
            {
                new(null, "CB-01", "Combo ngon", null, "Phần", null, "Combo", 5, 18000, 0, null, 1)
            },
            Guid.NewGuid());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();

        _quotationRepoMock.Verify(r => r.Add(It.Is<Quotation>(q =>
            q.QuotationNumber == "BG-202611-0001" &&
            q.CustomerName == "Cty TNHH ABC" &&
            q.CustomerId == customer.Id &&
            q.Items.Count == 1)), Times.Once);

        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenCustomerIdIsNull_ShouldCreateGenericQuotationWithDefaultCustomerName()
    {
        // Arrange (Bỏ qua khách hàng: CustomerId = null)
        var templateId = Guid.NewGuid();

        var template = QuotationTemplate.Create("TPL-01", "Template Chuoi An Vat", null, true);
        template.AddNewVersion("BẢNG BÁO GIÁ CHUỖI ĂN VẶT", "{}", "Kính gửi Quý khách hàng", "{}", "{}", "{}", null, null);

        _templateRepoMock.Setup(r => r.GetByIdWithVersionsAsync(templateId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(template);

        _quotationRepoMock.Setup(r => r.GenerateNextQuotationNumberAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync("BG-202611-0002");

        var handler = new CreateQuotationCommandHandler(
            _quotationRepoMock.Object,
            _customerRepoMock.Object,
            _templateRepoMock.Object,
            _unitOfWorkMock.Object,
            NullLogger<CreateQuotationCommandHandler>.Instance);

        var command = new CreateQuotationCommand(
            CustomerId: null,
            TemplateId: templateId,
            TemplateVersion: 1,
            IssueDate: DateTime.UtcNow,
            ValidUntil: DateTime.UtcNow.AddDays(30),
            DiscountPercent: 5,
            TaxPercent: 10,
            Notes: "Báo giá thương mại cho khách vãng lai",
            Items: new List<QuotationItemDto>
            {
                new(null, "CB-01", "COMBO NGUYÊN BẢN BAO NGON", "Surimi, Khoai tây chiên", "GÓI", null, "A/ DÒNG COMBO", 2, 18000, 0, null, 1),
                new(null, "XQ-01", "XIÊN QUE SURIMI HẢI SẢN", "10 que xiên giòn", "10 QUE/GÓI", null, "B/ DÒNG SẢN PHẨM XIÊN QUE", 3, 25000, 0, null, 2)
            },
            UserId: Guid.NewGuid());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();

        // Không bao giờ được gọi repo khách hàng khi CustomerId = null
        _customerRepoMock.Verify(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);

        _quotationRepoMock.Verify(r => r.Add(It.Is<Quotation>(q =>
            q.QuotationNumber == "BG-202611-0002" &&
            q.CustomerId == null &&
            q.CustomerName == "QUÝ KHÁCH HÀNG" &&
            q.Items.Count == 2)), Times.Once);

        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenTemplateIdIsNull_ShouldFallbackToDefaultSystemTemplate()
    {
        // Arrange
        var template = QuotationTemplate.Create("TPL-CHUOI-AN-VAT-V1", "Template Hệ Thống Mặc Định", null, true);
        template.AddNewVersion("BẢNG BÁO GIÁ", "{}", "Kính gửi", "{}", "{}", "{}", null, null);

        _templateRepoMock.Setup(r => r.GetDefaultSystemTemplateAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(template);

        _quotationRepoMock.Setup(r => r.GenerateNextQuotationNumberAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync("BG-202611-0003");

        var handler = new CreateQuotationCommandHandler(
            _quotationRepoMock.Object,
            _customerRepoMock.Object,
            _templateRepoMock.Object,
            _unitOfWorkMock.Object,
            NullLogger<CreateQuotationCommandHandler>.Instance);

        var command = new CreateQuotationCommand(
            CustomerId: null,
            TemplateId: null,
            TemplateVersion: null,
            IssueDate: DateTime.UtcNow,
            ValidUntil: null,
            DiscountPercent: 0,
            TaxPercent: 8,
            Notes: null,
            Items: new List<QuotationItemDto>
            {
                new(null, "SKU-01", "Surimi Tôm Tươi", null, "GÓI", null, "Surimi", 10, 15000, 0, null, 1)
            },
            UserId: Guid.NewGuid());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();

        _templateRepoMock.Verify(r => r.GetDefaultSystemTemplateAsync(It.IsAny<CancellationToken>()), Times.Once);
        _quotationRepoMock.Verify(r => r.Add(It.Is<Quotation>(q =>
            q.TemplateId == template.Id &&
            q.TemplateVersion == 1)), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenTemplateIdIsEmpty_AndDefaultIsNull_ShouldFallbackToCodeMatch()
    {
        // Arrange
        var template = QuotationTemplate.Create("TPL-CHUOI-AN-VAT-V1", "Template Fallback Code", null, false);
        template.AddNewVersion("BẢNG BÁO GIÁ", "{}", "Kính gửi", "{}", "{}", "{}", null, null);

        _templateRepoMock.Setup(r => r.GetDefaultSystemTemplateAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync((QuotationTemplate?)null);

        _templateRepoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<QuotationTemplate> { template });

        _quotationRepoMock.Setup(r => r.GenerateNextQuotationNumberAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync("BG-202611-0004");

        var handler = new CreateQuotationCommandHandler(
            _quotationRepoMock.Object,
            _customerRepoMock.Object,
            _templateRepoMock.Object,
            _unitOfWorkMock.Object,
            NullLogger<CreateQuotationCommandHandler>.Instance);

        var command = new CreateQuotationCommand(
            CustomerId: null,
            TemplateId: Guid.Empty,
            TemplateVersion: null,
            IssueDate: DateTime.UtcNow,
            ValidUntil: null,
            DiscountPercent: 0,
            TaxPercent: 8,
            Notes: null,
            Items: new List<QuotationItemDto>
            {
                new(null, "SKU-02", "Xiên bò", null, "QUE", null, "Xiên que", 5, 20000, 0, null, 1)
            },
            UserId: Guid.NewGuid());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        _templateRepoMock.Verify(r => r.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region 2. Negative / Failure Cases (Trường hợp thất bại & Kiểm soát lỗi)

    [Fact]
    public async Task Handle_WhenCustomerIdDoesNotExist_ShouldReturnNotFoundError()
    {
        // Arrange
        var nonExistentCustomerId = Guid.NewGuid();
        var templateId = Guid.NewGuid();

        _customerRepoMock.Setup(r => r.GetByIdAsync(nonExistentCustomerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((QuotingCustomer?)null);

        var handler = new CreateQuotationCommandHandler(
            _quotationRepoMock.Object,
            _customerRepoMock.Object,
            _templateRepoMock.Object,
            _unitOfWorkMock.Object,
            NullLogger<CreateQuotationCommandHandler>.Instance);

        var command = new CreateQuotationCommand(
            nonExistentCustomerId,
            templateId,
            1,
            DateTime.UtcNow,
            null,
            0,
            10,
            null,
            new List<QuotationItemDto> { new(null, "CB-01", "Combo", null, "GÓI", null, "Combo", 1, 18000, 0, null, 1) },
            Guid.NewGuid());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(QuotingCustomerErrors.NotFound);

        _quotationRepoMock.Verify(r => r.Add(It.IsAny<Quotation>()), Times.Never);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenTemplateDoesNotExist_ShouldReturnNotFoundError()
    {
        // Arrange
        var customerId = Guid.NewGuid();
        var nonExistentTemplateId = Guid.NewGuid();

        var customer = QuotingCustomer.Create("Khách Hàng Tồn Tại", null, "0900000000", null, null, null, null);
        _customerRepoMock.Setup(r => r.GetByIdAsync(customerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(customer);

        _templateRepoMock.Setup(r => r.GetByIdWithVersionsAsync(nonExistentTemplateId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((QuotationTemplate?)null);

        var handler = new CreateQuotationCommandHandler(
            _quotationRepoMock.Object,
            _customerRepoMock.Object,
            _templateRepoMock.Object,
            _unitOfWorkMock.Object,
            NullLogger<CreateQuotationCommandHandler>.Instance);

        var command = new CreateQuotationCommand(
            customerId,
            nonExistentTemplateId,
            1,
            DateTime.UtcNow,
            null,
            0,
            10,
            null,
            new List<QuotationItemDto> { new(null, "CB-01", "Combo", null, "GÓI", null, "Combo", 1, 18000, 0, null, 1) },
            Guid.NewGuid());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(QuotationTemplateErrors.NotFound);

        _quotationRepoMock.Verify(r => r.Add(It.IsAny<Quotation>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenTemplateIdIsNull_AndNoSystemTemplateExists_ShouldReturnNotFound()
    {
        // Arrange
        _templateRepoMock.Setup(r => r.GetDefaultSystemTemplateAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync((QuotationTemplate?)null);
        _templateRepoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<QuotationTemplate>());

        var handler = new CreateQuotationCommandHandler(
            _quotationRepoMock.Object,
            _customerRepoMock.Object,
            _templateRepoMock.Object,
            _unitOfWorkMock.Object,
            NullLogger<CreateQuotationCommandHandler>.Instance);

        var command = new CreateQuotationCommand(
            CustomerId: null,
            TemplateId: null,
            TemplateVersion: null,
            IssueDate: DateTime.UtcNow,
            ValidUntil: null,
            DiscountPercent: 0,
            TaxPercent: 0,
            Notes: null,
            Items: new List<QuotationItemDto> { new(null, "SKU", "Item", null, "GÓI", null, null, 1, 10000, 0, null, 1) },
            UserId: Guid.NewGuid());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(QuotationTemplateErrors.NotFound);
        _quotationRepoMock.Verify(r => r.Add(It.IsAny<Quotation>()), Times.Never);
    }

    #endregion
}
