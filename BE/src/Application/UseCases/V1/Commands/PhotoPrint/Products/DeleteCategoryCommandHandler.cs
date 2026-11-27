namespace OnePortal.Application.UseCases.V1.Commands.PhotoPrint.Products;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.PhotoPrint.Products;

public sealed class DeleteCategoryCommandHandler(IPhotoPrintStore store) : ICommandHandler<DeleteCategoryCommand, object>
{
    private readonly IPhotoPrintStore _store = store;

    public Task<Result<object>> Handle(DeleteCategoryCommand request, CancellationToken cancellationToken) =>
        _store.DeleteCategoryAsync(request.Id, cancellationToken);
}
