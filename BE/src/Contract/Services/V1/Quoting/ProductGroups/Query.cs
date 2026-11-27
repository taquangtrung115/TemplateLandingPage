namespace OnePortal.Contract.Services.V1.Quoting.ProductGroups;

using OnePortal.Contract.Abstractions.Message;

public sealed record SearchQuotingProductGroupsQuery(bool IncludeInactive = false) : IQuery<SearchQuotingProductGroupsResult>;
