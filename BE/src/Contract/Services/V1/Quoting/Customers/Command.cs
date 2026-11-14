namespace OnePortal.Contract.Services.V1.Quoting.Customers;

using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;

public static class QuotingCustomerErrors
{
    public static readonly Error NotFound = new("QuotingCustomer.NotFound", "Khách hàng không tồn tại trong hệ thống.");
}

public record CreateQuotingCustomerCommand(
    string Name,
    string? ContactPerson,
    string Phone,
    string? Email,
    string? Address,
    string? TaxCode,
    string? Notes) : ICommand<Guid>;

public record UpdateQuotingCustomerCommand(
    Guid Id,
    string Name,
    string? ContactPerson,
    string Phone,
    string? Email,
    string? Address,
    string? TaxCode,
    string? Notes,
    bool IsActive) : ICommand;

public record DeleteQuotingCustomerCommand(Guid Id) : ICommand;
