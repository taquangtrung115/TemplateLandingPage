namespace OnePortal.Application.UseCases.V1.Commands.PhotoPrint.Products;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.PhotoPrint.Products;

public sealed class SaveCategoryCommandHandler(IPhotoPrintStore store) : ICommandHandler<SaveCategoryCommand, object>
{
    private readonly IPhotoPrintStore _store = store;

    public Task<Result<object>> Handle(SaveCategoryCommand request, CancellationToken cancellationToken) =>
        _store.SaveCategoryAsync(request.Id, request.Input, cancellationToken);
}
