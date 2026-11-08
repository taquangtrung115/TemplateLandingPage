namespace TemplateLandingPage.Presentation.APIs.Quoting;

public sealed record SubmitQuotingSupportRequest(string FullName, string Email, string? Phone, string Topic, string Priority, string Message);
