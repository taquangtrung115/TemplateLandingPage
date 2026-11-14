namespace OnePortal.Contract.Services.V1.Interactions;

using OnePortal.Contract.Abstractions.Shared;

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
    string SenderName,
    string Message,
    DateTime CreatedAtUtc);

public static class InteractionErrors
{
    public static readonly Error VersionRequired = new("Interaction.VersionRequired", "CustomizationVersionId is required.");
    public static readonly Error VersionUnavailable = new("Interaction.VersionUnavailable", "The requested published version is unavailable.");
    public static readonly Error FeatureDisabled = new("Interaction.FeatureDisabled", "This response form is not available.");
    public static readonly Error CustomizationMismatch = new("Interaction.CustomizationMismatch", "The version does not belong to the requested page.");
    public static readonly Error NotFound = new("Interaction.NotFound", "The requested interaction data was not found.");
    public static readonly Error AccessDenied = new("Interaction.AccessDenied", "You do not have access to this interaction data.");
}
