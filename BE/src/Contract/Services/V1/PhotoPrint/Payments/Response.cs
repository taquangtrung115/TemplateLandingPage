namespace OnePortal.Contract.Services.V1.PhotoPrint.Payments;

public sealed record ConfirmVietQrPaymentInput(string OrderCode, string CustomerPhone, string BankCode, string BankAccountNumber, decimal Amount,
    string TransferMemo, string? Note);

public sealed record VerifyPhotoPaymentInput(string Status, string? StaffNote, int ExpectedRevision);

public sealed record PhotoPaymentFilter(string? Search, string? Status, int Page = 1, int PageSize = 20);
