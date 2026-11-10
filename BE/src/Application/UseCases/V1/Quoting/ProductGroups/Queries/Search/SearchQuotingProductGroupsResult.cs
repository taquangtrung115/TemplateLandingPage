namespace TemplateLandingPage.Application.UseCases.V1.Quoting.ProductGroups.Queries.Search;
using TemplateLandingPage.Application.UseCases.V1.Quoting.ProductGroups.Dtos;
public sealed record SearchQuotingProductGroupsResult(List<QuotingProductGroupDto> Groups);
