namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Customers.Queries;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Quoting.Customers;
using TemplateLandingPage.Domain.Repositories.Quoting;

public sealed class GetQuotingCustomerByIdQueryHandler : IQueryHandler<GetQuotingCustomerByIdQuery, QuotingCustomerResponse>
{
    private readonly IQuotingCustomerRepository _customerRepository;

    public GetQuotingCustomerByIdQueryHandler(IQuotingCustomerRepository customerRepository)
    {
        _customerRepository = customerRepository;
    }

    public async Task<Result<QuotingCustomerResponse>> Handle(GetQuotingCustomerByIdQuery request, CancellationToken cancellationToken)
    {
        var customer = await _customerRepository.GetByIdAsync(request.Id, cancellationToken);
        if (customer is null || customer.IsDeleted)
        {
            return Result.Failure<QuotingCustomerResponse>(QuotingCustomerErrors.NotFound);
        }

        var response = new QuotingCustomerResponse(
            customer.Id,
            customer.Name,
            customer.ContactPerson,
            customer.Phone,
            customer.Email,
            customer.Address,
            customer.TaxCode,
            customer.Notes,
            customer.IsActive,
            customer.CreatedAtUtc,
            customer.ModifiedAtUtc);

        return Result.Success(response);
    }
}
