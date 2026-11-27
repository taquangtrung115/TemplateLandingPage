namespace OnePortal.Contract.Services.V1.PhotoPrint.Support;

using OnePortal.Contract.Abstractions.Message;

public sealed record GetSupportRequestsQuery(PhotoQueueFilter Filter) : IQuery<object>;

public sealed record GetSupportStatusQuery(string Code, string Contact) : IQuery<object>;
