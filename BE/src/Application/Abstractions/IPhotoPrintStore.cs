namespace OnePortal.Application.Abstractions;

using OnePortal.Contract.Services.V1.PhotoPrint;
using OnePortal.Contract.Services.V1.PhotoPrint.Products;
using OnePortal.Contract.Services.V1.PhotoPrint.Demos;
using OnePortal.Contract.Services.V1.PhotoPrint.Orders;
using OnePortal.Contract.Services.V1.PhotoPrint.Support;
using OnePortal.Contract.Services.V1.PhotoPrint.Contact;
using OnePortal.Contract.Abstractions.Shared;

public interface IPhotoPrintStore
{
    Task<Result<object>> GetCategoriesAsync(bool includeInactive, CancellationToken cancellationToken);
    Task<Result<object>> SearchProductsAsync(PhotoCatalogFilter filter, CancellationToken cancellationToken);
    Task<Result<object>> GetProductAsync(string slug, CancellationToken cancellationToken);
    Task<Result<object>> SaveCategoryAsync(Guid? id, PhotoCategoryInput input, CancellationToken cancellationToken);
    Task<Result<object>> DeleteCategoryAsync(Guid id, CancellationToken cancellationToken);
    Task<Result<object>> SaveProductAsync(Guid? id, PhotoProductInput input, CancellationToken cancellationToken);
    Task<Result<object>> DeleteProductAsync(Guid id, CancellationToken cancellationToken);
    Task<Result<object>> GetDemosAsync(string? model3DType, string? search, bool includeInactive, int page, int pageSize, CancellationToken cancellationToken);
    Task<Result<object>> SaveDemoAsync(Guid? id, PhotoDemoInput input, CancellationToken cancellationToken);
    Task<Result<object>> DeleteDemoAsync(Guid id, CancellationToken cancellationToken);
    Task<Result<object>> GetOrdersAsync(PhotoQueueFilter filter, CancellationToken cancellationToken);
    Task<Result<object>> GetOrderStatusAsync(string code, string phone, CancellationToken cancellationToken);
    Task<Result<object>> CreateOrderAsync(PhotoOrderInput input, CancellationToken cancellationToken);
    Task<Result<object>> SetOrderStatusAsync(Guid id, PhotoStatusInput input, CancellationToken cancellationToken);
    Task<Result<object>> GetSupportRequestsAsync(PhotoQueueFilter filter, CancellationToken cancellationToken);
    Task<Result<object>> GetSupportStatusAsync(string code, string contact, CancellationToken cancellationToken);
    Task<Result<object>> CreateSupportRequestAsync(PhotoSupportInput input, CancellationToken cancellationToken);
    Task<Result<object>> SetSupportStatusAsync(Guid id, PhotoStatusInput input, CancellationToken cancellationToken);
    Task<Result<object>> GetContactConfigAsync(CancellationToken cancellationToken);
    Task<Result<object>> SaveContactConfigAsync(PhotoContactInput input, CancellationToken cancellationToken);
}
