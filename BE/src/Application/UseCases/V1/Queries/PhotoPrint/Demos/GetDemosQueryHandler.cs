namespace OnePortal.Application.UseCases.V1.Queries.PhotoPrint.Demos;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.PhotoPrint.Demos;

public sealed class GetDemosQueryHandler(IPhotoPrintStore store) : IQueryHandler<GetDemosQuery, object>
{
    private readonly IPhotoPrintStore _store = store;

    public Task<Result<object>> Handle(GetDemosQuery request, CancellationToken cancellationToken) =>
        _store.GetDemosAsync(request.Model3DType, request.Search, request.IncludeInactive, request.Page, request.PageSize, cancellationToken);
}
