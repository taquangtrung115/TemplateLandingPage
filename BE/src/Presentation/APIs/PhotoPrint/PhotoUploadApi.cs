namespace OnePortal.Presentation.APIs.PhotoPrint;

using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using OnePortal.Contract.Services.V1.PhotoPrint.Uploads;
using OnePortal.Presentation.Abstractions;

public sealed class PhotoUploadApi : IEndpoint
{
    public const string UploadRatePolicy = "photoprint-uploads";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/photoprint/uploads").WithTags("Photo Print");
        group.MapPost("/photos", UploadAsync)
            .DisableAntiforgery()
            .WithMetadata(new RequestSizeLimitAttribute(16 * 1024 * 1024))
            .RequireRateLimiting(UploadRatePolicy)
            .AllowAnonymous();
        group.MapGet("/{fileName}", DownloadAsync).AllowAnonymous();
    }

    private static async Task<IResult> UploadAsync(IFormFile file, string? kind, ISender sender, HttpContext context, CancellationToken cancellationToken)
    {
        await using var stream = file.OpenReadStream();
        var result = await sender.Send(new UploadPhotoCommand(stream, file.Length, kind), cancellationToken);
        return PhotoPrintResponse.From(result, context, StatusCodes.Status201Created);
    }

    private static async Task<IResult> DownloadAsync(string fileName, bool? download, ISender sender, HttpContext context, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetPhotoFileQuery(fileName), cancellationToken);
        if (result.IsFailure) return PhotoPrintResponse.From(result, context);
        var file = result.Value;
        context.Response.Headers["X-Content-Type-Options"] = "nosniff";
        context.Response.Headers.CacheControl = "private, no-store";
        if (file.Owner is not null) context.Response.RegisterForDispose(file.Owner);
        return Results.Stream(file.Content, file.ContentType, download == true ? fileName : null);
    }
}
