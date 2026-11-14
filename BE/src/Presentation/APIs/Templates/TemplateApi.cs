namespace OnePortal.Presentation.APIs.Templates;

using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Templates;
using OnePortal.Presentation.Abstractions;
using OnePortal.Presentation.Authorization;
using System.Security.Claims;

public sealed class TemplateApi : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/templates")
            .WithTags("Templates");

        group.MapGet(string.Empty, async (string? category, Guid? categoryId, string? badge, string? search, bool? isActiveOnly, bool? isCommunity, ClaimsPrincipal user, ISender sender) =>
        {
            var includeInactive = isActiveOnly == false && user.IsInRole("Admin");
            var result = await sender.Send(new GetTemplatesQuery(category, categoryId, badge, search, !includeInactive, isCommunity));
            return HandleResult(result, () => Results.Ok(result));
        })
        .WithName("GetTemplates")
        .Produces<Result<List<TemplateSummaryResponse>>>(StatusCodes.Status200OK);

        group.MapPost("community", async (CreateCommunityTemplateRequest request, ClaimsPrincipal user, ISender sender) =>
        {
            var userIdValue = user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? user.FindFirst("sub")?.Value;
            if (!Guid.TryParse(userIdValue, out var userId))
            {
                return Results.Unauthorized();
            }

            var command = new CreateCommunityTemplateCommand(
                request.SourceCustomizationId,
                request.CustomizationVersionId,
                request.CategoryId,
                request.Name,
                request.Slug,
                request.Description,
                request.ThumbnailUrl,
                userId,
                user.IsInRole("Admin"));
            var result = await sender.Send(command);
            return HandleResult(result, () => Results.Created($"/api/v1/templates/{result.Value}", result));
        })
        .RequireAuthorization()
        .WithName("CreateCommunityTemplate")
        .Produces<Result<Guid>>(StatusCodes.Status201Created)
        .Produces<ValidationResult>(StatusCodes.Status400BadRequest);

        group.MapGet("{id:guid}", async (Guid id, ClaimsPrincipal user, ISender sender) =>
        {
            var result = await sender.Send(new GetTemplateByIdQuery(id, user.IsInRole("Admin")));
            return HandleResult(result, () => Results.Ok(result));
        })
        .WithName("GetTemplateById")
        .Produces<Result<TemplateResponse>>(StatusCodes.Status200OK)
        .Produces<Error>(StatusCodes.Status404NotFound);

        group.MapGet("slug/{slug}", async (string slug, ClaimsPrincipal user, ISender sender) =>
        {
            var result = await sender.Send(new GetTemplateBySlugQuery(slug, user.IsInRole("Admin")));
            return HandleResult(result, () => Results.Ok(result));
        })
        .WithName("GetTemplateBySlug")
        .Produces<Result<TemplateResponse>>(StatusCodes.Status200OK)
        .Produces<Error>(StatusCodes.Status404NotFound);

        group.MapPost(string.Empty, async (CreateTemplateCommand command, ISender sender) =>
        {
            var result = await sender.Send(command);
            return HandleResult(result, () => Results.Created($"/api/v1/templates/{result.Value}", result));
        })
        .RequireAuthorization(AuthorizationPolicies.AdminOnly)
        .WithName("CreateTemplate")
        .Produces<Result<Guid>>(StatusCodes.Status201Created)
        .Produces<ValidationResult>(StatusCodes.Status400BadRequest);

        group.MapPut("{id:guid}", async (Guid id, UpdateTemplateRequest request, ISender sender) =>
        {
            var command = new UpdateTemplateCommand(
                id,
                request.Name,
                request.Slug,
                request.Description,
                request.CategoryId,
                request.Category,
                request.ThumbnailUrl,
                request.PreviewUrl,
                request.LongPreviewUrl,
                request.Badge,
                request.AudioUrl,
                request.MusicTitle,
                request.DefaultConfigJson,
                request.IsActive);

            var result = await sender.Send(command);
            return HandleResult(result, () => Results.Ok(result));
        })
        .RequireAuthorization(AuthorizationPolicies.AdminOnly)
        .WithName("UpdateTemplate")
        .Produces<Result>(StatusCodes.Status200OK)
        .Produces<ValidationResult>(StatusCodes.Status400BadRequest)
        .Produces<Error>(StatusCodes.Status404NotFound);

        group.MapDelete("{id:guid}", async (Guid id, ISender sender) =>
        {
            var result = await sender.Send(new DeleteTemplateCommand(id));
            return HandleResult(result, () => Results.Ok(result));
        })
        .RequireAuthorization(AuthorizationPolicies.AdminOnly)
        .WithName("DeleteTemplate")
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

        if (result.Error == TemplateErrors.NotFound)
        {
            return Results.NotFound(new
            {
                Title = "Not Found",
                Status = StatusCodes.Status404NotFound,
                Error = result.Error
            });
        }

        if (result.Error == TemplateErrors.AccessDenied)
        {
            return Results.Forbid();
        }

        return Results.BadRequest(new
        {
            Title = "Bad Request",
            Status = StatusCodes.Status400BadRequest,
            Error = result.Error
        });
    }
}

public record UpdateTemplateRequest(
    string Name,
    string Slug,
    string? Description,
    Guid? CategoryId,
    string Category,
    string ThumbnailUrl,
    string? PreviewUrl,
    string? LongPreviewUrl,
    string? Badge,
    string? AudioUrl,
    string? MusicTitle,
    string DefaultConfigJson,
    bool IsActive);

public record CreateCommunityTemplateRequest(
    Guid SourceCustomizationId,
    Guid CustomizationVersionId,
    Guid CategoryId,
    string Name,
    string Slug,
    string? Description,
    string ThumbnailUrl);
