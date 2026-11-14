namespace OnePortal.Domain.Entities;

using OnePortal.Domain.Abstractions;

public sealed class Product : AggregateRoot<Guid>, IAuditableEntity, ISoftDelete
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public decimal Price { get; private set; }
    public bool IsActive { get; private set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? ModifiedAtUtc { get; set; }

    private Product()
    {
        // Required by EF Core
    }

    private Product(Guid id, string name, string? description, decimal price, bool isActive)
    {
        Id = id;
        Name = name;
        Description = description;
        Price = price;
        IsActive = isActive;
        IsDeleted = false;
        DeletedAtUtc = null;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public static Product Create(string name, string? description, decimal price)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Product name cannot be empty.", nameof(name));
        }

        if (price <= 0)
        {
            throw new ArgumentException("Product price must be greater than zero.", nameof(price));
        }

        return new Product(Guid.NewGuid(), name.Trim(), description?.Trim(), price, true);
    }

    public void Update(string name, string? description, decimal price, bool isActive)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Product name cannot be empty.", nameof(name));
        }

        if (price <= 0)
        {
            throw new ArgumentException("Product price must be greater than zero.", nameof(price));
        }

        Name = name.Trim();
        Description = description?.Trim();
        Price = price;
        IsActive = isActive;
        ModifiedAtUtc = DateTime.UtcNow;
    }

    public void Delete()
    {
        IsDeleted = true;
        DeletedAtUtc = DateTime.UtcNow;
    }
}
