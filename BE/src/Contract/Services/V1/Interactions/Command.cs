namespace TemplateLandingPage.Contract.Services.V1.Interactions;

using TemplateLandingPage.Contract.Abstractions.Message;

public record SubmitRsvpCommand(
    Guid? CustomizationVersionId,
    Guid? CustomizationId,
    string GuestName,
    string? Email,
    string? Phone,
    string AttendingStatus,
    int NumberOfGuests,
    string? DietaryNotes,
    string? Wishes) : ICommand<Guid>;

public record SubmitGuestbookCommand(
    Guid? CustomizationVersionId,
    Guid? CustomizationId,
    string SenderName,
    string Message) : ICommand<Guid>;
