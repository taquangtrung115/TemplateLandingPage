namespace OnePortal.Application.UseCases.V1.Queries.PhotoPrint.Payments;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.PhotoPrint.Payments;

public sealed class GetPhotoPaymentsQueryHandler(IPhotoPrintStore store) : IQueryHandler<GetPhotoPaymentsQuery, object>
{
    private readonly IPhotoPrintStore _store = store;
    public Task<Result<object>> Handle(GetPhotoPaymentsQuery request, CancellationToken cancellationToken) =>
        _store.GetPaymentsAsync(request.Filter, cancellationToken);
}
