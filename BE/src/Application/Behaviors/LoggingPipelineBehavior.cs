namespace TemplateLandingPage.Application.Behaviors;

using MediatR;
using Microsoft.Extensions.Logging;
using TemplateLandingPage.Contract.Abstractions.Shared;

public class LoggingPipelineBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
    where TResponse : Result
{
    private readonly ILogger<LoggingPipelineBehavior<TRequest, TResponse>> _logger;

    public LoggingPipelineBehavior(ILogger<LoggingPipelineBehavior<TRequest, TResponse>> logger)
    {
        _logger = logger;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;

        _logger.LogInformation("Processing request {RequestName}", requestName);

        var result = await next();

        if (result.IsSuccess)
        {
            _logger.LogInformation("Request {RequestName} processed successfully", requestName);
        }
        else
        {
            _logger.LogWarning(
                "Request {RequestName} processed with error: {ErrorCode} - {ErrorMessage}",
                requestName,
                result.Error.Code,
                result.Error.Message);
        }

        return result;
    }
}
