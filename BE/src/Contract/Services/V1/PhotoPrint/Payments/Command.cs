namespace OnePortal.Contract.Services.V1.PhotoPrint.Payments;

using OnePortal.Contract.Abstractions.Message;

public sealed record ConfirmVietQrPaymentCommand(ConfirmVietQrPaymentInput Input) : ICommand<object>;
public sealed record VerifyPhotoPaymentCommand(Guid Id, VerifyPhotoPaymentInput Input) : ICommand<object>;
