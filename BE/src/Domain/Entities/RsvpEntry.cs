namespace TemplateLandingPage.Domain.Entities;

using TemplateLandingPage.Domain.Abstractions;

public sealed class RsvpEntry : Entity<Guid>
{
    public Guid? CustomizationId { get; private set; }
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

        return new RsvpEntry(
            Guid.NewGuid(),
            customizationId,
            guestName.Trim(),
            email?.Trim(),
            phone?.Trim(),
            string.IsNullOrWhiteSpace(attendingStatus) ? "attending" : attendingStatus.Trim().ToLowerInvariant(),
            numberOfGuests < 1 ? 1 : numberOfGuests,
            dietaryNotes?.Trim(),
            wishes?.Trim());
    }
}
