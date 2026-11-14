namespace OnePortal.Presentation.APIs.Customizations;
public sealed record CreateVersionRequest(string Title, string Slug, string ConfigJson, int ExpectedRevision, Guid RequestId);
