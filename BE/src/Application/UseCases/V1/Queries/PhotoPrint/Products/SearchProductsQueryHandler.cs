namespace OnePortal.Application.UseCases.V1.Queries.PhotoPrint.Products;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.PhotoPrint.Products;

public sealed class SearchProductsQueryHandler(IPhotoPrintStore store) : IQueryHandler<SearchProductsQuery, object>
{
    private readonly IPhotoPrintStore _store = store;

    public Task<Result<object>> Handle(SearchProductsQuery request, CancellationToken cancellationToken) =>
        _store.SearchProductsAsync(request.Filter, cancellationToken);
}
