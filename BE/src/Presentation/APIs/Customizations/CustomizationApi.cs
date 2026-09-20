namespace TemplateLandingPage.Presentation.APIs.Customizations;

using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Customizations;
using TemplateLandingPage.Presentation.Abstractions;

public sealed class CustomizationApi : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/customizations")
            .WithTags("Customizations");

        group.MapGet("my", async (ClaimsPrincipal user, ISender sender) =>
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? user.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Results.Unauthorized();
            }

            var result = await sender.Send(new GetMyCustomizationsQuery(userId));
            return HandleResult(result, () => Results.Ok(result));
        })
        .RequireAuthorization()
        .WithName("GetMyCustomizations")
        .Produces<Result<List<CustomizationResponse>>>(StatusCodes.Status200OK);

        group.MapGet("{id:guid}", async (Guid id, ISender sender) =>
        {
            var result = await sender.Send(new GetCustomizationByIdQuery(id));
            return HandleResult(result, () => Results.Ok(result));
        })
        .WithName("GetCustomizationById")
        .Produces<Result<CustomizationResponse>>(StatusCodes.Status200OK)
        .Produces<Error>(StatusCodes.Status404NotFound);

        group.MapGet("slug/{slug}", async (string slug, ISender sender) =>
        {
            var result = await sender.Send(new GetCustomizationBySlugQuery(slug));
            return HandleResult(result, () => Results.Ok(result));
        })
        .WithName("GetCustomizationBySlug")
        .Produces<Result<CustomizationResponse>>(StatusCodes.Status200OK)
        .Produces<Error>(StatusCodes.Status404NotFound);

        group.MapPost(string.Empty, async (CreateCustomizationRequest request, ClaimsPrincipal user, ISender sender) =>
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? user.FindFirst("sub")?.Value;

            Guid? userId = null;
            if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var parsedId))
            {
                userId = parsedId;
            }

            var command = new CreateCustomizationCommand(
                userId,
                request.TemplateId,
                request.Title,
                request.Slug,
                request.ConfigJson,
                request.IsPublished);

            var result = await sender.Send(command);
            return HandleResult(result, () => Results.Created($"/api/v1/customizations/{result.Value}", result));
        })
        .WithName("CreateCustomization")
        .Produces<Result<Guid>>(StatusCodes.Status201Created)
        .Produces<ValidationResult>(StatusCodes.Status400BadRequest);

        group.MapPut("{id:guid}", async (Guid id, UpdateCustomizationRequest request, ClaimsPrincipal user, ISender sender) =>
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? user.FindFirst("sub")?.Value;

            Guid? userId = null;
            if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var parsedId))
            {
                userId = parsedId;
            }

            var roleClaim = user.FindFirst(ClaimTypes.Role)?.Value ?? "User";

            var command = new UpdateCustomizationCommand(
                id,
                request.Title,
                request.Slug,
                request.ConfigJson,
                request.IsPublished,
                userId,
                roleClaim);

            var result = await sender.Send(command);
            return HandleResult(result, () => Results.Ok(result));
        })
        .RequireAuthorization()
        .WithName("UpdateCustomization")
        .Produces<Result>(StatusCodes.Status200OK)
        .Produces<ValidationResult>(StatusCodes.Status400BadRequest)
        .Produces<Error>(StatusCodes.Status404NotFound);

        group.MapDelete("{id:guid}", async (Guid id, ClaimsPrincipal user, ISender sender) =>
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? user.FindFirst("sub")?.Value;

            Guid? userId = null;
            if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var parsedId))
            {
                userId = parsedId;
            }

            var roleClaim = user.FindFirst(ClaimTypes.Role)?.Value ?? "User";

            var command = new DeleteCustomizationCommand(id, userId, roleClaim);
            var result = await sender.Send(command);
            return HandleResult(result, () => Results.Ok(result));
        })
        .RequireAuthorization()
        .WithName("DeleteCustomization")
        .Produces<Result>(StatusCodes.Status200OK)
        .Produces<Error>(StatusCodes.Status404NotFound);
    }

    private static IResult HandleResult(Result result, Func<IResult> onSuccess)
    {
        if (result.IsSuccess)
        {
            return onSuccess();
        }

        if (result is IValidationResult validationResult)
        {
            return Results.BadRequest(new
            {
                Title = "Validation Error",
                Status = StatusCodes.Status400BadRequest,
                Errors = validationResult.Errors
            });
        }

        if (result.Error == CustomizationErrors.NotFound)
        {
            return Results.NotFound(new
            {
                Title = "Not Found",
                Status = StatusCodes.Status404NotFound,
                Error = result.Error
            });
        }

        return Results.BadRequest(new
        {
            Title = "Bad Request",
            Status = StatusCodes.Status400BadRequest,
            Error = result.Error
        });
    }
}

public record CreateCustomizationRequest(
    Guid TemplateId,
    string Title,
    string Slug,
    string ConfigJson,
    bool IsPublished);

public record UpdateCustomizationRequest(
    string Title,
    string Slug,
    string ConfigJson,
    bool IsPublished);
