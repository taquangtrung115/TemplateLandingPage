namespace OnePortal.Application.UseCases.V1.Commands.PhotoPrint.Orders;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.PhotoPrint.Orders;

public sealed class SetOrderStatusCommandHandler(IPhotoPrintStore store) : ICommandHandler<SetOrderStatusCommand, object>
{
    private readonly IPhotoPrintStore _store = store;

    public Task<Result<object>> Handle(SetOrderStatusCommand request, CancellationToken cancellationToken) =>
        _store.SetOrderStatusAsync(request.Id, request.Input, cancellationToken);
}
