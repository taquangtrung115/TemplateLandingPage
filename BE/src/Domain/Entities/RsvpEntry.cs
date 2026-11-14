namespace OnePortal.Domain.Entities;

using OnePortal.Domain.Abstractions;

public sealed class RsvpEntry : TenantEntity<Guid>
{
    public Guid? CustomizationId { get; private set; }
    public Guid? CustomizationVersionId { get; private set; }
    public string GuestName { get; private set; } = string.Empty;
    public string? Email { get; private set; }
    public string? Phone { get; private set; }
    public string AttendingStatus { get; private set; } = "attending"; // "attending", "declined"
    public int NumberOfGuests { get; private set; } = 1;
    public string? DietaryNotes { get; private set; }
    public string? Wishes { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }

    private RsvpEntry()
    {
    }

    private RsvpEntry(
        Guid id,
        Guid? customizationId,
        Guid? customizationVersionId,
        string guestName,
        string? email,
        string? phone,
        string attendingStatus,
        int numberOfGuests,
        string? dietaryNotes,
        string? wishes)
    {
        Id = id;
        CustomizationId = customizationId;
        CustomizationVersionId = customizationVersionId;
        GuestName = guestName;
        Email = email;
        Phone = phone;
        AttendingStatus = attendingStatus;
        NumberOfGuests = numberOfGuests;
        DietaryNotes = dietaryNotes;
        Wishes = wishes;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public static RsvpEntry Create(
        Guid? customizationId,
        string guestName,
        string? email,
        string? phone,
        string attendingStatus,
        int numberOfGuests,
        string? dietaryNotes,
        string? wishes)
    {
        if (string.IsNullOrWhiteSpace(guestName))
            throw new ArgumentException("Guest name cannot be empty.", nameof(guestName));

        return CreateCore(customizationId, null, guestName, email, phone, attendingStatus, numberOfGuests, dietaryNotes, wishes);
    }

    public static RsvpEntry Create(
        Guid customizationVersionId,
        Guid? customizationId,
        string guestName,
        string? email,
        string? phone,
        string attendingStatus,
        int numberOfGuests,
        string? dietaryNotes,
        string? wishes)
    {
        return CreateCore(customizationId, customizationVersionId, guestName, email, phone, attendingStatus, numberOfGuests, dietaryNotes, wishes);
    }

    private static RsvpEntry CreateCore(
        Guid? customizationId,
        Guid? customizationVersionId,
        string guestName,
        string? email,
        string? phone,
        string attendingStatus,
        int numberOfGuests,
        string? dietaryNotes,
        string? wishes)
    {
        if (string.IsNullOrWhiteSpace(guestName))
            throw new ArgumentException("Guest name cannot be empty.", nameof(guestName));

        return new RsvpEntry(
            Guid.NewGuid(),
            customizationId,
            customizationVersionId,
            guestName.Trim(),
            email?.Trim(),
            phone?.Trim(),
            string.IsNullOrWhiteSpace(attendingStatus) ? "attending" : attendingStatus.Trim().ToLowerInvariant(),
            numberOfGuests < 1 ? 1 : numberOfGuests,
            dietaryNotes?.Trim(),
            wishes?.Trim());
    }
}
