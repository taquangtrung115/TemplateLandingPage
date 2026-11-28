namespace OnePortal.Domain.Entities.PhotoPrint;

using OnePortal.Domain.Abstractions;

public sealed class PhotoPaymentTransaction : AggregateRoot<Guid>
{
    public PhotoPaymentTransaction() => Id = Guid.NewGuid();

    public Guid OrderId { get; set; }
    public PhotoOrder Order { get; set; } = null!;
    public string OrderCode { get; set; } = string.Empty;
    public string TransactionCode { get; set; } = string.Empty;
    public string BankCode { get; set; } = string.Empty;
    public string BankName { get; set; } = string.Empty;
    public string BankAccountNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string TransferMemo { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string? Note { get; set; }
    public string? StaffNote { get; set; }
    public string Status { get; set; } = "PendingVerify";
    public Guid? VerifiedByUserId { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? VerifiedAtUtc { get; set; }
    public int Revision { get; set; }
}
