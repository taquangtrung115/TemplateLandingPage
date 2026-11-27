namespace OnePortal.Application.UseCases.V1.Queries.PhotoPrint.Orders;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.PhotoPrint.Orders;

public sealed class GetOrderStatusQueryHandler(IPhotoPrintStore store) : IQueryHandler<GetOrderStatusQuery, object>
{
    private readonly IPhotoPrintStore _store = store;

    public Task<Result<object>> Handle(GetOrderStatusQuery request, CancellationToken cancellationToken) =>
        _store.GetOrderStatusAsync(request.Code, request.Phone, cancellationToken);
}
