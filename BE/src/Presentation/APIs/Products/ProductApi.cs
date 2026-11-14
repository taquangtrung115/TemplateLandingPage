namespace OnePortal.Presentation.APIs.Products;

using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Products;
using OnePortal.Presentation.Abstractions;
using OnePortal.Presentation.Authorization;
using System.Security.Claims;

public sealed class ProductApi : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/products")
            .WithTags("Products");

        group.MapPost(string.Empty, async (CreateProductCommand command, ISender sender) =>
        {
            var result = await sender.Send(command);
            return HandleResult(result, () => Results.Created($"/api/v1/products/{result.Value}", result));
        })
        .RequireAuthorization(AuthorizationPolicies.AdminOnly)
        .WithName("CreateProduct")
        .Produces<Result<Guid>>(StatusCodes.Status201Created)
        .Produces<ValidationResult>(StatusCodes.Status400BadRequest);

        group.MapGet(string.Empty, async (bool? includeInactive, ClaimsPrincipal user, ISender sender) =>
        {
            var result = await sender.Send(new GetProductsQuery(includeInactive == true && user.IsInRole("Admin")));
            return HandleResult(result, () => Results.Ok(result));
        })
        .WithName("GetProducts")
        .Produces<Result<List<ProductResponse>>>(StatusCodes.Status200OK);

        group.MapGet("{id:guid}", async (Guid id, ClaimsPrincipal user, ISender sender) =>
        {
            var result = await sender.Send(new GetProductByIdQuery(id, user.IsInRole("Admin")));
            return HandleResult(result, () => Results.Ok(result));
        })
        .WithName("GetProductById")
        .Produces<Result<ProductResponse>>(StatusCodes.Status200OK)
        .Produces<Error>(StatusCodes.Status404NotFound);

        group.MapPut("{id:guid}", async (Guid id, UpdateProductRequest request, ISender sender) =>
        {
            var command = new UpdateProductCommand(id, request.Name, request.Description, request.Price, request.IsActive);
            var result = await sender.Send(command);
            return HandleResult(result, () => Results.Ok(result));
        })
        .RequireAuthorization(AuthorizationPolicies.AdminOnly)
        .WithName("UpdateProduct")
        .Produces<Result>(StatusCodes.Status200OK)
        .Produces<ValidationResult>(StatusCodes.Status400BadRequest)
        .Produces<Error>(StatusCodes.Status404NotFound);

        group.MapDelete("{id:guid}", async (Guid id, ISender sender) =>
        {
            var result = await sender.Send(new DeleteProductCommand(id));
            return HandleResult(result, () => Results.Ok(result));
        })
        .RequireAuthorization(AuthorizationPolicies.AdminOnly)
        .WithName("DeleteProduct")
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

        if (result.Error == ProductErrors.NotFound)
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

public record UpdateProductRequest(string Name, string? Description, decimal Price, bool IsActive);
