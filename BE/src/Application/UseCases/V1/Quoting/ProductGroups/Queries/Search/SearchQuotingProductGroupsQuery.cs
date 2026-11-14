namespace OnePortal.Application.UseCases.V1.Quoting.ProductGroups.Queries.Search;
using OnePortal.Contract.Abstractions.Message;
public sealed record SearchQuotingProductGroupsQuery(bool IncludeInactive = false) : IQuery<SearchQuotingProductGroupsResult>;
