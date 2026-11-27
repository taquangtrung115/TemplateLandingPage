namespace OnePortal.Presentation.APIs.PhotoPrint;

using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using OnePortal.Contract.Services.V1.PhotoPrint;
using OnePortal.Contract.Services.V1.PhotoPrint.Orders;
using OnePortal.Presentation.Abstractions;
using OnePortal.Presentation.Authorization;

public sealed class PhotoOrdersApi : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/photoprint").WithTags("Photo Print");
        group.MapGet("/orders", async (string? search, string? status, int? page, int? pageSize, ISender sender, HttpContext context, CancellationToken ct) =>
            PhotoPrintResponse.From(await sender.Send(new GetOrdersQuery(new PhotoQueueFilter(search, status, null, page ?? 1, pageSize ?? 20)), ct), context))
            .RequireAuthorization(AuthorizationPolicies.AdminOnly);

        group.MapGet("/orders/track", async (string code, string phone, ISender sender, HttpContext context, CancellationToken ct) =>
            PhotoPrintResponse.From(await sender.Send(new GetOrderStatusQuery(code, phone), ct), context))
            .AllowAnonymous();

        group.MapPost("/orders", async (PhotoOrderInput input, ISender sender, HttpContext context, CancellationToken ct) =>
            PhotoPrintResponse.From(await sender.Send(new CreateOrderCommand(input), ct), context, StatusCodes.Status201Created))
            .AllowAnonymous();

        group.MapPut("/orders/{id:guid}/status", async (Guid id, PhotoStatusInput input, ISender sender, HttpContext context, CancellationToken ct) =>
            PhotoPrintResponse.From(await sender.Send(new SetOrderStatusCommand(id, input), ct), context))
            .RequireAuthorization(AuthorizationPolicies.AdminOnly);
    }
}
