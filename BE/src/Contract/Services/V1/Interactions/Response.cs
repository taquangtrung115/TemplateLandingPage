namespace TemplateLandingPage.Contract.Services.V1.Interactions;

public record RsvpResponse(
    Guid Id,
    Guid? CustomizationId,
    string GuestName,
    string? Email,
    string? Phone,
    string AttendingStatus,
    int NumberOfGuests,
    string? DietaryNotes,
    string? Wishes,
    DateTime CreatedAtUtc);

public record GuestbookResponse(
    Guid Id,
    Guid? CustomizationId,
    string SenderName,
    string Message,
    DateTime CreatedAtUtc);
