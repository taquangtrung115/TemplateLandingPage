namespace OnePortal.Application.Abstractions;

using MediatR;
using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;

public interface IQueryHandler<in TQuery, TResponse> : IRequestHandler<TQuery, Result<TResponse>>
    where TQuery : IQuery<TResponse>
{
}
