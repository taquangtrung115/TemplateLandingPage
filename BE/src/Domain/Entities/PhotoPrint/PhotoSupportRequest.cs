namespace OnePortal.Domain.Entities.PhotoPrint;

using OnePortal.Domain.Abstractions;

public sealed class PhotoSupportRequest : AggregateRoot<Guid>
{
    public PhotoSupportRequest() => Id = Guid.NewGuid();

    public string TicketCode { get; set; } = string.Empty;
    public Guid? CreatedByUserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string Topic { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string? OrderCode { get; set; }
    public string? AttachmentUrl { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? AdminNote { get; set; }
    public int Revision { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
    public DateTime? ResolvedAtUtc { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public Guid? ResolvedByUserId { get; set; }
}
