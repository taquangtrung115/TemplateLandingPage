namespace OnePortal.Contract.Services.V1.PhotoPrint.Demos;

using OnePortal.Contract.Abstractions.Message;

public sealed record SaveDemoCommand(Guid? Id, PhotoDemoInput Input) : ICommand<object>;

public sealed record DeleteDemoCommand(Guid Id) : ICommand<object>;
