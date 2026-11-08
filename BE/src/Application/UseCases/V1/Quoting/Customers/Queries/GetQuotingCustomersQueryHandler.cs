namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Customers.Queries;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Quoting.Customers;
using TemplateLandingPage.Domain.Repositories.Quoting;

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
