namespace OnePortal.Contract.Abstractions.Message;

using MediatR;
using OnePortal.Contract.Abstractions.Shared;

public interface IQuery<TResponse> : IRequest<Result<TResponse>>
{
}
