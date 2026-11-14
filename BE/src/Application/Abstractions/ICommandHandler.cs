namespace OnePortal.Application.Abstractions;

using MediatR;
using OnePortal.Contract.Abstractions.Message;
using OnePortal.Contract.Abstractions.Shared;

public interface ICommandHandler<in TCommand> : IRequestHandler<TCommand, Result>
    where TCommand : ICommand
{
}

public interface ICommandHandler<in TCommand, TResponse> : IRequestHandler<TCommand, Result<TResponse>>
    where TCommand : ICommand<TResponse>
{
}
