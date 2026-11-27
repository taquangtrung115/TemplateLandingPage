namespace OnePortal.Application.UseCases.V1.Commands.PhotoPrint.Products;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.PhotoPrint.Products;

public sealed class SaveProductCommandHandler(IPhotoPrintStore store) : ICommandHandler<SaveProductCommand, object>
{
    private readonly IPhotoPrintStore _store = store;

    public Task<Result<object>> Handle(SaveProductCommand request, CancellationToken cancellationToken) =>
        _store.SaveProductAsync(request.Id, request.Input, cancellationToken);
}
