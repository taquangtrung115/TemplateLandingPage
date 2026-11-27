namespace OnePortal.Application.UseCases.V1.Queries.PhotoPrint.Products;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.PhotoPrint.Products;

public sealed class GetProductQueryHandler(IPhotoPrintStore store) : IQueryHandler<GetProductQuery, object>
{
    private readonly IPhotoPrintStore _store = store;

    public Task<Result<object>> Handle(GetProductQuery request, CancellationToken cancellationToken) =>
        _store.GetProductAsync(request.Slug, cancellationToken);
}
