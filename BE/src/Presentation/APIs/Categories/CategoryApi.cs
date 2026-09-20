namespace TemplateLandingPage.Presentation.APIs.Categories;

using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Categories;
using TemplateLandingPage.Presentation.Abstractions;

public sealed class CategoryApi : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/categories")
            .WithTags("Categories");

        group.MapGet(string.Empty, async (bool? isActiveOnly, ISender sender) =>
        {
            var result = await sender.Send(new GetCategoriesQuery(isActiveOnly));
            return HandleResult(result, () => Results.Ok(result));
        })
        .WithName("GetCategories")
        .Produces<Result<List<CategoryResponse>>>(StatusCodes.Status200OK);

        group.MapGet("{id:guid}", async (Guid id, ISender sender) =>
        {
            var result = await sender.Send(new GetCategoryByIdQuery(id));
            return HandleResult(result, () => Results.Ok(result));
        })
        .WithName("GetCategoryById")
        .Produces<Result<CategoryResponse>>(StatusCodes.Status200OK)
        .Produces<Error>(StatusCodes.Status404NotFound);

        group.MapGet("slug/{slug}", async (string slug, ISender sender) =>
        {
            var result = await sender.Send(new GetCategoryBySlugQuery(slug));
            return HandleResult(result, () => Results.Ok(result));
        })
        .WithName("GetCategoryBySlug")
        .Produces<Result<CategoryResponse>>(StatusCodes.Status200OK)
        .Produces<Error>(StatusCodes.Status404NotFound);

        group.MapPost(string.Empty, async (CreateCategoryCommand command, ISender sender) =>
        {
            var result = await sender.Send(command);
            return HandleResult(result, () => Results.Created($"/api/v1/categories/{result.Value}", result));
        })
        .RequireAuthorization()
        .WithName("CreateCategory")
        .Produces<Result<Guid>>(StatusCodes.Status201Created)
        .Produces<ValidationResult>(StatusCodes.Status400BadRequest);

        group.MapPut("{id:guid}", async (Guid id, UpdateCategoryRequest request, ISender sender) =>
        {
            var command = new UpdateCategoryCommand(
                id,
                request.Name,
                request.Slug,
                request.Description,
                request.Icon,
                request.OrderIndex,
                request.IsActive);

            var result = await sender.Send(command);
            return HandleResult(result, () => Results.Ok(result));
        })
        .RequireAuthorization()
        .WithName("UpdateCategory")
        .Produces<Result>(StatusCodes.Status200OK)
        .Produces<ValidationResult>(StatusCodes.Status400BadRequest)
        .Produces<Error>(StatusCodes.Status404NotFound);

        group.MapDelete("{id:guid}", async (Guid id, ISender sender) =>
        {
            var result = await sender.Send(new DeleteCategoryCommand(id));
            return HandleResult(result, () => Results.Ok(result));
        })
        .RequireAuthorization()
        .WithName("DeleteCategory")
        .Produces<Result>(StatusCodes.Status200OK)
        .Produces<Error>(StatusCodes.Status404NotFound)
        .Produces<Error>(StatusCodes.Status400BadRequest);
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

        if (result.Error == CategoryErrors.NotFound)
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

public record UpdateCategoryRequest(
    string Name,
    string Slug,
    string? Description,
    string? Icon,
    int OrderIndex,
    bool IsActive);
