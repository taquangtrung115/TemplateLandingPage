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

    private QuotingSupportRequest() { }

    public static QuotingSupportRequest Create(Guid userId, string fullName, string email, string? phone, string topic, string priority, string message) => new()
    {
        Id = Guid.NewGuid(), CreatedByUserId = userId, FullName = fullName.Trim(), Email = email.Trim(), Phone = phone?.Trim(),
        Topic = topic.Trim(), Priority = priority, Message = message.Trim(), CreatedAtUtc = DateTime.UtcNow,
    };
}
