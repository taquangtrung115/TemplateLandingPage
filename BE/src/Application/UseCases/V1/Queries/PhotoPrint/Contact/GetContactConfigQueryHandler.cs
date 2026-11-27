namespace OnePortal.Application.UseCases.V1.Queries.PhotoPrint.Contact;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.PhotoPrint.Contact;

public sealed class GetContactConfigQueryHandler(IPhotoPrintStore store) : IQueryHandler<GetContactConfigQuery, object>
{
    private readonly IPhotoPrintStore _store = store;

    public Task<Result<object>> Handle(GetContactConfigQuery request, CancellationToken cancellationToken) =>
        _store.GetContactConfigAsync(cancellationToken);
}
