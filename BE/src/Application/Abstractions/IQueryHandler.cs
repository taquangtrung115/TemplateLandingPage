namespace TemplateLandingPage.Application.Abstractions;

using MediatR;
using TemplateLandingPage.Contract.Abstractions.Message;
using TemplateLandingPage.Contract.Abstractions.Shared;

public interface IQueryHandler<in TQuery, TResponse> : IRequestHandler<TQuery, Result<TResponse>>
    where TQuery : IQuery<TResponse>
{
}
