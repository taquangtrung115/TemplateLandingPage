namespace OnePortal.Application.UseCases.V1.Queries.PhotoPrint.Support;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.PhotoPrint.Support;

public sealed class GetSupportStatusQueryHandler(IPhotoPrintStore store) : IQueryHandler<GetSupportStatusQuery, object>
{
    private readonly IPhotoPrintStore _store = store;

    public Task<Result<object>> Handle(GetSupportStatusQuery request, CancellationToken cancellationToken) =>
        _store.GetSupportStatusAsync(request.Code, request.Contact, cancellationToken);
}
