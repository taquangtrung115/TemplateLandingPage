namespace OnePortal.Presentation.APIs.PhotoPrint;

using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using OnePortal.Contract.Services.V1.PhotoPrint.Products;
using OnePortal.Presentation.Abstractions;
using OnePortal.Presentation.Authorization;

public sealed class PhotoProductsApi : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/photoprint").WithTags("Photo Print");
        group.MapGet("/categories", async (bool? includeInactive, ISender sender, HttpContext context, CancellationToken ct) =>
            PhotoPrintResponse.From(await sender.Send(new GetCategoriesQuery(includeInactive == true), ct), context))
            .AllowAnonymous();

        group.MapGet("/products", async (string? search, string? categorySlug, string? usage, string? sort, bool? featured, int? page, int? pageSize, bool? includeInactive, ISender sender, HttpContext context, CancellationToken ct) =>
            PhotoPrintResponse.From(await sender.Send(new SearchProductsQuery(new PhotoCatalogFilter(search, categorySlug, usage, sort, featured == true, page ?? 1, pageSize ?? 12, includeInactive == true)), ct), context))
            .AllowAnonymous();

        group.MapGet("/products/{slug}", async (string slug, ISender sender, HttpContext context, CancellationToken ct) =>
            PhotoPrintResponse.From(await sender.Send(new GetProductQuery(slug), ct), context))
            .AllowAnonymous();

        group.MapPost("/categories", async (PhotoCategoryInput input, ISender sender, HttpContext context, CancellationToken ct) =>
            PhotoPrintResponse.From(await sender.Send(new SaveCategoryCommand(null, input), ct), context, StatusCodes.Status201Created))
            .RequireAuthorization(AuthorizationPolicies.AdminOnly);

        group.MapPut("/categories/{id:guid}", async (Guid id, PhotoCategoryInput input, ISender sender, HttpContext context, CancellationToken ct) =>
            PhotoPrintResponse.From(await sender.Send(new SaveCategoryCommand(id, input), ct), context))
            .RequireAuthorization(AuthorizationPolicies.AdminOnly);

        group.MapDelete("/categories/{id:guid}", async (Guid id, ISender sender, HttpContext context, CancellationToken ct) =>
            PhotoPrintResponse.From(await sender.Send(new DeleteCategoryCommand(id), ct), context))
            .RequireAuthorization(AuthorizationPolicies.AdminOnly);

        group.MapPost("/products", async (PhotoProductInput input, ISender sender, HttpContext context, CancellationToken ct) =>
            PhotoPrintResponse.From(await sender.Send(new SaveProductCommand(null, input), ct), context, StatusCodes.Status201Created))
            .RequireAuthorization(AuthorizationPolicies.AdminOnly);

        group.MapPut("/products/{id:guid}", async (Guid id, PhotoProductInput input, ISender sender, HttpContext context, CancellationToken ct) =>
            PhotoPrintResponse.From(await sender.Send(new SaveProductCommand(id, input), ct), context))
            .RequireAuthorization(AuthorizationPolicies.AdminOnly);

        group.MapDelete("/products/{id:guid}", async (Guid id, ISender sender, HttpContext context, CancellationToken ct) =>
            PhotoPrintResponse.From(await sender.Send(new DeleteProductCommand(id), ct), context))
            .RequireAuthorization(AuthorizationPolicies.AdminOnly);
    }
}
