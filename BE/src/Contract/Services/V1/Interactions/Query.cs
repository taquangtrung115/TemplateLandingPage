namespace TemplateLandingPage.Contract.Services.V1.Interactions;

using TemplateLandingPage.Contract.Abstractions.Message;

public record GetRsvpsByCustomizationIdQuery(Guid CustomizationId) : IQuery<List<RsvpResponse>>;

public record GetGuestbookByCustomizationIdQuery(Guid CustomizationId) : IQuery<List<GuestbookResponse>>;
