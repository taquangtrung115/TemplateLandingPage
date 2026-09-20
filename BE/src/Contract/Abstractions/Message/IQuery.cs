namespace TemplateLandingPage.Contract.Abstractions.Message;

using MediatR;
using TemplateLandingPage.Contract.Abstractions.Shared;

public interface IQuery<TResponse> : IRequest<Result<TResponse>>
{
}
