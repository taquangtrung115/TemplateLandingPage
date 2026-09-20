namespace TemplateLandingPage.Presentation.APIs.Templates;

using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Templates;
using TemplateLandingPage.Presentation.Abstractions;

public sealed class TemplateApi : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/templates")
            .WithTags("Templates");

        group.MapGet(string.Empty, async (string? category, bool? isActiveOnly, ISender sender) =>
        {
            var result = await sender.Send(new GetTemplatesQuery(category, isActiveOnly));
            return HandleResult(result, () => Results.Ok(result));
        })
        .WithName("GetTemplates")
        .Produces<Result<List<TemplateResponse>>>(StatusCodes.Status200OK);

        group.MapGet("{id:guid}", async (Guid id, ISender sender) =>
        {
            var result = await sender.Send(new GetTemplateByIdQuery(id));
            return HandleResult(result, () => Results.Ok(result));
        })
        .WithName("GetTemplateById")
        .Produces<Result<TemplateResponse>>(StatusCodes.Status200OK)
        .Produces<Error>(StatusCodes.Status404NotFound);

        group.MapGet("slug/{slug}", async (string slug, ISender sender) =>
        {
            var result = await sender.Send(new GetTemplateBySlugQuery(slug));
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
        .RequireAuthorization()
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
                request.Category,
                request.ThumbnailUrl,
                request.PreviewUrl,
                request.DefaultConfigJson,
                request.IsActive);

            var result = await sender.Send(command);
            return HandleResult(result, () => Results.Ok(result));
        })
        .RequireAuthorization()
        .WithName("UpdateTemplate")
        .Produces<Result>(StatusCodes.Status200OK)
        .Produces<ValidationResult>(StatusCodes.Status400BadRequest)
        .Produces<Error>(StatusCodes.Status404NotFound);

        group.MapDelete("{id:guid}", async (Guid id, ISender sender) =>
        {
            var result = await sender.Send(new DeleteTemplateCommand(id));
            return HandleResult(result, () => Results.Ok(result));
        })
        .RequireAuthorization()
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
    string Category,
    string ThumbnailUrl,
    string? PreviewUrl,
    string DefaultConfigJson,
    bool IsActive);
