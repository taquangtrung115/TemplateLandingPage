namespace TemplateLandingPage.Application.UseCases.V1.Quoting.ProductGroups.Queries.Search;
using TemplateLandingPage.Contract.Abstractions.Message;
public sealed record SearchQuotingProductGroupsQuery(bool IncludeInactive = false) : IQuery<SearchQuotingProductGroupsResult>;
