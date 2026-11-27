namespace OnePortal.Contract.Services.V1.Quoting.Support;

public sealed record QuotingSupportRequestDto(Guid Id, string FullName, string Email, string? Phone, string Topic, string Priority,
    string Message, string Status, int Revision, DateTime CreatedAtUtc, DateTime? UpdatedAtUtc, Guid? UpdatedByUserId, DateTime? ResolvedAtUtc, Guid? ResolvedByUserId);

public sealed record SearchQuotingSupportResult(IReadOnlyList<QuotingSupportRequestDto> Data, int Total, int Page, int PageSize);

public sealed record ChangeQuotingSupportStatusResult(QuotingSupportRequestDto Request);

public sealed record SubmitQuotingSupportResult(Guid Id);
