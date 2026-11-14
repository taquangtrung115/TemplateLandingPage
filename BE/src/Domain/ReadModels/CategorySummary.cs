namespace OnePortal.Domain.ReadModels;

public sealed record CategorySummary(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string? Icon,
    int OrderIndex,
    bool IsActive,
    int TemplatesCount,
    DateTime CreatedAtUtc);
