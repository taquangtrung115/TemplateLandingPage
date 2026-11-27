namespace OnePortal.Contract.Services.V1.Quoting.ProductGroups;

public sealed record QuotingProductGroupDto(Guid Id, string Code, string Name, string? Description, int SortOrder, bool IsActive);

public sealed record SearchQuotingProductGroupsResult(List<QuotingProductGroupDto> Groups);

public sealed record CreateQuotingProductGroupResult(Guid Id);

public sealed record DeleteQuotingProductGroupResult(Guid Id);

public sealed record UpdateQuotingProductGroupResult(Guid Id);
