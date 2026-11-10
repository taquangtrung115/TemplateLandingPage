namespace TemplateLandingPage.Domain.Entities.Quoting;

using TemplateLandingPage.Domain.Abstractions;

public sealed class QuotationItem : Entity<Guid>
{
    public Guid QuotationId { get; private set; }
    public Guid? ProductId { get; private set; }
    public string? ProductCode { get; private set; }
    public string ProductName { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string Unit { get; private set; } = "Cái";
    public string? ImageUrl { get; private set; }
    public string? ItemGroup { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal DiscountPercent { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public decimal TotalAmount { get; private set; }
    public string? Notes { get; private set; }
    public int SortOrder { get; private set; }
    public int GroupSortOrder { get; private set; }

    private QuotationItem()
    {
    }

    private QuotationItem(
        Guid id,
        Guid quotationId,
        Guid? productId,
        string? productCode,
        string productName,
        string? description,
        string unit,
        string? imageUrl,
        string? itemGroup,
        decimal quantity,
        decimal unitPrice,
        decimal discountPercent,
        string? notes,
        int sortOrder)
    {
        Id = id;
        QuotationId = quotationId;
        ProductId = productId;
        ProductCode = productCode;
        ProductName = productName;
        Description = description;
        Unit = string.IsNullOrWhiteSpace(unit) ? "Cái" : unit.Trim();
        ImageUrl = imageUrl;
        ItemGroup = itemGroup;
        Quantity = quantity;
        UnitPrice = unitPrice;
        DiscountPercent = discountPercent;
        Notes = notes;
        SortOrder = sortOrder;

        CalculateTotal();
    }

    public static QuotationItem Create(
        Guid quotationId,
        Guid? productId,
        string? productCode,
        string productName,
        string? description,
        string unit,
        string? imageUrl,
        string? itemGroup,
        decimal quantity,
        decimal unitPrice,
        decimal discountPercent,
        string? notes,
        int sortOrder, int groupSortOrder = 0)
    {
        if (string.IsNullOrWhiteSpace(productName))
        {
            throw new ArgumentException("Product name cannot be empty.", nameof(productName));
        }

        if (quantity <= 0)
        {
            throw new ArgumentException("Quantity must be greater than zero.", nameof(quantity));
        }

        if (unitPrice < 0)
        {
            throw new ArgumentException("Unit price cannot be negative.", nameof(unitPrice));
        }

        if (discountPercent < 0 || discountPercent > 100)
        {
            throw new ArgumentException("Discount percent must be between 0 and 100.", nameof(discountPercent));
        }

        var item = new QuotationItem(
            Guid.NewGuid(),
            quotationId,
            productId,
            productCode?.Trim(),
            productName.Trim(),
            description?.Trim(),
            unit,
            imageUrl?.Trim(),
            itemGroup?.Trim(),
            quantity,
            unitPrice,
            discountPercent,
            notes?.Trim(),
            sortOrder);
        item.GroupSortOrder = groupSortOrder;
        return item;
    }

    public void UpdateValues(
        string productName,
        string? description,
        string unit,
        string? imageUrl,
        string? itemGroup,
        decimal quantity,
        decimal unitPrice,
        decimal discountPercent,
        string? notes,
        int sortOrder)
    {
        if (string.IsNullOrWhiteSpace(productName))
        {
            throw new ArgumentException("Product name cannot be empty.", nameof(productName));
        }

        if (quantity <= 0)
        {
            throw new ArgumentException("Quantity must be greater than zero.", nameof(quantity));
        }

        if (unitPrice < 0)
        {
            throw new ArgumentException("Unit price cannot be negative.", nameof(unitPrice));
        }

        if (discountPercent < 0 || discountPercent > 100)
        {
            throw new ArgumentException("Discount percent must be between 0 and 100.", nameof(discountPercent));
        }

        ProductName = productName.Trim();
        Description = description?.Trim();
        Unit = string.IsNullOrWhiteSpace(unit) ? "Cái" : unit.Trim();
        ImageUrl = imageUrl?.Trim();
        ItemGroup = itemGroup?.Trim();
        Quantity = quantity;
        UnitPrice = unitPrice;
        DiscountPercent = discountPercent;
        Notes = notes?.Trim();
        SortOrder = sortOrder;

        CalculateTotal();
    }

    private void CalculateTotal()
    {
        var gross = Math.Round(Quantity * UnitPrice, 2, MidpointRounding.AwayFromZero);
        DiscountAmount = Math.Round(gross * (DiscountPercent / 100m), 2, MidpointRounding.AwayFromZero);
        TotalAmount = Math.Max(0, gross - DiscountAmount);
    }
}
