namespace OnePortal.Domain.Entities.PhotoPrint;

using OnePortal.Domain.Abstractions;

public sealed class PhotoOrder : AggregateRoot<Guid>
{
    public PhotoOrder() => Id = Guid.NewGuid();

    public string OrderCode { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; }
    public string? DeliveryAddress { get; set; }
    public string DeliveryMethod { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public decimal SubTotal { get; set; }
    public decimal DiscountTotal { get; set; }
    public decimal GrandTotal { get; set; }
    public int TotalPhotoCount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? AdminNote { get; set; }
    public int Revision { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
    public List<PhotoOrderItem> Items { get; } = [];
}
