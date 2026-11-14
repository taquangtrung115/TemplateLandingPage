namespace OnePortal.Contract.Abstractions.Shared;

public sealed record PagedResponse<T>(IReadOnlyList<T> Data, int Total, int Page, int PageSize);
