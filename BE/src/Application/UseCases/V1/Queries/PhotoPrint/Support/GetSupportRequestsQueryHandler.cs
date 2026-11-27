namespace OnePortal.Application.UseCases.V1.Queries.PhotoPrint.Support;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.PhotoPrint.Support;

public sealed class GetSupportRequestsQueryHandler(IPhotoPrintStore store) : IQueryHandler<GetSupportRequestsQuery, object>
{
    private readonly IPhotoPrintStore _store = store;

    public Task<Result<object>> Handle(GetSupportRequestsQuery request, CancellationToken cancellationToken) =>
        _store.GetSupportRequestsAsync(request.Filter, cancellationToken);
}
