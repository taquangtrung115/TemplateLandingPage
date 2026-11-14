namespace OnePortal.Contract.Services.V1.Quoting.Products;

public record QuotingProductResponse(
    Guid Id,
    string Code,
    string Name,
    string? Description,
    string Unit,
    decimal Price,
    string? ImageUrl,
    string? Category,
    bool IsActive,
    DateTime CreatedAtUtc,
    DateTime? ModifiedAtUtc, Guid? GroupId = null, int GroupSortOrder = 0);
