namespace OnePortal.Contract.Services.V1.PhotoPrint.Support;

using OnePortal.Contract.Abstractions.Message;

public sealed record CreateSupportRequestCommand(PhotoSupportInput Input) : ICommand<object>;

public sealed record SetSupportStatusCommand(Guid Id, PhotoStatusInput Input) : ICommand<object>;
