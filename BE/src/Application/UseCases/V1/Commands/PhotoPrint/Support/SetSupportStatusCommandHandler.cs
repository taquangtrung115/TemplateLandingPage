namespace OnePortal.Application.UseCases.V1.Commands.PhotoPrint.Support;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.PhotoPrint.Support;

public sealed class SetSupportStatusCommandHandler(IPhotoPrintStore store) : ICommandHandler<SetSupportStatusCommand, object>
{
    private readonly IPhotoPrintStore _store = store;

    public Task<Result<object>> Handle(SetSupportStatusCommand request, CancellationToken cancellationToken) =>
        _store.SetSupportStatusAsync(request.Id, request.Input, cancellationToken);
}
