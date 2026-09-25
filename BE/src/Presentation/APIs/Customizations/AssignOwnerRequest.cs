namespace TemplateLandingPage.Presentation.APIs.Customizations;
public sealed record AssignOwnerRequest(Guid UserId, int ExpectedRevision);
