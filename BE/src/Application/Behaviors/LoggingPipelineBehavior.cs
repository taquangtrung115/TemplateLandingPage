namespace TemplateLandingPage.Application.Behaviors;

using MediatR;
using System.Diagnostics;
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
        var operationId = Activity.Current?.TraceId.ToString() ?? Guid.NewGuid().ToString("N");

        _logger.LogInformation("Processing request {RequestName}, operation {OperationId}", requestName, operationId);

        var result = await next();

        if (result.IsSuccess)
        {
            _logger.LogInformation("Request {RequestName} processed successfully, operation {OperationId}", requestName, operationId);
        }
        else
        {
            _logger.LogWarning(
                "Request {RequestName}, operation {OperationId}, processed with error: {ErrorCode}",
                requestName,
                operationId,
                result.Error.Code);
        }

        return result;
    }
}
