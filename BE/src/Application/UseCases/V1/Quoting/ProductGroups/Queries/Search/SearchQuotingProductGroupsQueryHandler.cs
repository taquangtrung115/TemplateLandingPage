namespace TemplateLandingPage.Application.UseCases.V1.Quoting.ProductGroups.Queries.Search;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities.Quoting;
using TemplateLandingPage.Domain.Repositories.Quoting;
using TemplateLandingPage.Application.UseCases.V1.Quoting.ProductGroups.Dtos;
public sealed class SearchQuotingProductGroupsQueryHandler(IQuotingProductGroupRepository repository)
    : IQueryHandler<SearchQuotingProductGroupsQuery, SearchQuotingProductGroupsResult>
{
    public async Task<Result<SearchQuotingProductGroupsResult>> Handle(SearchQuotingProductGroupsQuery request, CancellationToken cancellationToken)
    {
        var groups = await repository.SearchAsync(request.IncludeInactive, cancellationToken);
        return Result.Success(new SearchQuotingProductGroupsResult(groups.Select(group =>
            new QuotingProductGroupDto(group.Id, group.Code, group.Name, group.Description, group.SortOrder, group.IsActive)).ToList()));
    }
}
