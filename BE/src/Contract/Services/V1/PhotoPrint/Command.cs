namespace OnePortal.Contract.Services.V1.PhotoPrint;

public sealed record PhotoStatusInput(string Status, int ExpectedRevision, string? AdminNote);
