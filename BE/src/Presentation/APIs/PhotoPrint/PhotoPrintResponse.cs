namespace OnePortal.Presentation.APIs.PhotoPrint;

using Microsoft.AspNetCore.Http;
using OnePortal.Contract.Abstractions.Shared;

internal static class PhotoPrintResponse
{
    public static IResult From<T>(Result<T> result, HttpContext context, int status = StatusCodes.Status200OK)
    {
        context.Response.Headers.CacheControl = "private, no-store";
        if (result.IsSuccess) return Results.Json(result, statusCode: status);
        if (result is IValidationResult validation)
            return Results.BadRequest(new { title = "Kiểm tra dữ liệu Photo Print.", errors = validation.Errors });
        var error = result.Error;
        var code = error.Code.Split('.').Last() switch
        {
            "Forbidden" => StatusCodes.Status403Forbidden,
            "NotFound" => StatusCodes.Status404NotFound,
            "Conflict" => StatusCodes.Status409Conflict,
            "StorageUnavailable" => StatusCodes.Status503ServiceUnavailable,
            _ => StatusCodes.Status400BadRequest,
        };
        return Results.Json(new { error }, statusCode: code);
    }
}
