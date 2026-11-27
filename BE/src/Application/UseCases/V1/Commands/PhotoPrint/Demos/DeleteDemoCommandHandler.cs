namespace OnePortal.Application.UseCases.V1.Commands.PhotoPrint.Demos;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.PhotoPrint.Demos;

public sealed class DeleteDemoCommandHandler(IPhotoPrintStore store) : ICommandHandler<DeleteDemoCommand, object>
{
    private readonly IPhotoPrintStore _store = store;

    public Task<Result<object>> Handle(DeleteDemoCommand request, CancellationToken cancellationToken) =>
        _store.DeleteDemoAsync(request.Id, cancellationToken);
}
