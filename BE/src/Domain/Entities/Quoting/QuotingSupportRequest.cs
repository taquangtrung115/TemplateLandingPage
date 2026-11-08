namespace TemplateLandingPage.Domain.Entities.Quoting;

using TemplateLandingPage.Domain.Abstractions;

public sealed class QuotingSupportRequest : Entity<Guid>
{
    public Guid CreatedByUserId { get; private set; }
    public string FullName { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string? Phone { get; private set; }
    public string Topic { get; private set; } = string.Empty;
    public string Priority { get; private set; } = string.Empty;
    public string Message { get; private set; } = string.Empty;
    public DateTime CreatedAtUtc { get; private set; }

    public QuotingSupportStatus Status { get; private set; } = QuotingSupportStatus.New;
    public int Revision { get; private set; }
    public DateTime? UpdatedAtUtc { get; private set; }
    public Guid? UpdatedByUserId { get; private set; }
    public DateTime? ResolvedAtUtc { get; private set; }
    public Guid? ResolvedByUserId { get; private set; }

    public void ChangeStatus(QuotingSupportStatus status, Guid userId)
    {
        if (!Enum.IsDefined(status)) throw new ArgumentOutOfRangeException(nameof(status));
        if (userId == Guid.Empty) throw new ArgumentException("A processing user is required.", nameof(userId));
        if (status == Status) return;
        var now = DateTime.UtcNow;
        Status = status;
        Revision++;
        UpdatedAtUtc = now;
        UpdatedByUserId = userId;
        ResolvedAtUtc = status == QuotingSupportStatus.Resolved ? now : null;
        ResolvedByUserId = status == QuotingSupportStatus.Resolved ? userId : null;
    }

    private QuotingSupportRequest() { }

    public static QuotingSupportRequest Create(Guid userId, string fullName, string email, string? phone, string topic, string priority, string message) => new()
    {
        Id = Guid.NewGuid(), CreatedByUserId = userId, FullName = fullName.Trim(), Email = email.Trim(), Phone = phone?.Trim(),
        Topic = topic.Trim(), Priority = priority, Message = message.Trim(), CreatedAtUtc = DateTime.UtcNow,
    };
}
