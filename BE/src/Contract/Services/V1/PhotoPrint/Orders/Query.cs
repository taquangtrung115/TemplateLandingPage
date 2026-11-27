namespace OnePortal.Contract.Services.V1.PhotoPrint.Orders;

using OnePortal.Contract.Abstractions.Message;

public sealed record GetOrdersQuery(PhotoQueueFilter Filter) : IQuery<object>;

public sealed record GetOrderStatusQuery(string Code, string Phone) : IQuery<object>;
