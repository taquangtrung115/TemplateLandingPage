namespace OnePortal.Application.UseCases.V1.Commands.PhotoPrint.Demos;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.PhotoPrint.Demos;

public sealed class SaveDemoCommandHandler(IPhotoPrintStore store) : ICommandHandler<SaveDemoCommand, object>
{
    private readonly IPhotoPrintStore _store = store;

    public Task<Result<object>> Handle(SaveDemoCommand request, CancellationToken cancellationToken) =>
        _store.SaveDemoAsync(request.Id, request.Input, cancellationToken);
}
