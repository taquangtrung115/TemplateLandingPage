namespace OnePortal.Contract.Services.V1.PhotoPrint.Contact;

using OnePortal.Contract.Abstractions.Message;

public sealed record SaveContactConfigCommand(PhotoContactInput Input) : ICommand<object>;
