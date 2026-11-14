namespace OnePortal.Application.UseCases.V1.Quoting.Customers.Commands;

using Microsoft.Extensions.Logging;
using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Quoting.Customers;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Repositories.Quoting;

public sealed class UpdateQuotingCustomerCommandHandler : ICommandHandler<UpdateQuotingCustomerCommand>
{
    private readonly IQuotingCustomerRepository _customerRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateQuotingCustomerCommandHandler> _logger;

    public UpdateQuotingCustomerCommandHandler(
        IQuotingCustomerRepository customerRepository,
        IUnitOfWork unitOfWork,
        ILogger<UpdateQuotingCustomerCommandHandler> logger)
    {
        _customerRepository = customerRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result> Handle(UpdateQuotingCustomerCommand request, CancellationToken cancellationToken)
    {
        var customer = await _customerRepository.GetByIdAsync(request.Id, cancellationToken);
        if (customer is null || customer.IsDeleted)
        {
            return Result.Failure(QuotingCustomerErrors.NotFound);
        }

        customer.Update(
            request.Name,
            request.ContactPerson,
            request.Phone,
            request.Email,
            request.Address,
            request.TaxCode,
            request.Notes,
            request.IsActive);

        _customerRepository.Update(customer);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Quoting customer {CustomerId} updated successfully", customer.Id);

        return Result.Success();
    }
}
