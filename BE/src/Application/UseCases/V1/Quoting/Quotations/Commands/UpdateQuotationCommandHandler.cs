namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Quotations.Commands;

using Microsoft.Extensions.Logging;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Quoting.Customers;
using TemplateLandingPage.Contract.Services.V1.Quoting.Quotations;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities.Quoting;
using TemplateLandingPage.Domain.Repositories.Quoting;

public sealed class UpdateQuotationCommandHandler : ICommandHandler<UpdateQuotationCommand>
{
    private readonly IQuotationRepository _quotationRepository;
    private readonly IQuotingCustomerRepository _customerRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateQuotationCommandHandler> _logger;

    public UpdateQuotationCommandHandler(
        IQuotationRepository quotationRepository,
        IQuotingCustomerRepository customerRepository,
        IUnitOfWork unitOfWork,
        ILogger<UpdateQuotationCommandHandler> logger)
    {
        _quotationRepository = quotationRepository;
        _customerRepository = customerRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result> Handle(UpdateQuotationCommand request, CancellationToken cancellationToken)
    {
        var quotation = await _quotationRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (quotation is null || quotation.IsDeleted)
        {
            return Result.Failure(QuotationErrors.NotFound);
        }

        if (quotation.Status != "Draft")
        {
            return Result.Failure(QuotationErrors.CannotEditNonDraft);
        }

        QuotingCustomer? customer = null;
        if (request.CustomerId.HasValue)
        {
            customer = await _customerRepository.GetByIdAsync(request.CustomerId.Value, cancellationToken);
            if (customer is null || customer.IsDeleted)
            {
                return Result.Failure(QuotingCustomerErrors.NotFound);
            }
        }

        quotation.UpdateDetails(
            customer?.Id,
            customer?.Name ?? "QUÝ KHÁCH HÀNG",
            customer?.ContactPerson,
            customer?.Phone,
            customer?.Email,
            customer?.Address,
            customer?.TaxCode,
            request.IssueDate,
            request.ValidUntil,
            request.DiscountPercent,
            request.TaxPercent,
            request.Notes,
            request.UserId);

        var items = request.Items.Select((dto, idx) => QuotationItem.Create(
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
            dto.SortOrder > 0 ? dto.SortOrder : idx + 1)).ToList();

        quotation.SetItems(items, request.UserId);

        _quotationRepository.Update(quotation);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Quotation {QuotationNumber} updated successfully", quotation.QuotationNumber);

        return Result.Success();
    }
}
