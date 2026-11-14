namespace OnePortal.Contract.Services.V1.Categories;

using OnePortal.Contract.Abstractions.Message;

public record CreateCategoryCommand(
    string Name,
    string Slug,
    string? Description,
    string? Icon,
    int OrderIndex,
    bool IsActive = true) : ICommand<Guid>;

public record UpdateCategoryCommand(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string? Icon,
    int OrderIndex,
    bool IsActive) : ICommand;

public record DeleteCategoryCommand(Guid Id) : ICommand;
