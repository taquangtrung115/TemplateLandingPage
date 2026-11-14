namespace OnePortal.Contract.Services.V1.Quoting.Customers;

public record QuotingCustomerResponse(
    Guid Id,
    string Name,
    string? ContactPerson,
    string Phone,
    string? Email,
    string? Address,
    string? TaxCode,
    string? Notes,
    bool IsActive,
    DateTime CreatedAtUtc,
    DateTime? ModifiedAtUtc);
