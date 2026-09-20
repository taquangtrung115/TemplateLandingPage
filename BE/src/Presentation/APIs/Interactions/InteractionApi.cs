namespace TemplateLandingPage.Presentation.APIs.Interactions;

using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Interactions;
using TemplateLandingPage.Presentation.Abstractions;

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
        .Produces<ValidationResult>(StatusCodes.Status400BadRequest);

        rsvpGroup.MapGet("{customizationId:guid}", async (Guid customizationId, ISender sender) =>
        {
            var result = await sender.Send(new GetRsvpsByCustomizationIdQuery(customizationId));
            return HandleResult(result, () => Results.Ok(result));
        })
        .WithName("GetRsvpsByCustomizationId")
        .Produces<Result<List<RsvpResponse>>>(StatusCodes.Status200OK);

        var guestbookGroup = app.MapGroup("/api/v1/guestbook")
            .WithTags("Guestbook");

        guestbookGroup.MapPost(string.Empty, async (SubmitGuestbookCommand command, ISender sender) =>
        {
            var result = await sender.Send(command);
            return HandleResult(result, () => Results.Created($"/api/v1/guestbook/{result.Value}", result));
        })
        .WithName("SubmitGuestbook")
        .Produces<Result<Guid>>(StatusCodes.Status201Created)
        .Produces<ValidationResult>(StatusCodes.Status400BadRequest);

        guestbookGroup.MapGet("{customizationId:guid}", async (Guid customizationId, ISender sender) =>
        {
            var result = await sender.Send(new GetGuestbookByCustomizationIdQuery(customizationId));
            return HandleResult(result, () => Results.Ok(result));
        })
        .WithName("GetGuestbookByCustomizationId")
        .Produces<Result<List<GuestbookResponse>>>(StatusCodes.Status200OK);
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

        return Results.BadRequest(new
        {
            Title = "Bad Request",
            Status = StatusCodes.Status400BadRequest,
            Error = result.Error
        });
    }
}
