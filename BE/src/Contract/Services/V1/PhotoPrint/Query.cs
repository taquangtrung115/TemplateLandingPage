namespace OnePortal.Contract.Services.V1.PhotoPrint;

public sealed record PhotoQueueFilter(string? Search, string? Status, string? Priority, int Page, int PageSize);
