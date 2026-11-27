namespace OnePortal.Application.UseCases.V1.Queries.Quoting.ProductGroups;
using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities.Quoting;
using OnePortal.Domain.Repositories.Quoting;
using OnePortal.Contract.Services.V1.Quoting.ProductGroups;
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
