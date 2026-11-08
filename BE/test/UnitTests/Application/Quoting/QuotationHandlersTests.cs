namespace TemplateLandingPage.UnitTests.Application.Quoting;

using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Application.UseCases.V1.Quoting.Quotations.Commands;
using TemplateLandingPage.Contract.Services.V1.Quoting.Customers;
using TemplateLandingPage.Contract.Services.V1.Quoting.Quotations;
using TemplateLandingPage.Contract.Services.V1.Quoting.Templates;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities.Quoting;
using TemplateLandingPage.Domain.Repositories.Quoting;
using Xunit;

public class QuotationHandlersTests
{
    private readonly Mock<IQuotationRepository> _quotationRepoMock = new();
    private readonly Mock<IQuotingCustomerRepository> _customerRepoMock = new();
    private readonly Mock<IQuotationTemplateRepository> _templateRepoMock = new();
    private readonly Mock<IQuotationExportService> _exportServiceMock = new();
    private readonly Mock<IQuotationFileStorageService> _storageServiceMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();

    #region 1. UpdateQuotationCommandHandler Tests

    [Fact]
    public async Task UpdateQuotation_ShouldSucceed_WhenQuotationIsDraft()
    {
        // Arrange
        var quotationId = Guid.NewGuid();
        var customerId = Guid.NewGuid();
        var quotation = CreateSampleQuotation(quotationId);
        var customer = QuotingCustomer.Create("Công ty Mới", "Anh B", "0911222333", "b@moi.com", "Hà Nội", "0109999999", null);

        _quotationRepoMock.Setup(r => r.GetByIdWithDetailsAsync(quotationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(quotation);

        _customerRepoMock.Setup(r => r.GetByIdAsync(customerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(customer);

        var handler = new UpdateQuotationCommandHandler(
            _quotationRepoMock.Object,
            _customerRepoMock.Object,
            _unitOfWorkMock.Object,
            NullLogger<UpdateQuotationCommandHandler>.Instance);

        var command = new UpdateQuotationCommand(
            quotationId,
            customerId,
            DateTime.UtcNow,
            DateTime.UtcNow.AddDays(15),
            10, // 10% discount
            10, // 10% VAT
            "Ghi chú đã cập nhật",
            new List<QuotationItemDto>
            {
                new(null, "CB-01", "Combo ngon", null, "Phần", null, "Combo", 2, 50000, 0, null, 1)
            },
            Guid.NewGuid());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        quotation.CustomerName.Should().Be("Công ty Mới");
        quotation.DiscountPercent.Should().Be(10);
        quotation.TaxPercent.Should().Be(10);
        quotation.Notes.Should().Be("Ghi chú đã cập nhật");
        quotation.Items.Should().HaveCount(1);
        _quotationRepoMock.Verify(r => r.Update(quotation), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateQuotation_ShouldFail_WhenQuotationIsNotDraft()
    {
        // Arrange
        var quotationId = Guid.NewGuid();
        var quotation = CreateSampleQuotation(quotationId);
        quotation.ChangeStatus("Sent", Guid.NewGuid(), "Đã gửi khách");

        _quotationRepoMock.Setup(r => r.GetByIdWithDetailsAsync(quotationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(quotation);

        var handler = new UpdateQuotationCommandHandler(
            _quotationRepoMock.Object,
            _customerRepoMock.Object,
            _unitOfWorkMock.Object,
            NullLogger<UpdateQuotationCommandHandler>.Instance);

        var command = new UpdateQuotationCommand(
            quotationId,
            Guid.NewGuid(),
            DateTime.UtcNow,
            null,
            0,
            10,
            null,
            new List<QuotationItemDto>(),
            Guid.NewGuid());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(QuotationErrors.CannotEditNonDraft);
    }

    [Fact]
    public async Task UpdateQuotation_ShouldReturnNotFound_WhenQuotationDoesNotExist()
    {
        // Arrange
        var quotationId = Guid.NewGuid();
        _quotationRepoMock.Setup(r => r.GetByIdWithDetailsAsync(quotationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Quotation?)null);

        var handler = new UpdateQuotationCommandHandler(
            _quotationRepoMock.Object,
            _customerRepoMock.Object,
            _unitOfWorkMock.Object,
            NullLogger<UpdateQuotationCommandHandler>.Instance);

        var command = new UpdateQuotationCommand(
            quotationId,
            Guid.NewGuid(),
            DateTime.UtcNow,
            null,
            0,
            10,
            null,
            new List<QuotationItemDto>(),
            Guid.NewGuid());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(QuotationErrors.NotFound);
    }

    [Fact]
    public async Task UpdateQuotation_ShouldReturnNotFound_WhenCustomerDoesNotExist()
    {
        // Arrange
        var quotationId = Guid.NewGuid();
        var customerId = Guid.NewGuid();
        var quotation = CreateSampleQuotation(quotationId);

        _quotationRepoMock.Setup(r => r.GetByIdWithDetailsAsync(quotationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(quotation);
        _customerRepoMock.Setup(r => r.GetByIdAsync(customerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((QuotingCustomer?)null);

        var handler = new UpdateQuotationCommandHandler(
            _quotationRepoMock.Object,
            _customerRepoMock.Object,
            _unitOfWorkMock.Object,
            NullLogger<UpdateQuotationCommandHandler>.Instance);

        var command = new UpdateQuotationCommand(
            quotationId,
            customerId,
            DateTime.UtcNow,
            null,
            0,
            10,
            null,
            new List<QuotationItemDto>(),
            Guid.NewGuid());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(QuotingCustomerErrors.NotFound);
    }

    #endregion

    #region 2. ChangeQuotationStatusCommandHandler Tests

    [Fact]
    public async Task ChangeQuotationStatus_ShouldSucceed_WhenQuotationExists()
    {
        // Arrange
        var quotationId = Guid.NewGuid();
        var quotation = CreateSampleQuotation(quotationId);

        _quotationRepoMock.Setup(r => r.GetByIdWithDetailsAsync(quotationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(quotation);

        var handler = new ChangeQuotationStatusCommandHandler(
            _quotationRepoMock.Object,
            _unitOfWorkMock.Object,
            NullLogger<ChangeQuotationStatusCommandHandler>.Instance);

        var command = new ChangeQuotationStatusCommand(quotationId, "Approved", "Duyệt đơn", Guid.NewGuid());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        quotation.Status.Should().Be("Approved");
        _quotationRepoMock.Verify(r => r.Update(quotation), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ChangeQuotationStatus_ShouldReturnNotFound_WhenQuotationDoesNotExist()
    {
        // Arrange
        var quotationId = Guid.NewGuid();
        _quotationRepoMock.Setup(r => r.GetByIdWithDetailsAsync(quotationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Quotation?)null);

        var handler = new ChangeQuotationStatusCommandHandler(
            _quotationRepoMock.Object,
            _unitOfWorkMock.Object,
            NullLogger<ChangeQuotationStatusCommandHandler>.Instance);

        var command = new ChangeQuotationStatusCommand(quotationId, "Approved", null, Guid.NewGuid());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(QuotationErrors.NotFound);
    }

    #endregion

    #region 3. ExportQuotationFileCommandHandler Tests

    [Theory]
    [InlineData("pdf")]
    [InlineData("html")]
    public async Task ExportQuotationFile_ShouldGenerateAndUpload_WhenRequestIsValid(string fileType)
    {
        // Arrange
        var quotationId = Guid.NewGuid();
        var templateId = Guid.NewGuid();
        var quotation = CreateSampleQuotation(quotationId, templateId);

        var template = QuotationTemplate.Create("TPL-01", "Template Standard", null, false);
        template.AddNewVersion("BẢNG BÁO GIÁ", "{}", "Kính gửi", "{}", "{}", "{}", null, null);

        _quotationRepoMock.Setup(r => r.GetByIdWithDetailsAsync(quotationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(quotation);

        _templateRepoMock.Setup(r => r.GetByIdWithVersionsAsync(templateId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(template);

        _exportServiceMock.Setup(e => e.GeneratePdfAsync(It.IsAny<Quotation>(), It.IsAny<QuotationTemplateVersion>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new byte[] { 0x25, 0x50, 0x44, 0x46 }); // %PDF

        _exportServiceMock.Setup(e => e.GenerateHtmlAsync(It.IsAny<Quotation>(), It.IsAny<QuotationTemplateVersion>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync("<html>Báo giá</html>"u8.ToArray());

        _storageServiceMock.Setup(s => s.UploadFileAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<Stream>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(("https://storage.local/bg.file", "Local"));

        var handler = new ExportQuotationFileCommandHandler(
            _quotationRepoMock.Object,
            _templateRepoMock.Object,
            _exportServiceMock.Object,
            _storageServiceMock.Object,
            _unitOfWorkMock.Object,
            NullLogger<ExportQuotationFileCommandHandler>.Instance);

        var command = new ExportQuotationFileCommand(quotationId, fileType, Guid.NewGuid());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.FileType.Should().Be(fileType);
        result.Value.FileUrl.Should().Be("https://storage.local/bg.file");
        quotation.Files.Should().HaveCount(1);
    }

    [Fact]
    public async Task ExportQuotationFile_ShouldReturnInvalidFileType_WhenFormatIsUnsupported()
    {
        // Arrange
        var quotationId = Guid.NewGuid();
        var templateId = Guid.NewGuid();
        var quotation = CreateSampleQuotation(quotationId, templateId);

        var template = QuotationTemplate.Create("TPL-01", "Template Standard", null, false);
        template.AddNewVersion("BẢNG BÁO GIÁ", "{}", "Kính gửi", "{}", "{}", "{}", null, null);

        _quotationRepoMock.Setup(r => r.GetByIdWithDetailsAsync(quotationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(quotation);

        _templateRepoMock.Setup(r => r.GetByIdWithVersionsAsync(templateId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(template);

        var handler = new ExportQuotationFileCommandHandler(
            _quotationRepoMock.Object,
            _templateRepoMock.Object,
            _exportServiceMock.Object,
            _storageServiceMock.Object,
            _unitOfWorkMock.Object,
            NullLogger<ExportQuotationFileCommandHandler>.Instance);

        var command = new ExportQuotationFileCommand(quotationId, "docx", Guid.NewGuid());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(QuotationErrors.InvalidFileType);
    }

    [Fact]
    public async Task ExportQuotationFile_ShouldReturnNotFound_WhenQuotationDoesNotExist()
    {
        // Arrange
        var quotationId = Guid.NewGuid();
        _quotationRepoMock.Setup(r => r.GetByIdWithDetailsAsync(quotationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Quotation?)null);

        var handler = new ExportQuotationFileCommandHandler(
            _quotationRepoMock.Object,
            _templateRepoMock.Object,
            _exportServiceMock.Object,
            _storageServiceMock.Object,
            _unitOfWorkMock.Object,
            NullLogger<ExportQuotationFileCommandHandler>.Instance);

        var command = new ExportQuotationFileCommand(quotationId, "pdf", Guid.NewGuid());

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(QuotationErrors.NotFound);
    }

    #endregion

    #region 4. DeleteQuotationCommandHandler Tests

    [Fact]
    public async Task DeleteQuotation_ShouldSucceed_WhenQuotationExists()
    {
        // Arrange
        var quotationId = Guid.NewGuid();
        var quotation = CreateSampleQuotation(quotationId);

        _quotationRepoMock.Setup(r => r.GetByIdAsync(quotationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(quotation);

        var handler = new DeleteQuotationCommandHandler(
            _quotationRepoMock.Object,
            _unitOfWorkMock.Object,
            NullLogger<DeleteQuotationCommandHandler>.Instance);

        var command = new DeleteQuotationCommand(quotationId);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        quotation.IsDeleted.Should().BeTrue();
        _quotationRepoMock.Verify(r => r.Update(quotation), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteQuotation_ShouldReturnNotFound_WhenQuotationDoesNotExist()
    {
        // Arrange
        var quotationId = Guid.NewGuid();
        _quotationRepoMock.Setup(r => r.GetByIdAsync(quotationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Quotation?)null);

        var handler = new DeleteQuotationCommandHandler(
            _quotationRepoMock.Object,
            _unitOfWorkMock.Object,
            NullLogger<DeleteQuotationCommandHandler>.Instance);

        var command = new DeleteQuotationCommand(quotationId);

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(QuotationErrors.NotFound);
    }

    #endregion

    private static Quotation CreateSampleQuotation(Guid id, Guid? templateId = null)
    {
        var quotation = Quotation.Create(
            "BG-202611-TEST",
            Guid.NewGuid(),
            "Khách hàng Test",
            "Người liên hệ",
            "0909000000",
            "test@test.com",
            "Địa chỉ",
            "0319000000",
            templateId ?? Guid.NewGuid(),
            1,
            DateTime.UtcNow,
            DateTime.UtcNow.AddDays(30),
            0,
            10,
            "Ghi chú",
            Guid.NewGuid());

        // Reflectively set Id if needed
        typeof(Quotation).BaseType!.BaseType!
            .GetProperty(nameof(Quotation.Id))!
            .SetValue(quotation, id);

        return quotation;
    }
}
