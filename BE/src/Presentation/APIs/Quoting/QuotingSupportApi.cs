namespace TemplateLandingPage.Presentation.APIs.Quoting;

using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using TemplateLandingPage.Application.UseCases.V1.Quoting.Support.Commands.Submit;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Presentation.Abstractions;

public sealed class QuotingSupportApi : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/v1/quoting/support-requests", async (SubmitQuotingSupportRequest request, ClaimsPrincipal user, ISender sender, CancellationToken ct) =>
        {
            var userId = Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await sender.Send(new SubmitQuotingSupportCommand(userId, request.FullName, request.Email, request.Phone, request.Topic, request.Priority, request.Message), ct);
            if (result is IValidationResult validation) return Results.BadRequest(new { title = "Chưa thể gửi yêu cầu", errors = validation.Errors });
            return result.IsSuccess ? Results.Json(result, statusCode: StatusCodes.Status201Created) : Results.BadRequest(new { error = result.Error });
        }).RequireAuthorization().WithTags("QuotingSupport");
    }
}
