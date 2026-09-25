namespace TemplateLandingPage.API.Middlewares;

using System.Net;
using System.Diagnostics;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using TemplateLandingPage.Domain.Exceptions;

public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (WriteConflictException)
        {
            await WriteErrorAsync(
                context,
                (int)HttpStatusCode.Conflict,
                "Conflict",
                "The request conflicts with the current data. Refresh and retry.");
        }
        catch (BadHttpRequestException)
        {
            await WriteErrorAsync(
                context,
                (int)HttpStatusCode.BadRequest,
                "Bad Request",
                "The request body or parameters are invalid.");
        }
        catch (JsonException)
        {
            await WriteErrorAsync(
                context,
                (int)HttpStatusCode.BadRequest,
                "Bad Request",
                "The request body contains invalid JSON.");
        }
        catch (Exception ex)
        {
            var operationId = GetOperationId(context);
            _logger.LogError(
                "Unhandled request failure for operation {OperationId} ({ExceptionType}).",
                operationId,
                ex.GetType().Name);
            await WriteErrorAsync(
                context,
                (int)HttpStatusCode.InternalServerError,
                "Server Error",
                "An unexpected error occurred on the server.");
        }
    }

    private static Task WriteErrorAsync(HttpContext context, int statusCode, string title, string detail)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var response = new
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            OperationId = GetOperationId(context),
            Errors = Array.Empty<string>()
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }

    private static string GetOperationId(HttpContext context) => Activity.Current?.Id ?? context.TraceIdentifier;
}
