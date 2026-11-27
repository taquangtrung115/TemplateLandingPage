namespace OnePortal.Application.UseCases.V1.Commands.PhotoPrint.Contact;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.PhotoPrint.Contact;

public sealed class SaveContactConfigCommandHandler(IPhotoPrintStore store) : ICommandHandler<SaveContactConfigCommand, object>
{
    private readonly IPhotoPrintStore _store = store;

    public Task<Result<object>> Handle(SaveContactConfigCommand request, CancellationToken cancellationToken) =>
        _store.SaveContactConfigAsync(request.Input, cancellationToken);
}
