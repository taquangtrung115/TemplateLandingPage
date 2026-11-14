namespace OnePortal.Application.UseCases.V1.Quoting.Support.Queries.Search;
using OnePortal.Application.Abstractions;
using OnePortal.Application.UseCases.V1.Quoting.Support.Dtos;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Domain.Entities.Quoting;
using OnePortal.Domain.Repositories.Quoting;
public sealed class SearchQuotingSupportQueryHandler(IQuotingSupportRepository repository) : IQueryHandler<SearchQuotingSupportQuery, SearchQuotingSupportResult>
{
    #region Fields
    private readonly IQuotingSupportRepository _repository = repository;
    #endregion

    #region Request handling
    public async Task<Result<SearchQuotingSupportResult>> Handle(SearchQuotingSupportQuery request, CancellationToken cancellationToken)
    {
        var status = Enum.Parse<QuotingSupportStatus>(request.Status);
        var total = await _repository.CountAsync(status, request.SearchTerm, request.Priority, cancellationToken);
        var rows = await _repository.SearchAsync(status, request.SearchTerm, request.Priority, request.Page, request.PageSize, cancellationToken);
        return Result.Success(new SearchQuotingSupportResult(rows.Select(QuotingSupportRequestDto.From).ToList(), total, request.Page, request.PageSize));
    }
    #endregion
}
