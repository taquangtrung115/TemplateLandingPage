namespace OnePortal.Contract.Services.V1.PhotoPrint.Orders;

using OnePortal.Contract.Abstractions.Message;

public sealed record CreateOrderCommand(PhotoOrderInput Input) : ICommand<object>;

public sealed record SetOrderStatusCommand(Guid Id, PhotoStatusInput Input) : ICommand<object>;
