namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Customers.Commands;

using Microsoft.Extensions.Logging;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Quoting.Customers;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities.Quoting;
using TemplateLandingPage.Domain.Repositories.Quoting;

public sealed class CreateQuotingCustomerCommandHandler : ICommandHandler<CreateQuotingCustomerCommand, Guid>
{
    private readonly IQuotingCustomerRepository _customerRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateQuotingCustomerCommandHandler> _logger;

    public CreateQuotingCustomerCommandHandler(
        IQuotingCustomerRepository customerRepository,
        IUnitOfWork unitOfWork,
        ILogger<CreateQuotingCustomerCommandHandler> logger)
    {
        _customerRepository = customerRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Guid>> Handle(CreateQuotingCustomerCommand request, CancellationToken cancellationToken)
    {
        var customer = QuotingCustomer.Create(
            request.Name,
            request.ContactPerson,
            request.Phone,
            request.Email,
            request.Address,
            request.TaxCode,
            request.Notes);

        _customerRepository.Add(customer);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Quoting customer {CustomerId} ({Name}) created successfully", customer.Id, customer.Name);

        return Result.Success(customer.Id);
    }
}
