namespace OnePortal.Domain.Entities.Quoting;

using OnePortal.Domain.Abstractions;

public sealed class QuotingProduct : AggregateRoot<Guid>, IAuditableEntity, ISoftDelete
{
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string Unit { get; private set; } = "Cái";
    public decimal Price { get; private set; }
    public string? ImageUrl { get; private set; }
    public string? Category { get; private set; }
    public Guid? GroupId { get; private set; }
    public QuotingProductGroup? Group { get; private set; }
    public bool IsActive { get; private set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? ModifiedAtUtc { get; set; }

    private QuotingProduct()
    {
    }

    private QuotingProduct(
        Guid id,
        string code,
        string name,
        string? description,
        string unit,
        decimal price,
        string? imageUrl,
        string? category,
        bool isActive)
    {
        Id = id;
        Code = code;
        Name = name;
        Description = description;
        Unit = unit;
        Price = price;
        ImageUrl = imageUrl;
        Category = category;
        IsActive = isActive;
        IsDeleted = false;
        DeletedAtUtc = null;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public static QuotingProduct Create(
        string code,
        string name,
        string? description,
        string unit,
        decimal price,
        string? imageUrl,
        string? category,
        bool isActive = true)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            throw new ArgumentException("Product code cannot be empty.", nameof(code));
        }

        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Product name cannot be empty.", nameof(name));
        }

        if (price < 0)
        {
            throw new ArgumentException("Product price cannot be negative.", nameof(price));
        }

        return new QuotingProduct(
            Guid.NewGuid(),
            code.Trim().ToUpperInvariant(),
            name.Trim(),
            description?.Trim(),
            string.IsNullOrWhiteSpace(unit) ? "Cái" : unit.Trim(),
            price,
            imageUrl?.Trim(),
            category?.Trim(),
            isActive);
    }

    public void Update(
        string code,
        string name,
        string? description,
        string unit,
        decimal price,
        string? imageUrl,
        string? category,
        bool isActive)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            throw new ArgumentException("Product code cannot be empty.", nameof(code));
        }

        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Product name cannot be empty.", nameof(name));
        }

        if (price < 0)
        {
            throw new ArgumentException("Product price cannot be negative.", nameof(price));
        }

        Code = code.Trim().ToUpperInvariant();
        Name = name.Trim();
        Description = description?.Trim();
        Unit = string.IsNullOrWhiteSpace(unit) ? "Cái" : unit.Trim();
        Price = price;
        ImageUrl = imageUrl?.Trim();
        Category = category?.Trim();
        IsActive = isActive;
        ModifiedAtUtc = DateTime.UtcNow;
    }

    public void AssignGroup(QuotingProductGroup group, bool updateLegacyCategory = true)
    {
        GroupId = group.Id;
        if (updateLegacyCategory) Category = group.Name;
    }

    public void Delete()
    {
        IsDeleted = true;
        DeletedAtUtc = DateTime.UtcNow;
    }
}
