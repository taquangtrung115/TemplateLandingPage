namespace OnePortal.Application.UseCases.V1.Commands.PhotoPrint.Products;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.PhotoPrint.Products;

public sealed class DeleteProductCommandHandler(IPhotoPrintStore store) : ICommandHandler<DeleteProductCommand, object>
{
    private readonly IPhotoPrintStore _store = store;

    public Task<Result<object>> Handle(DeleteProductCommand request, CancellationToken cancellationToken) =>
        _store.DeleteProductAsync(request.Id, cancellationToken);
}
