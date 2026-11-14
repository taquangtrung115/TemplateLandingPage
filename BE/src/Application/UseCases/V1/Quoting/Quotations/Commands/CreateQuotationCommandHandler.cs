namespace OnePortal.Application.UseCases.V1.Quoting.Quotations.Commands;

using Microsoft.Extensions.Logging;
using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Quoting.Customers;
using OnePortal.Contract.Services.V1.Quoting.Quotations;
using OnePortal.Contract.Services.V1.Quoting.Templates;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities.Quoting;
using OnePortal.Domain.Repositories.Quoting;

public sealed class CreateQuotationCommandHandler : ICommandHandler<CreateQuotationCommand, Guid>
{
    private readonly IQuotationRepository _quotationRepository;
    private readonly IQuotingCustomerRepository _customerRepository;
    private readonly IQuotationTemplateRepository _templateRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateQuotationCommandHandler> _logger;

    public CreateQuotationCommandHandler(
        IQuotationRepository quotationRepository,
        IQuotingCustomerRepository customerRepository,
        IQuotationTemplateRepository templateRepository,
        IUnitOfWork unitOfWork,
        ILogger<CreateQuotationCommandHandler> logger)
    {
        _quotationRepository = quotationRepository;
        _customerRepository = customerRepository;
        _templateRepository = templateRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Guid>> Handle(CreateQuotationCommand request, CancellationToken cancellationToken)
    {
        QuotingCustomer? customer = null;
        if (request.CustomerId.HasValue)
        {
            customer = await _customerRepository.GetByIdAsync(request.CustomerId.Value, cancellationToken);
            if (customer is null || customer.IsDeleted)
            {
                return Result.Failure<Guid>(QuotingCustomerErrors.NotFound);
            }
        }

        QuotationTemplate? template = null;
        if (!request.TemplateId.HasValue || request.TemplateId.Value == Guid.Empty)
        {
            template = await _templateRepository.GetDefaultSystemTemplateAsync(cancellationToken);
            if (template is null)
            {
                var allTemplates = await _templateRepository.GetAllAsync(cancellationToken);
                template = allTemplates.FirstOrDefault(t => t.Code == "TPL-CHUOI-AN-VAT-V1" || t.IsSystem);
            }
        }
        else
        {
            template = await _templateRepository.GetByIdWithVersionsAsync(request.TemplateId.Value, cancellationToken);
        }

        if (template is null || template.IsDeleted)
        {
            return Result.Failure<Guid>(QuotationTemplateErrors.NotFound);
        }

        var versionNumber = request.TemplateVersion ?? template.CurrentVersion;
        var templateVersion = template.Versions.FirstOrDefault(v => v.Version == versionNumber);
        if (templateVersion is null)
        {
            return Result.Failure<Guid>(QuotationTemplateErrors.VersionNotFound);
        }

        var quotationNumber = await _quotationRepository.GenerateNextQuotationNumberAsync(cancellationToken);

        var quotation = Quotation.Create(
            quotationNumber,
            customer?.Id,
            customer?.Name ?? "QUÝ KHÁCH HÀNG",
            customer?.ContactPerson,
            customer?.Phone,
            customer?.Email,
            customer?.Address,
            customer?.TaxCode,
            template.Id,
            versionNumber,
            request.IssueDate == default ? DateTime.UtcNow : request.IssueDate,
            request.ValidUntil,
            request.DiscountPercent,
            request.TaxPercent,
            request.Notes,
            request.UserId);

        var items = (request.Items ?? new List<QuotationItemDto>()).Select((dto, idx) => QuotationItem.Create(
            quotation.Id,
            dto.ProductId,
            dto.ProductCode,
            dto.ProductName,
            dto.Description,
            dto.Unit,
            dto.ImageUrl,
            dto.ItemGroup,
            dto.Quantity,
            dto.UnitPrice,
            dto.DiscountPercent,
            dto.Notes,
            dto.SortOrder > 0 ? dto.SortOrder : idx + 1, dto.GroupSortOrder)).ToList();

        quotation.SetDisplayOptions(request.ShowDiscount, request.ShowQuantity, request.ShowSubTotal, request.ShowGrandTotal);
        quotation.SetItems(items, request.UserId);

        _quotationRepository.Add(quotation);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Quotation {QuotationNumber} (Id: {QuotationId}) created successfully", quotation.QuotationNumber, quotation.Id);

        return Result.Success(quotation.Id);
    }
}
