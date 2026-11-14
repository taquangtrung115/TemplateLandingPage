namespace OnePortal.Domain.Entities;

using OnePortal.Domain.Abstractions;

public sealed class GuestbookEntry : TenantEntity<Guid>
{
    public Guid? CustomizationId { get; private set; }
    public Guid? CustomizationVersionId { get; private set; }
    public string SenderName { get; private set; } = string.Empty;
    public string Message { get; private set; } = string.Empty;
    public DateTime CreatedAtUtc { get; private set; }

    private GuestbookEntry()
    {
    }

    private GuestbookEntry(Guid id, Guid? customizationId, Guid? customizationVersionId, string senderName, string message)
    {
        Id = id;
        CustomizationId = customizationId;
        CustomizationVersionId = customizationVersionId;
        SenderName = senderName;
        Message = message;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public static GuestbookEntry Create(Guid? customizationId, string senderName, string message)
    {
        return CreateCore(customizationId, null, senderName, message);
    }

    public static GuestbookEntry Create(Guid customizationVersionId, Guid? customizationId, string senderName, string message)
    {
        return CreateCore(customizationId, customizationVersionId, senderName, message);
    }

    private static GuestbookEntry CreateCore(Guid? customizationId, Guid? customizationVersionId, string senderName, string message)
    {
        if (string.IsNullOrWhiteSpace(senderName))
            throw new ArgumentException("Sender name cannot be empty.", nameof(senderName));
        if (string.IsNullOrWhiteSpace(message))
            throw new ArgumentException("Message cannot be empty.", nameof(message));

        return new GuestbookEntry(Guid.NewGuid(), customizationId, customizationVersionId, senderName.Trim(), message.Trim());
    }
}
