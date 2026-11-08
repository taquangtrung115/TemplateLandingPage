namespace TemplateLandingPage.Contract.Services.V1.Quoting.Customers;

using TemplateLandingPage.Contract.Abstractions.Message;

public record GetQuotingCustomersQuery(
    string? SearchTerm = null,
    bool IncludeInactive = false) : IQuery<List<QuotingCustomerResponse>>;

public record GetQuotingCustomerByIdQuery(Guid Id) : IQuery<QuotingCustomerResponse>;
