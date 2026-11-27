namespace OnePortal.Application.UseCases.V1.Queries.PhotoPrint.Products;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.PhotoPrint.Products;

public sealed class GetCategoriesQueryHandler(IPhotoPrintStore store) : IQueryHandler<GetCategoriesQuery, object>
{
    private readonly IPhotoPrintStore _store = store;

    public Task<Result<object>> Handle(GetCategoriesQuery request, CancellationToken cancellationToken) =>
        _store.GetCategoriesAsync(request.IncludeInactive, cancellationToken);
}
