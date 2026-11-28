namespace OnePortal.Contract.Services.V1.PhotoPrint.Payments;

using OnePortal.Contract.Abstractions.Message;

public sealed record GetPhotoPaymentsQuery(PhotoPaymentFilter Filter) : IQuery<object>;
