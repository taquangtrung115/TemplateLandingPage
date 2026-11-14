namespace OnePortal.Application.UseCases.V1.Quoting.Support.Queries.Search;
using OnePortal.Application.UseCases.V1.Quoting.Support.Dtos;
public sealed record SearchQuotingSupportResult(IReadOnlyList<QuotingSupportRequestDto> Data, int Total, int Page, int PageSize);
