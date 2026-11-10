namespace TemplateLandingPage.Presentation.APIs.Quoting;

using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using TemplateLandingPage.Application.UseCases.V1.Quoting.Products.Commands.UploadImage;
using TemplateLandingPage.Application.UseCases.V1.Quoting.Products.Queries.GetImage;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Quoting.Products;
using TemplateLandingPage.Presentation.Abstractions;
using TemplateLandingPage.Presentation.Authorization;

public sealed class QuotingProductApi : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/quoting/products")
            .WithTags("QuotingProducts");

        group.MapPost("images", async (IFormFile file, ISender sender, CancellationToken ct) =>
        {
            await using var content = file.OpenReadStream();
            return Respond(await sender.Send(new UploadQuotingProductImageCommand(content, file.ContentType, file.Length), ct), StatusCodes.Status201Created);
        }).RequireAuthorization(AuthorizationPolicies.AdminOnly).DisableAntiforgery()
            .WithMetadata(new RequestSizeLimitAttribute(6 * 1024 * 1024));

        app.MapGet("/api/v1/quoting/product-images/uploads/{fileName}", async (string fileName, HttpContext context, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new GetQuotingProductImageQuery(fileName), ct);
            if (!result.IsSuccess) return Results.NotFound();
            context.Response.Headers.CacheControl = "public,max-age=31536000,immutable";
            context.Response.Headers["X-Content-Type-Options"] = "nosniff";
            return Results.File(result.Value.Data, result.Value.ContentType);
        }).AllowAnonymous().WithTags("QuotingProducts");

        group.MapPost("", async (CreateQuotingProductRequest request, ISender sender, CancellationToken ct) =>
        {
            var command = new CreateQuotingProductCommand(
                request.Code,
                request.Name,
                request.Description,
                request.Unit,
                request.Price,
                request.ImageUrl,
                request.Category,
                request.IsActive, request.GroupId);

            var result = await sender.Send(command, ct);
            return Respond(result, StatusCodes.Status201Created);
        })
        .RequireAuthorization(AuthorizationPolicies.AdminOnly);

        group.MapGet("", async (string? search, string? category, bool? includeInactive, ISender sender, CancellationToken ct) =>
        {
            var query = new GetQuotingProductsQuery(search, category, includeInactive == true);
            var result = await sender.Send(query, ct);
            return Respond(result);
        })
        .RequireAuthorization();

        group.MapGet("{id:guid}", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var query = new GetQuotingProductByIdQuery(id);
            var result = await sender.Send(query, ct);
            return Respond(result);
        })
        .RequireAuthorization();

        group.MapPut("{id:guid}", async (Guid id, UpdateQuotingProductRequest request, ISender sender, CancellationToken ct) =>
        {
            var command = new UpdateQuotingProductCommand(
                id,
                request.Code,
                request.Name,
                request.Description,
                request.Unit,
                request.Price,
                request.ImageUrl,
                request.Category,
                request.IsActive, request.GroupId);

            var result = await sender.Send(command, ct);
            return Respond(result);
        })
        .RequireAuthorization(AuthorizationPolicies.AdminOnly);

        group.MapDelete("{id:guid}", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var command = new DeleteQuotingProductCommand(id);
            var result = await sender.Send(command, ct);
            return Respond(result);
        })
        .RequireAuthorization(AuthorizationPolicies.AdminOnly);
    }

    private static IResult Respond<T>(Result<T> result, int status = StatusCodes.Status200OK) =>
        result.IsSuccess ? Results.Json(result, statusCode: status) : Respond((Result)result);

    private static IResult Respond(Result result)
    {
        if (result.IsSuccess) return Results.Ok(result);
        if (result is IValidationResult validation)
            return Results.BadRequest(new { title = "Validation Error", status = StatusCodes.Status400BadRequest, errors = validation.Errors });
        var status = result.Error.Code == "QuotingProductImage.Unavailable" ? StatusCodes.Status503ServiceUnavailable : result.Error == QuotingProductErrors.NotFound ? StatusCodes.Status404NotFound :
                     result.Error == QuotingProductErrors.DuplicateCode ? StatusCodes.Status409Conflict :
                     StatusCodes.Status400BadRequest;
        return Results.Json(new { title = "Request failed", status, error = result.Error }, statusCode: status);
    }
}

public record CreateQuotingProductRequest(
    string Code,
    string Name,
    string? Description,
    string Unit,
    decimal Price,
    string? ImageUrl,
    string? Category,
    bool IsActive = true, Guid? GroupId = null);

public record UpdateQuotingProductRequest(
    string Code,
    string Name,
    string? Description,
    string Unit,
    decimal Price,
    string? ImageUrl,
    string? Category,
    bool IsActive, Guid? GroupId = null);
