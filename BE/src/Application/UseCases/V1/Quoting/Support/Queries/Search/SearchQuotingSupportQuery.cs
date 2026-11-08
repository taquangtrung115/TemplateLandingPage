namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Support.Queries.Search;
using TemplateLandingPage.Contract.Abstractions.Message;
public sealed record SearchQuotingSupportQuery(string Status = "New", string? SearchTerm = null, string? Priority = null, int Page = 1, int PageSize = 20) : IQuery<SearchQuotingSupportResult>;
