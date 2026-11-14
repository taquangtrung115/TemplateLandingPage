namespace OnePortal.Presentation.APIs.NavigationMenus;

using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.NavigationMenus;
using OnePortal.Presentation.Abstractions;
using OnePortal.Presentation.Authorization;
using System.Security.Claims;

public sealed class NavigationMenuApi : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/menus")
            .WithTags("NavigationMenus");

        group.MapGet(string.Empty, async (bool? isActiveOnly, ClaimsPrincipal user, ISender sender) =>
        {
            var includeInactive = isActiveOnly == false && user.IsInRole("Admin");
            var result = await sender.Send(new GetNavigationMenusQuery(!includeInactive));
            return HandleResult(result, () => Results.Ok(result));
        })
        .WithName("GetNavigationMenus")
        .Produces<Result<List<NavigationMenuResponse>>>(StatusCodes.Status200OK);

        group.MapGet("{id:guid}", async (Guid id, ClaimsPrincipal user, ISender sender) =>
        {
            var result = await sender.Send(new GetNavigationMenuByIdQuery(id, user.IsInRole("Admin")));
            return HandleResult(result, () => Results.Ok(result));
        })
        .WithName("GetNavigationMenuById")
        .Produces<Result<NavigationMenuResponse>>(StatusCodes.Status200OK)
        .Produces<Error>(StatusCodes.Status404NotFound);

        group.MapPost(string.Empty, async (CreateNavigationMenuCommand command, ISender sender) =>
        {
            var result = await sender.Send(command);
            return HandleResult(result, () => Results.Created($"/api/v1/menus/{result.Value}", result));
        })
        .RequireAuthorization(AuthorizationPolicies.AdminOnly)
        .WithName("CreateNavigationMenu")
        .Produces<Result<Guid>>(StatusCodes.Status201Created)
        .Produces<ValidationResult>(StatusCodes.Status400BadRequest);

        group.MapPut("{id:guid}", async (Guid id, UpdateNavigationMenuRequest request, ISender sender) =>
        {
            var command = new UpdateNavigationMenuCommand(
                id,
                request.Title,
                request.Url,
                request.ParentId,
                request.OrderIndex,
                request.Target,
                request.Badge,
                request.BadgeColor,
                request.Icon,
                request.IsActive);

            var result = await sender.Send(command);
            return HandleResult(result, () => Results.Ok(result));
        })
        .RequireAuthorization(AuthorizationPolicies.AdminOnly)
        .WithName("UpdateNavigationMenu")
        .Produces<Result>(StatusCodes.Status200OK)
        .Produces<ValidationResult>(StatusCodes.Status400BadRequest)
        .Produces<Error>(StatusCodes.Status404NotFound);

        group.MapDelete("{id:guid}", async (Guid id, ISender sender) =>
        {
            var result = await sender.Send(new DeleteNavigationMenuCommand(id));
            return HandleResult(result, () => Results.Ok(result));
        })
        .RequireAuthorization(AuthorizationPolicies.AdminOnly)
        .WithName("DeleteNavigationMenu")
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

        if (result.Error == NavigationMenuErrors.NotFound)
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

public record UpdateNavigationMenuRequest(
    string Title,
    string Url,
    Guid? ParentId,
    int OrderIndex,
    string? Target,
    string? Badge,
    string? BadgeColor,
    string? Icon,
    bool IsActive);
