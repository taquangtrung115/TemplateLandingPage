namespace OnePortal.UnitTests.Application.Quoting;

using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Quoting.Customers.Commands;
using OnePortal.Application.UseCases.V1.Quoting.Products.Commands;
using OnePortal.Application.UseCases.V1.Quoting.Quotations.Commands;
using OnePortal.Application.UseCases.V1.Quoting.Quotations.Queries;
using OnePortal.Application.UseCases.V1.Quoting.Templates.Commands;
using OnePortal.Contract.Services.V1.Quoting.Customers;
using OnePortal.Contract.Services.V1.Quoting.Products;
using OnePortal.Contract.Services.V1.Quoting.Quotations;
using OnePortal.Contract.Services.V1.Quoting.Templates;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities.Quoting;
using OnePortal.Domain.Repositories.Quoting;
using Xunit;

public class QuotingFullFlowEndToEndTests
{
    private readonly Mock<IQuotationRepository> _quotationRepo = new();
    private readonly Mock<IQuotingCustomerRepository> _customerRepo = new();
    private readonly Mock<IQuotingProductRepository> _productRepo = new();
    private readonly Mock<IQuotationTemplateRepository> _templateRepo = new();
    private readonly Mock<IQuotationExportService> _exportService = new();
    private readonly Mock<IQuotationFileStorageService> _storageService = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    public QuotingFullFlowEndToEndTests()
    {
        _quotationRepo.Setup(repository => repository.GetByIdForReadAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .Returns((Guid id, CancellationToken cancellationToken) => _quotationRepo.Object.GetByIdWithDetailsAsync(id, cancellationToken));
    }

    [Fact]
    public async Task FullFlow_FromEntitiesSetup_ToQuotationLifecycle_AndPdfExport()
    {
        // -------------------------------------------------------------
        // BƯỚC 1: CRUD KHÁCH HÀNG (Customer Creation & Retrieval)
        // -------------------------------------------------------------
        var createCustomerHandler = new CreateQuotingCustomerCommandHandler(
            _customerRepo.Object,
            _unitOfWork.Object,
            NullLogger<CreateQuotingCustomerCommandHandler>.Instance);

        var createCustomerCmd = new CreateQuotingCustomerCommand(
            "Đại lý Ăn Vặt Sài Gòn",
            "Nguyễn Văn Chủ",
            "0909123456",
            "anvat@saigon.vn",
            "123 Nguyễn Huệ, Q1, TP.HCM",
            "0312345678",
            "Khách hàng VIP");

        var customerResult = await createCustomerHandler.Handle(createCustomerCmd, CancellationToken.None);
        customerResult.IsSuccess.Should().BeTrue();
        var customerId = customerResult.Value;

        var customer = QuotingCustomer.Create(
            createCustomerCmd.Name,
            createCustomerCmd.ContactPerson,
            createCustomerCmd.Phone,
            createCustomerCmd.Email,
            createCustomerCmd.Address,
            createCustomerCmd.TaxCode,
            createCustomerCmd.Notes);
        typeof(QuotingCustomer).GetProperty(nameof(QuotingCustomer.Id))?.SetValue(customer, customerId);

        _customerRepo.Setup(r => r.GetByIdAsync(customerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(customer);

        // -------------------------------------------------------------
        // BƯỚC 2: CRUD SẢN PHẨM (Product Creation & Retrieval)
        // -------------------------------------------------------------
        _productRepo.Setup(r => r.IsCodeUniqueAsync(It.IsAny<string>(), It.IsAny<Guid?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var groupRepository = new Mock<IQuotingProductGroupRepository>();
        groupRepository.Setup(repository => repository.ResolveAsync(It.IsAny<Guid?>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(QuotingProductGroup.Create("COMBO", "A/ DÒNG COMBO", null, 1));
        var createProductHandler = new CreateQuotingProductCommandHandler(
            _productRepo.Object,
            _unitOfWork.Object,
            NullLogger<CreateQuotingProductCommandHandler>.Instance, groupRepository.Object);

        var createProductCmd = new CreateQuotingProductCommand(
            "SKU-CB-01",
            "COMBO NGUYÊN BẢN BAO NGON",
            "Set surimi thanh cua, cá viên, bò viên, chả giò",
            "GÓI",
            18000m,
            "https://cdn.example.com/combo1.jpg",
            "A/ DÒNG COMBO");

        var productResult = await createProductHandler.Handle(createProductCmd, CancellationToken.None);
        productResult.IsSuccess.Should().BeTrue();
        var productId = productResult.Value;

        var product = QuotingProduct.Create(
            createProductCmd.Code,
            createProductCmd.Name,
            createProductCmd.Description,
            createProductCmd.Unit,
            createProductCmd.Price,
            createProductCmd.ImageUrl,
            createProductCmd.Category);
        typeof(QuotingProduct).GetProperty(nameof(QuotingProduct.Id))?.SetValue(product, productId);

        // -------------------------------------------------------------
        // BƯỚC 3: CRUD MẪU BÁO GIÁ (Template Creation & Retrieval)
        // -------------------------------------------------------------
        var createTemplateHandler = new CreateQuotationTemplateCommandHandler(
            _templateRepo.Object,
            _unitOfWork.Object,
            NullLogger<CreateQuotationTemplateCommandHandler>.Instance);

        var createTemplateCmd = new CreateQuotationTemplateCommand(
            "TPL-CHUOI-AN-VAT-V1",
            "Mẫu Chuỗi Ăn Vặt Chuẩn",
            "Mẫu áp dụng cho hệ thống đại lý thức ăn nhanh",
            true, // IsSystem = true
            "BẢNG BÁO GIÁ THƯƠNG MẠI",
            "{\"company\":\"CÔNG TY CỔ PHẦN CHUỖI ĂN VẶT\"}",
            "Kính gửi: Quý Đại lý và Đối tác",
            "{\"terms\":\"Thanh toán 100% khi nhận hàng\"}",
            "{\"signatory\":\"Giám đốc Kinh Doanh\"}",
            "{\"primaryColor\":\"#3b82f6\"}",
            null);

        var templateResult = await createTemplateHandler.Handle(createTemplateCmd, CancellationToken.None);
        templateResult.IsSuccess.Should().BeTrue();
        var templateId = templateResult.Value;

        var template = QuotationTemplate.Create(
            createTemplateCmd.Code,
            createTemplateCmd.Name,
            createTemplateCmd.Description,
            createTemplateCmd.IsSystem);
        typeof(QuotationTemplate).GetProperty(nameof(QuotationTemplate.Id))?.SetValue(template, templateId);
        template.AddNewVersion(
            createTemplateCmd.Title,
            createTemplateCmd.SellerInfoJson,
            createTemplateCmd.SalutationText,
            createTemplateCmd.ColumnsConfigJson,
            createTemplateCmd.PaymentTermsJson,
            createTemplateCmd.SignatureConfigJson,
            null,
            null);

        _templateRepo.Setup(r => r.GetByIdWithVersionsAsync(templateId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(template);
        _templateRepo.Setup(r => r.GetDefaultSystemTemplateAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(template);

        // -------------------------------------------------------------
        // BƯỚC 4: TẠO BÁO GIÁ (Quotation Creation - Fallback Template & Custom Customer)
        // -------------------------------------------------------------
        _quotationRepo.Setup(r => r.GenerateNextQuotationNumberAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync("BG-202611-8888");

        Quotation? createdQuotation = null;
        _quotationRepo.Setup(r => r.Add(It.IsAny<Quotation>()))
            .Callback<Quotation>(q => createdQuotation = q);

        var createQuotationHandler = new CreateQuotationCommandHandler(
            _quotationRepo.Object,
            _customerRepo.Object,
            _templateRepo.Object,
            _unitOfWork.Object,
            NullLogger<CreateQuotationCommandHandler>.Instance);

        var createQuotationCmd = new CreateQuotationCommand(
            customerId,
            TemplateId: null, // Test Fallback template tự động
            TemplateVersion: null,
            IssueDate: DateTime.UtcNow,
            ValidUntil: DateTime.UtcNow.AddDays(15),
            DiscountPercent: 5,
            TaxPercent: 8,
            Notes: "Báo giá đơn thử nghiệm hệ thống",
            Items: new List<QuotationItemDto>
            {
                new(
                    productId,
                    product.Code,
                    product.Name,
                    product.Description,
                    product.Unit,
                    product.ImageUrl,
                    product.Category,
                    Quantity: 10,
                    UnitPrice: 18000m,
                    DiscountPercent: 0,
                    Notes: "Giao tại kho",
                    SortOrder: 1)
            },
            UserId: Guid.NewGuid());

        var quotationResult = await createQuotationHandler.Handle(createQuotationCmd, CancellationToken.None);
        quotationResult.IsSuccess.Should().BeTrue();
        var quotationId = quotationResult.Value;

        createdQuotation.Should().NotBeNull();
        createdQuotation!.Id.Should().Be(quotationId);
        createdQuotation.Status.Should().Be("Draft");
        createdQuotation.CustomerName.Should().Be("Đại lý Ăn Vặt Sài Gòn");
        createdQuotation.TemplateId.Should().Be(templateId);
        createdQuotation.SubTotal.Should().Be(180000m);
        createdQuotation.DiscountAmount.Should().Be(9000m); // 5% of 180,000
        createdQuotation.TaxAmount.Should().Be(13680m); // 8% of (180,000 - 9,000) = 171,000 * 0.08
        createdQuotation.TotalAmount.Should().Be(184680m);

        _quotationRepo.Setup(r => r.GetByIdWithDetailsAsync(quotationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdQuotation);
        _quotationRepo.Setup(r => r.GetByIdAsync(quotationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdQuotation);

        // -------------------------------------------------------------
        // BƯỚC 5: XEM CHI TIẾT & PREVIEW BÁO GIÁ
        // -------------------------------------------------------------
        var getDetailHandler = new GetQuotationByIdQueryHandler(_quotationRepo.Object);

        var detailResult = await getDetailHandler.Handle(new GetQuotationByIdQuery(quotationId), CancellationToken.None);
        detailResult.IsSuccess.Should().BeTrue();
        detailResult.Value.QuotationNumber.Should().Be("BG-202611-8888");
        detailResult.Value.Status.Should().Be("Draft");
        detailResult.Value.Items.Should().HaveCount(1);

        var previewHtml = "<html><body><h1>BG-202611-8888 Preview</h1></body></html>";
        _exportService.Setup(e => e.GenerateHtmlAsync(It.IsAny<Quotation>(), It.IsAny<QuotationTemplateVersion>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Encoding.UTF8.GetBytes(previewHtml));

        var previewHandler = new PreviewQuotationQueryHandler(
            _quotationRepo.Object,
            _templateRepo.Object,
            _exportService.Object);

        var previewResult = await previewHandler.Handle(new PreviewQuotationQuery(quotationId), CancellationToken.None);
        previewResult.IsSuccess.Should().BeTrue();
        previewResult.Value.QuotationId.Should().Be(quotationId);
        previewResult.Value.HtmlContent.Should().Contain("BG-202611-8888 Preview");

        // -------------------------------------------------------------
        // BƯỚC 6: XUẤT FILE PDF (Trả về Byte Array)
        // -------------------------------------------------------------
        var fakePdfBytes = Encoding.UTF8.GetBytes("%PDF-1.4 Fake PDF Content for Test");
        _exportService.Setup(e => e.GeneratePdfAsync(It.IsAny<Quotation>(), It.IsAny<QuotationTemplateVersion>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(fakePdfBytes);

        _storageService.Setup(s => s.UploadFileAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<Stream>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(("/uploads/quotations/test-export.pdf", "LocalFileSystem"));

        var exportHandler = new ExportQuotationFileCommandHandler(
            _quotationRepo.Object,
            _templateRepo.Object,
            _exportService.Object,
            _storageService.Object,
            _unitOfWork.Object,
            NullLogger<ExportQuotationFileCommandHandler>.Instance);

        var exportResult = await exportHandler.Handle(new ExportQuotationFileCommand(quotationId, "pdf", Guid.NewGuid()), CancellationToken.None);
        exportResult.IsSuccess.Should().BeTrue();
        exportResult.Value.FileType.Should().Be("pdf");
        exportResult.Value.FileUrl.Should().Be("/uploads/quotations/test-export.pdf");
        exportResult.Value.FileSize.Should().Be(fakePdfBytes.Length);

        // -------------------------------------------------------------
        // BƯỚC 7: THAY ĐỔI TRẠNG THÁI (Draft -> Sent -> Approved)
        // -------------------------------------------------------------
        var changeStatusHandler = new ChangeQuotationStatusCommandHandler(
            _quotationRepo.Object,
            _unitOfWork.Object,
            NullLogger<ChangeQuotationStatusCommandHandler>.Instance);

        // 7.1. Chuyển sang Sent
        var sentResult = await changeStatusHandler.Handle(
            new ChangeQuotationStatusCommand(quotationId, "Sent", "Đã gửi email cho khách", Guid.NewGuid()),
            CancellationToken.None);
        sentResult.IsSuccess.Should().BeTrue();
        createdQuotation.Status.Should().Be("Sent");

        // 7.2. Chuyển sang Approved
        var approvedResult = await changeStatusHandler.Handle(
            new ChangeQuotationStatusCommand(quotationId, "Approved", "Khách hàng đồng ý ký duyệt", Guid.NewGuid()),
            CancellationToken.None);
        approvedResult.IsSuccess.Should().BeTrue();
        createdQuotation.Status.Should().Be("Approved");

        // -------------------------------------------------------------
        // BƯỚC 8: XÓA BÁO GIÁ (Soft delete)
        // -------------------------------------------------------------
        var deleteHandler = new DeleteQuotationCommandHandler(
            _quotationRepo.Object,
            _unitOfWork.Object,
            NullLogger<DeleteQuotationCommandHandler>.Instance);

        var deleteResult = await deleteHandler.Handle(new DeleteQuotationCommand(quotationId), CancellationToken.None);
        deleteResult.IsSuccess.Should().BeTrue();
        createdQuotation.IsDeleted.Should().BeTrue();

        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.AtLeast(4));
    }

    [Fact]
    public async Task FullFlow_GenericCustomer_BypassCustomer_WithFallbackTemplate_AndPdfExport()
    {
        // -------------------------------------------------------------
        // NHÓM 1: HAPPY PATH - BÁO GIÁ VÃNG LAI (BỎ QUA KHÁCH HÀNG) & FALLBACK SYSTEM TEMPLATE
        // -------------------------------------------------------------
        var templateId = Guid.NewGuid();
        var systemTemplate = QuotationTemplate.Create("TPL-CHUOI-AN-VAT-V1", "Mẫu Mặc Định Ăn Vặt", null, true);
        typeof(QuotationTemplate).GetProperty(nameof(QuotationTemplate.Id))?.SetValue(systemTemplate, templateId);
        systemTemplate.AddNewVersion("BẢNG BÁO GIÁ CHUỖI ĂN VẶT", "{}", "Kính gửi: Quý Khách hàng", "{}", "{}", "{}", null, null);

        _templateRepo.Setup(r => r.GetDefaultSystemTemplateAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(systemTemplate);
        _templateRepo.Setup(r => r.GetByIdWithVersionsAsync(templateId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(systemTemplate);

        _quotationRepo.Setup(r => r.GenerateNextQuotationNumberAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync("BG-202611-9001");

        Quotation? createdQuotation = null;
        _quotationRepo.Setup(r => r.Add(It.IsAny<Quotation>()))
            .Callback<Quotation>(q => createdQuotation = q);

        var createQuotationHandler = new CreateQuotationCommandHandler(
            _quotationRepo.Object,
            _customerRepo.Object,
            _templateRepo.Object,
            _unitOfWork.Object,
            NullLogger<CreateQuotationCommandHandler>.Instance);

        // Bỏ qua khách hàng (CustomerId: null) và không truyền TemplateId (TemplateId: null)
        var createQuotationCmd = new CreateQuotationCommand(
            CustomerId: null,
            TemplateId: null,
            TemplateVersion: null,
            IssueDate: DateTime.UtcNow,
            ValidUntil: DateTime.UtcNow.AddDays(7),
            DiscountPercent: 10,
            TaxPercent: 8,
            Notes: "Báo giá cho khách vãng lai mua sỉ combo ăn vặt",
            Items: new List<QuotationItemDto>
            {
                new(
                    ProductId: null, // Sản phẩm tự nhập không qua catalog ID
                    "CUSTOM-SKU-01",
                    "Surimi Tôm Tươi Cuộn Rong Biển Đặc Biệt",
                    "Surimi tôm cao cấp cuốn rong biển Nhật",
                    "10 CUỘN/GÓI",
                    null,
                    "B/ DÒNG SẢN PHẨM XIÊN QUE",
                    Quantity: 5,
                    UnitPrice: 40000m,
                    DiscountPercent: 0,
                    Notes: "Đóng gói lạnh",
                    SortOrder: 1)
            },
            UserId: Guid.NewGuid());

        var result = await createQuotationHandler.Handle(createQuotationCmd, CancellationToken.None);
        result.IsSuccess.Should().BeTrue();
        var quotationId = result.Value;

        // Xác thực thông tin khách hàng vãng lai
        createdQuotation.Should().NotBeNull();
        createdQuotation!.Id.Should().Be(quotationId);
        createdQuotation.CustomerId.Should().BeNull();
        createdQuotation.CustomerName.Should().Be("QUÝ KHÁCH HÀNG");
        createdQuotation.CustomerPhone.Should().BeNull();
        createdQuotation.TemplateId.Should().Be(templateId);
        createdQuotation.SubTotal.Should().Be(200000m); // 5 * 40,000
        createdQuotation.DiscountAmount.Should().Be(20000m); // 10%
        createdQuotation.TaxAmount.Should().Be(14400m); // 8% of 180,000
        createdQuotation.TotalAmount.Should().Be(194400m);

        _customerRepo.Verify(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);

        _quotationRepo.Setup(r => r.GetByIdWithDetailsAsync(quotationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdQuotation);
        _quotationRepo.Setup(r => r.GetByIdAsync(quotationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdQuotation);

        // Preview Báo giá
        var previewHtml = "<html><body><h1>BG-202611-9001 - QUÝ KHÁCH HÀNG</h1></body></html>";
        _exportService.Setup(e => e.GenerateHtmlAsync(It.IsAny<Quotation>(), It.IsAny<QuotationTemplateVersion>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Encoding.UTF8.GetBytes(previewHtml));

        var previewHandler = new PreviewQuotationQueryHandler(_quotationRepo.Object, _templateRepo.Object, _exportService.Object);
        var previewResult = await previewHandler.Handle(new PreviewQuotationQuery(quotationId), CancellationToken.None);
        previewResult.IsSuccess.Should().BeTrue();
        previewResult.Value.HtmlContent.Should().Contain("QUÝ KHÁCH HÀNG");

        // Xuất PDF kiểm tra Header byte array %PDF-1.4
        var pdfBytes = Encoding.UTF8.GetBytes("%PDF-1.4 Standard PDF Header for Chuoi An Vat");
        _exportService.Setup(e => e.GeneratePdfAsync(It.IsAny<Quotation>(), It.IsAny<QuotationTemplateVersion>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(pdfBytes);

        _storageService.Setup(s => s.UploadFileAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<Stream>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(("/uploads/quotations/generic-export.pdf", "LocalFileSystem"));

        var exportHandler = new ExportQuotationFileCommandHandler(
            _quotationRepo.Object,
            _templateRepo.Object,
            _exportService.Object,
            _storageService.Object,
            _unitOfWork.Object,
            NullLogger<ExportQuotationFileCommandHandler>.Instance);

        var exportResult = await exportHandler.Handle(new ExportQuotationFileCommand(quotationId, "pdf", Guid.NewGuid()), CancellationToken.None);
        exportResult.IsSuccess.Should().BeTrue();
        exportResult.Value.FileType.Should().Be("pdf");
        pdfBytes.Take(8).Should().Equal(Encoding.UTF8.GetBytes("%PDF-1.4"));

        // Chuyển trạng thái sang Sent rồi sang Approved
        var changeStatusHandler = new ChangeQuotationStatusCommandHandler(
            _quotationRepo.Object,
            _unitOfWork.Object,
            NullLogger<ChangeQuotationStatusCommandHandler>.Instance);

        var sentResult = await changeStatusHandler.Handle(
            new ChangeQuotationStatusCommand(quotationId, "Sent", "Gửi cho khách", Guid.NewGuid()),
            CancellationToken.None);
        sentResult.IsSuccess.Should().BeTrue();
        createdQuotation.Status.Should().Be("Sent");

        var approvedResult = await changeStatusHandler.Handle(
            new ChangeQuotationStatusCommand(quotationId, "Approved", "Khách đã chuyển khoản", Guid.NewGuid()),
            CancellationToken.None);
        approvedResult.IsSuccess.Should().BeTrue();
        createdQuotation.Status.Should().Be("Approved");

        // Xóa Báo giá
        var deleteHandler = new DeleteQuotationCommandHandler(_quotationRepo.Object, _unitOfWork.Object, NullLogger<DeleteQuotationCommandHandler>.Instance);
        var deleteResult = await deleteHandler.Handle(new DeleteQuotationCommand(quotationId), CancellationToken.None);
        deleteResult.IsSuccess.Should().BeTrue();
        createdQuotation.IsDeleted.Should().BeTrue();
    }

    [Fact]
    public async Task EdgeCase_CreateQuotation_WhenTemplateIdIsEmptyGuid_ShouldFallbackToSystemTemplate()
    {
        // -------------------------------------------------------------
        // NHÓM 2: EDGE CASE - TemplateId là Guid.Empty -> Fallback về TPL-CHUOI-AN-VAT-V1
        // -------------------------------------------------------------
        var templateId = Guid.NewGuid();
        var template = QuotationTemplate.Create("TPL-CHUOI-AN-VAT-V1", "Mẫu Hệ Thống", null, true);
        typeof(QuotationTemplate).GetProperty(nameof(QuotationTemplate.Id))?.SetValue(template, templateId);
        template.AddNewVersion("BẢNG BÁO GIÁ", "{}", "Kính gửi", "{}", "{}", "{}", null, null);

        _templateRepo.Setup(r => r.GetDefaultSystemTemplateAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(template);

        _quotationRepo.Setup(r => r.GenerateNextQuotationNumberAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync("BG-202611-9002");

        Quotation? createdQuotation = null;
        _quotationRepo.Setup(r => r.Add(It.IsAny<Quotation>()))
            .Callback<Quotation>(q => createdQuotation = q);

        var handler = new CreateQuotationCommandHandler(
            _quotationRepo.Object,
            _customerRepo.Object,
            _templateRepo.Object,
            _unitOfWork.Object,
            NullLogger<CreateQuotationCommandHandler>.Instance);

        var command = new CreateQuotationCommand(
            CustomerId: null,
            TemplateId: Guid.Empty, // Guid.Empty
            TemplateVersion: null,
            IssueDate: DateTime.UtcNow,
            ValidUntil: null,
            DiscountPercent: 0,
            TaxPercent: 0,
            Notes: null,
            Items: new List<QuotationItemDto>
            {
                new(null, "SKU-TEST", "Món Ăn Vặt", null, "GÓI", null, null, 1, 10000, 0, null, 1)
            },
            UserId: Guid.NewGuid());

        var result = await handler.Handle(command, CancellationToken.None);
        result.IsSuccess.Should().BeTrue();
        createdQuotation.Should().NotBeNull();
        createdQuotation!.TemplateId.Should().Be(templateId);
    }

    [Fact]
    public async Task EdgeCase_CreateQuotation_WithBoundaryDiscountAndTax_ZeroAndHundredPercent()
    {
        // -------------------------------------------------------------
        // NHÓM 2: EDGE CASE - Giá trị biên: Chiết khấu 100%, Thuế 0%
        // -------------------------------------------------------------
        var templateId = Guid.NewGuid();
        var template = QuotationTemplate.Create("TPL-CHUOI-AN-VAT-V1", "Mẫu Mặc Định", null, true);
        typeof(QuotationTemplate).GetProperty(nameof(QuotationTemplate.Id))?.SetValue(template, templateId);
        template.AddNewVersion("BẢNG BÁO GIÁ", "{}", "Kính gửi", "{}", "{}", "{}", null, null);

        _templateRepo.Setup(r => r.GetDefaultSystemTemplateAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(template);

        _quotationRepo.Setup(r => r.GenerateNextQuotationNumberAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync("BG-202611-9003");

        Quotation? createdQuotation = null;
        _quotationRepo.Setup(r => r.Add(It.IsAny<Quotation>()))
            .Callback<Quotation>(q => createdQuotation = q);

        var handler = new CreateQuotationCommandHandler(
            _quotationRepo.Object,
            _customerRepo.Object,
            _templateRepo.Object,
            _unitOfWork.Object,
            NullLogger<CreateQuotationCommandHandler>.Instance);

        // Chiết khấu 100% (tặng mẫu miễn phí), Thuế 0%
        var command = new CreateQuotationCommand(
            CustomerId: null,
            TemplateId: null,
            TemplateVersion: null,
            IssueDate: DateTime.UtcNow,
            ValidUntil: null,
            DiscountPercent: 100m,
            TaxPercent: 0m,
            Notes: "Hàng tặng dùng thử",
            Items: new List<QuotationItemDto>
            {
                new(null, "SKU-FREE", "Mẫu thử Surimi Tôm", null, "GÓI", null, null, 10, 20000m, 0, null, 1)
            },
            UserId: Guid.NewGuid());

        var result = await handler.Handle(command, CancellationToken.None);
        result.IsSuccess.Should().BeTrue();
        createdQuotation.Should().NotBeNull();
        createdQuotation!.SubTotal.Should().Be(200000m);
        createdQuotation.DiscountAmount.Should().Be(200000m); // 100% discount
        createdQuotation.TaxAmount.Should().Be(0m);
        createdQuotation.TotalAmount.Should().Be(0m); // Tổng tiền bằng 0
    }

    [Fact]
    public async Task NegativeCase_UpdateQuotation_WhenStatusIsNotDraft_ShouldFailWithCannotEditNonDraft()
    {
        // -------------------------------------------------------------
        // NHÓM 3: NEGATIVE / FAILURE CASE - Sửa báo giá khi trạng thái không phải Draft
        // -------------------------------------------------------------
        var quotationId = Guid.NewGuid();
        var quotation = Quotation.Create(
            "BG-202611-9999",
            null,
            "QUÝ KHÁCH HÀNG",
            null,
            null,
            null,
            null,
            null,
            Guid.NewGuid(),
            1,
            DateTime.UtcNow,
            null,
            0,
            0,
            null,
            Guid.NewGuid());
        typeof(Quotation).GetProperty(nameof(Quotation.Id))?.SetValue(quotation, quotationId);
        quotation.ChangeStatus("Sent", Guid.NewGuid(), "Đã gửi khách");

        _quotationRepo.Setup(r => r.GetByIdWithDetailsAsync(quotationId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(quotation);

        var handler = new UpdateQuotationCommandHandler(
            _quotationRepo.Object,
            _customerRepo.Object,
            _unitOfWork.Object,
            NullLogger<UpdateQuotationCommandHandler>.Instance);

        var command = new UpdateQuotationCommand(
            quotationId,
            CustomerId: null,
            IssueDate: DateTime.UtcNow,
            ValidUntil: null,
            DiscountPercent: 5,
            TaxPercent: 10,
            Notes: "Cố tình sửa báo giá đã gửi",
            Items: new List<QuotationItemDto>
            {
                new(null, "SKU", "Sản phẩm", null, "GÓI", null, null, 1, 10000, 0, null, 1)
            },
            UserId: Guid.NewGuid());

        var result = await handler.Handle(command, CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(QuotationErrors.CannotEditNonDraft);
        _quotationRepo.Verify(r => r.Update(It.IsAny<Quotation>()), Times.Never);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task NegativeCase_DeleteQuotation_WhenNotFound_ShouldFailWithQuotationNotFound()
    {
        // -------------------------------------------------------------
        // NHÓM 3: NEGATIVE / FAILURE CASE - Xóa báo giá không tồn tại
        // -------------------------------------------------------------
        var nonExistentId = Guid.NewGuid();
        _quotationRepo.Setup(r => r.GetByIdAsync(nonExistentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Quotation?)null);

        var handler = new DeleteQuotationCommandHandler(
            _quotationRepo.Object,
            _unitOfWork.Object,
            NullLogger<DeleteQuotationCommandHandler>.Instance);

        var result = await handler.Handle(new DeleteQuotationCommand(nonExistentId), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be(QuotationErrors.NotFound);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
