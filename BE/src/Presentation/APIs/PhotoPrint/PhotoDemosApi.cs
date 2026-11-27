namespace OnePortal.Presentation.APIs.PhotoPrint;

using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using OnePortal.Contract.Services.V1.PhotoPrint.Demos;
using OnePortal.Presentation.Abstractions;
using OnePortal.Presentation.Authorization;

public sealed class PhotoDemosApi : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/photoprint").WithTags("Photo Print");
        group.MapGet("/demos", async (string? model3DType, string? search, bool? includeInactive, int? page, int? pageSize, ISender sender, HttpContext context, CancellationToken ct) =>
            PhotoPrintResponse.From(await sender.Send(new GetDemosQuery(model3DType, search, includeInactive == true, page ?? 1, pageSize ?? 24), ct), context))
            .AllowAnonymous();

        group.MapPost("/demos", async (PhotoDemoInput input, ISender sender, HttpContext context, CancellationToken ct) =>
            PhotoPrintResponse.From(await sender.Send(new SaveDemoCommand(null, input), ct), context, StatusCodes.Status201Created))
            .RequireAuthorization(AuthorizationPolicies.AdminOnly);

        group.MapPut("/demos/{id:guid}", async (Guid id, PhotoDemoInput input, ISender sender, HttpContext context, CancellationToken ct) =>
            PhotoPrintResponse.From(await sender.Send(new SaveDemoCommand(id, input), ct), context))
            .RequireAuthorization(AuthorizationPolicies.AdminOnly);

        group.MapDelete("/demos/{id:guid}", async (Guid id, ISender sender, HttpContext context, CancellationToken ct) =>
            PhotoPrintResponse.From(await sender.Send(new DeleteDemoCommand(id), ct), context))
            .RequireAuthorization(AuthorizationPolicies.AdminOnly);
    }
}
