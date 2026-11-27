namespace OnePortal.Presentation.APIs.PhotoPrint;

using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using OnePortal.Contract.Services.V1.PhotoPrint;
using OnePortal.Contract.Services.V1.PhotoPrint.Support;
using OnePortal.Presentation.Abstractions;
using OnePortal.Presentation.Authorization;

public sealed class PhotoSupportApi : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/photoprint").WithTags("Photo Print");
        group.MapGet("/support-requests", async (string? search, string? status, string? priority, int? page, int? pageSize, ISender sender, HttpContext context, CancellationToken ct) =>
            PhotoPrintResponse.From(await sender.Send(new GetSupportRequestsQuery(new PhotoQueueFilter(search, status, priority, page ?? 1, pageSize ?? 12)), ct), context))
            .RequireAuthorization(AuthorizationPolicies.AdminOnly);

        group.MapGet("/support-requests/track", async (string code, string contact, ISender sender, HttpContext context, CancellationToken ct) =>
            PhotoPrintResponse.From(await sender.Send(new GetSupportStatusQuery(code, contact), ct), context))
            .AllowAnonymous();

        group.MapPost("/support-requests", async (PhotoSupportInput input, ISender sender, HttpContext context, CancellationToken ct) =>
            PhotoPrintResponse.From(await sender.Send(new CreateSupportRequestCommand(input), ct), context, StatusCodes.Status201Created))
            .AllowAnonymous();

        group.MapPut("/support-requests/{id:guid}/status", async (Guid id, PhotoStatusInput input, ISender sender, HttpContext context, CancellationToken ct) =>
            PhotoPrintResponse.From(await sender.Send(new SetSupportStatusCommand(id, input), ct), context))
            .RequireAuthorization(AuthorizationPolicies.AdminOnly);
    }
}
