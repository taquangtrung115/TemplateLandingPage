namespace TemplateLandingPage.Contract.Services.V1.Products;

using TemplateLandingPage.Contract.Abstractions.Message;
using TemplateLandingPage.Contract.Abstractions.Shared;

public static class ProductErrors
{
    public static readonly Error NotFound = new("Product.NotFound", "Product was not found.");
    public static readonly Error DuplicateName = new("Product.DuplicateName", "A product with the same name already exists.");
    public static readonly Error InvalidPrice = new("Product.InvalidPrice", "Product price must be greater than zero.");
}

public record CreateProductCommand(string Name, string? Description, decimal Price) : ICommand<Guid>;

public record UpdateProductCommand(Guid Id, string Name, string? Description, decimal Price, bool IsActive) : ICommand;

public record DeleteProductCommand(Guid Id) : ICommand;
