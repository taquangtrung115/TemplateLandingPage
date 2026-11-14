namespace OnePortal.Domain.Entities.Quoting;

using OnePortal.Domain.Abstractions;

public sealed class QuotationHistory : TenantEntity<Guid>
{
    public Guid QuotationId { get; private set; }
    public string Action { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string? SnapshotData { get; private set; }
    public Guid CreatedByUserId { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }

    private QuotationHistory()
    {
    }

    private QuotationHistory(
        Guid id,
        Guid quotationId,
        string action,
        string description,
        string? snapshotData,
        Guid createdByUserId)
    {
        Id = id;
        QuotationId = quotationId;
        Action = action;
        Description = description;
        SnapshotData = snapshotData;
        CreatedByUserId = createdByUserId;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public static QuotationHistory Create(
        Guid quotationId,
        string action,
        string description,
        string? snapshotData,
        Guid createdByUserId)
    {
        return new QuotationHistory(
            Guid.NewGuid(),
            quotationId,
            action,
            description,
            snapshotData,
            createdByUserId);
    }
}
