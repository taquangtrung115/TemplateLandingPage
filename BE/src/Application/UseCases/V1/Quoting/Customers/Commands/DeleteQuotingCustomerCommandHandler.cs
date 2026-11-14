namespace OnePortal.Application.UseCases.V1.Quoting.Customers.Commands;

using Microsoft.Extensions.Logging;
using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Quoting.Customers;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Repositories.Quoting;

public sealed class DeleteQuotingCustomerCommandHandler : ICommandHandler<DeleteQuotingCustomerCommand>
{
    private readonly IQuotingCustomerRepository _customerRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<DeleteQuotingCustomerCommandHandler> _logger;

    public DeleteQuotingCustomerCommandHandler(
        IQuotingCustomerRepository customerRepository,
        IUnitOfWork unitOfWork,
        ILogger<DeleteQuotingCustomerCommandHandler> logger)
    {
        _customerRepository = customerRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteQuotingCustomerCommand request, CancellationToken cancellationToken)
    {
        var customer = await _customerRepository.GetByIdAsync(request.Id, cancellationToken);
        if (customer is null || customer.IsDeleted)
        {
            return Result.Failure(QuotingCustomerErrors.NotFound);
        }

        customer.Delete();
        _customerRepository.Update(customer);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Quoting customer {CustomerId} deleted successfully", customer.Id);

        return Result.Success();
    }
}
