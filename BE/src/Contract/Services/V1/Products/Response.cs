namespace OnePortal.Contract.Services.V1.Products;

public record ProductResponse(
    Guid Id,
    string Name,
    string? Description,
    decimal Price,
    bool IsActive,
    DateTime CreatedAtUtc);
