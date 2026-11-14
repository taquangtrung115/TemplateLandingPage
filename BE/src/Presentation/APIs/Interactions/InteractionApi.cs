namespace OnePortal.Presentation.APIs.Interactions;

using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Interactions;
using OnePortal.Presentation.Abstractions;

public sealed class InteractionApi : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var rsvpGroup = app.MapGroup("/api/v1/rsvp")
            .WithTags("RSVP");

        rsvpGroup.MapPost(string.Empty, async (SubmitRsvpCommand command, ISender sender) =>
        {
            var result = await sender.Send(command);
            return HandleResult(result, () => Results.Created($"/api/v1/rsvp/{result.Value}", result));
        })
        .WithName("SubmitRsvp")
        .Produces<Result<Guid>>(StatusCodes.Status201Created)
        .Produces<ValidationResult>(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status404NotFound);

        rsvpGroup.MapGet("{customizationId:guid}", async (
            Guid customizationId,
            Guid? versionId,
            ClaimsPrincipal user,
            ISender sender,
            int page = 1,
            int pageSize = 20) =>
        {
            var result = await sender.Send(new GetRsvpsByCustomizationIdQuery(
                customizationId,
                versionId,
                page,
                pageSize,
                TryGetUserId(user),
                user.IsInRole("Admin")));
            return HandleResult(result, () => Results.Ok(result));
        })
        .RequireAuthorization()
        .WithName("GetRsvpsByCustomizationId")
        .Produces<Result<PagedResponse<RsvpResponse>>>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status401Unauthorized)
        .Produces(StatusCodes.Status403Forbidden);

        var guestbookGroup = app.MapGroup("/api/v1/guestbook")
            .WithTags("Guestbook");

        guestbookGroup.MapPost(string.Empty, async (SubmitGuestbookCommand command, ISender sender) =>
        {
            var result = await sender.Send(command);
            return HandleResult(result, () => Results.Created($"/api/v1/guestbook/{result.Value}", result));
        })
        .WithName("SubmitGuestbook")
        .Produces<Result<Guid>>(StatusCodes.Status201Created)
        .Produces<ValidationResult>(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status404NotFound);

        guestbookGroup.MapGet("{customizationId:guid}", async (
            Guid customizationId,
            Guid? versionId,
            ClaimsPrincipal user,
            ISender sender,
            int page = 1,
            int pageSize = 20) =>
        {
            var result = await sender.Send(new GetGuestbookByCustomizationIdQuery(
                customizationId,
                versionId,
                page,
                pageSize,
                TryGetUserId(user),
                user.IsInRole("Admin")));
            return HandleResult(result, () => Results.Ok(result));
        })
        .WithName("GetGuestbookByCustomizationId")
        .Produces<Result<PagedResponse<GuestbookResponse>>>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);
    }

    private static Guid? TryGetUserId(ClaimsPrincipal user)
    {
        var userIdValue = user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? user.FindFirst("sub")?.Value;
        return Guid.TryParse(userIdValue, out var userId) ? userId : null;
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

        if (result.Error == InteractionErrors.NotFound || result.Error == InteractionErrors.VersionUnavailable)
        {
            return Results.NotFound(new
            {
                Title = "Not Found",
                Status = StatusCodes.Status404NotFound,
                Error = result.Error
            });
        }

        if (result.Error == InteractionErrors.AccessDenied)
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
