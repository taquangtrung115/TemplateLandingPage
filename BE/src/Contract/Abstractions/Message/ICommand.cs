namespace OnePortal.Contract.Abstractions.Message;

using MediatR;
using OnePortal.Contract.Abstractions.Shared;

public interface ICommand : IRequest<Result>
{
}

public interface ICommand<TResponse> : IRequest<Result<TResponse>>
{
}
