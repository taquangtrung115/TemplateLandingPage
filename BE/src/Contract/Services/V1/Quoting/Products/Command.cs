namespace OnePortal.Contract.Services.V1.Quoting.Products;

using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;

public static class QuotingProductErrors
{
    public static readonly Error NotFound = new("QuotingProduct.NotFound", "Sản phẩm không tồn tại trong danh mục.");
    public static readonly Error DuplicateCode = new("QuotingProduct.DuplicateCode", "Mã sản phẩm đã tồn tại trên hệ thống.");
    public static readonly Error InvalidPrice = new("QuotingProduct.InvalidPrice", "Đơn giá sản phẩm không được là số âm.");
}

public record CreateQuotingProductCommand(
    string Code,
    string Name,
    string? Description,
    string Unit,
    decimal Price,
    string? ImageUrl,
    string? Category,
    bool IsActive = true, Guid? GroupId = null) : ICommand<Guid>;

public record UpdateQuotingProductCommand(
    Guid Id,
    string Code,
    string Name,
    string? Description,
    string Unit,
    decimal Price,
    string? ImageUrl,
    string? Category,
    bool IsActive, Guid? GroupId = null) : ICommand;

public record DeleteQuotingProductCommand(Guid Id) : ICommand;
