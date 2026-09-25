namespace TemplateLandingPage.Presentation.APIs.Users;

using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Auth;
using TemplateLandingPage.Contract.Services.V1.Users;
using TemplateLandingPage.Presentation.Abstractions;
using TemplateLandingPage.Presentation.Authorization;

public sealed class UserApi : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/users")
            .WithTags("Users")
            .RequireAuthorization(AuthorizationPolicies.AdminOnly);

        group.MapGet(string.Empty, async (ISender sender) =>
        {
            var result = await sender.Send(new GetUsersQuery());
            return HandleResult(result, () => Results.Ok(result));
        })
        .WithName("GetUsers")
        .Produces<Result<List<UserResponse>>>(StatusCodes.Status200OK);

        group.MapGet("{id:guid}", async (Guid id, ISender sender) =>
        {
            var result = await sender.Send(new GetUserByIdQuery(id));
            return HandleResult(result, () => Results.Ok(result));
        })
        .WithName("GetUserById")
        .Produces<Result<UserResponse>>(StatusCodes.Status200OK)
        .Produces<Error>(StatusCodes.Status404NotFound);

        group.MapPost(string.Empty, async (CreateUserCommand command, ISender sender) =>
        {
            var result = await sender.Send(command);
            return HandleResult(result, () => Results.Created($"/api/v1/users/{result.Value}", result));
        })
        .WithName("CreateUser")
        .Produces<Result<Guid>>(StatusCodes.Status201Created)
        .Produces<ValidationResult>(StatusCodes.Status400BadRequest);

        group.MapPut("{id:guid}", async (Guid id, UpdateUserRequest request, ISender sender) =>
        {
            var command = new UpdateUserCommand(id, request.FullName, request.Role, request.IsActive);
            var result = await sender.Send(command);
            return HandleResult(result, () => Results.Ok(result));
        })
        .WithName("UpdateUser")
        .Produces<Result>(StatusCodes.Status200OK)
        .Produces<ValidationResult>(StatusCodes.Status400BadRequest)
        .Produces<Error>(StatusCodes.Status404NotFound);

        group.MapDelete("{id:guid}", async (Guid id, ClaimsPrincipal user, ISender sender) =>
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? user.FindFirst("sub")?.Value;

            Guid currentUserId = Guid.Empty;
            if (!string.IsNullOrEmpty(userIdClaim))
            {
                Guid.TryParse(userIdClaim, out currentUserId);
            }

            var result = await sender.Send(new DeleteUserCommand(id, currentUserId));
            return HandleResult(result, () => Results.Ok(result));
        })
        .WithName("DeleteUser")
        .Produces<Result>(StatusCodes.Status200OK)
        .Produces<Error>(StatusCodes.Status400BadRequest)
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

        if (result.Error == UserErrors.NotFound)
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

public record UpdateUserRequest(string FullName, string Role, bool IsActive);
