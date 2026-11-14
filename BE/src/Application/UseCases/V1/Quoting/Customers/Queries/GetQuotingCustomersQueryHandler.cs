namespace OnePortal.Application.UseCases.V1.Quoting.Customers.Queries;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Quoting.Customers;
using OnePortal.Domain.Repositories.Quoting;

public sealed class GetQuotingCustomersQueryHandler : IQueryHandler<GetQuotingCustomersQuery, List<QuotingCustomerResponse>>
{
    private readonly IQuotingCustomerRepository _customerRepository;

    public GetQuotingCustomersQueryHandler(IQuotingCustomerRepository customerRepository)
    {
        _customerRepository = customerRepository;
    }

    public async Task<Result<List<QuotingCustomerResponse>>> Handle(GetQuotingCustomersQuery request, CancellationToken cancellationToken)
    {
        var customers = await _customerRepository.SearchAsync(
            request.SearchTerm,
            request.IncludeInactive,
            cancellationToken);

        var response = customers.Select(c => new QuotingCustomerResponse(
            c.Id,
            c.Name,
            c.ContactPerson,
            c.Phone,
            c.Email,
            c.Address,
            c.TaxCode,
            c.Notes,
            c.IsActive,
            c.CreatedAtUtc,
            c.ModifiedAtUtc)).ToList();

        return Result.Success(response);
    }
}
