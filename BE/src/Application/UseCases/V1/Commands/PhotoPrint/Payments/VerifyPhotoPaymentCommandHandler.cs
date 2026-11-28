namespace OnePortal.Application.UseCases.V1.Commands.PhotoPrint.Payments;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.PhotoPrint.Payments;

public sealed class VerifyPhotoPaymentCommandHandler(IPhotoPrintStore store) : ICommandHandler<VerifyPhotoPaymentCommand, object>
{
    private readonly IPhotoPrintStore _store = store;
    public Task<Result<object>> Handle(VerifyPhotoPaymentCommand request, CancellationToken cancellationToken) =>
        _store.VerifyPaymentAsync(request.Id, request.Input, cancellationToken);
}
