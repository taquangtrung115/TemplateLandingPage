namespace OnePortal.Contract.Services.V1.Quoting.Support;

using OnePortal.Contract.Abstractions.Message;

public sealed record SearchQuotingSupportQuery(string Status = "New", string? SearchTerm = null, string? Priority = null, int Page = 1, int PageSize = 20) : IQuery<SearchQuotingSupportResult>;
