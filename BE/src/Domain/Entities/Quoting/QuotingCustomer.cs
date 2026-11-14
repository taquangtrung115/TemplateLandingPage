namespace OnePortal.Domain.Entities.Quoting;

using OnePortal.Domain.Abstractions;

public sealed class QuotingCustomer : AggregateRoot<Guid>, IAuditableEntity, ISoftDelete
{
    public string Name { get; private set; } = string.Empty;
    public string? ContactPerson { get; private set; }
    public string Phone { get; private set; } = string.Empty;
    public string? Email { get; private set; }
    public string? Address { get; private set; }
    public string? TaxCode { get; private set; }
    public string? Notes { get; private set; }
    public bool IsActive { get; private set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? ModifiedAtUtc { get; set; }

    private QuotingCustomer()
    {
    }

    private QuotingCustomer(
        Guid id,
        string name,
        string? contactPerson,
        string phone,
        string? email,
        string? address,
        string? taxCode,
        string? notes,
        bool isActive)
    {
        Id = id;
        Name = name;
        ContactPerson = contactPerson;
        Phone = phone;
        Email = email;
        Address = address;
        TaxCode = taxCode;
        Notes = notes;
        IsActive = isActive;
        IsDeleted = false;
        DeletedAtUtc = null;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public static QuotingCustomer Create(
        string name,
        string? contactPerson,
        string phone,
        string? email,
        string? address,
        string? taxCode,
        string? notes)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Customer name cannot be empty.", nameof(name));
        }

        if (string.IsNullOrWhiteSpace(phone))
        {
            throw new ArgumentException("Customer phone cannot be empty.", nameof(phone));
        }

        return new QuotingCustomer(
            Guid.NewGuid(),
            name.Trim(),
            contactPerson?.Trim(),
            phone.Trim(),
            email?.Trim(),
            address?.Trim(),
            taxCode?.Trim(),
            notes?.Trim(),
            true);
    }

    public void Update(
        string name,
        string? contactPerson,
        string phone,
        string? email,
        string? address,
        string? taxCode,
        string? notes,
        bool isActive)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Customer name cannot be empty.", nameof(name));
        }

        if (string.IsNullOrWhiteSpace(phone))
        {
            throw new ArgumentException("Customer phone cannot be empty.", nameof(phone));
        }

        Name = name.Trim();
        ContactPerson = contactPerson?.Trim();
        Phone = phone.Trim();
        Email = email?.Trim();
        Address = address?.Trim();
        TaxCode = taxCode?.Trim();
        Notes = notes?.Trim();
        IsActive = isActive;
        ModifiedAtUtc = DateTime.UtcNow;
    }

    public void Delete()
    {
        IsDeleted = true;
        DeletedAtUtc = DateTime.UtcNow;
    }
}
