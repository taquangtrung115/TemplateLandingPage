namespace OnePortal.Presentation.APIs.Quoting;
public sealed record ChangeQuotingSupportStatusRequest(string Status, int ExpectedRevision);
