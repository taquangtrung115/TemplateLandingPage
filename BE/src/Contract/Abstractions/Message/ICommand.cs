namespace TemplateLandingPage.Contract.Abstractions.Message;

using MediatR;
using TemplateLandingPage.Contract.Abstractions.Shared;

public interface ICommand : IRequest<Result>
{
}

public interface ICommand<TResponse> : IRequest<Result<TResponse>>
{
}
