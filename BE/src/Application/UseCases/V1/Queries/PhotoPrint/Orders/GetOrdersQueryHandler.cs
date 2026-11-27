namespace OnePortal.Application.UseCases.V1.Queries.PhotoPrint.Orders;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.PhotoPrint.Orders;

public sealed class GetOrdersQueryHandler(IPhotoPrintStore store) : IQueryHandler<GetOrdersQuery, object>
{
    private readonly IPhotoPrintStore _store = store;

    public Task<Result<object>> Handle(GetOrdersQuery request, CancellationToken cancellationToken) =>
        _store.GetOrdersAsync(request.Filter, cancellationToken);
}
