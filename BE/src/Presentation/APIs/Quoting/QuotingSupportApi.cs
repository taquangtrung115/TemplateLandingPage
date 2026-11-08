namespace TemplateLandingPage.Presentation.APIs.Quoting;

using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using TemplateLandingPage.Application.UseCases.V1.Quoting.Support.Commands.Submit;
using TemplateLandingPage.Application.UseCases.V1.Quoting.Support.Commands.ChangeStatus;
using TemplateLandingPage.Application.UseCases.V1.Quoting.Support.Queries.Search;
using TemplateLandingPage.Presentation.Authorization;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Presentation.Abstractions;

public sealed class QuotingSupportApi : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/v1/quoting/support-requests", async (ISender sender, CancellationToken ct,
            string? status = null, string? searchTerm = null, string? priority = null, int page = 1, int pageSize = 20) =>
            Respond(await sender.Send(new SearchQuotingSupportQuery(status ?? "New", searchTerm, priority, page, pageSize), ct)))
            .RequireAuthorization(AuthorizationPolicies.AdminOnly).WithTags("QuotingSupport");

        app.MapPut("/api/v1/quoting/support-requests/{id:guid}/status", async (Guid id, ChangeQuotingSupportStatusRequest request, ClaimsPrincipal user, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new ChangeQuotingSupportStatusCommand(id, request.Status, request.ExpectedRevision,
                Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!)), ct)))
            .RequireAuthorization(AuthorizationPolicies.AdminOnly).WithTags("QuotingSupport");

        app.MapPost("/api/v1/quoting/support-requests", async (SubmitQuotingSupportRequest request, ClaimsPrincipal user, ISender sender, CancellationToken ct) =>
        {
            var userId = Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await sender.Send(new SubmitQuotingSupportCommand(userId, request.FullName, request.Email, request.Phone, request.Topic, request.Priority, request.Message), ct);
            if (result is IValidationResult validation) return Results.BadRequest(new { title = "Chưa thể gửi yêu cầu", errors = validation.Errors });
            return result.IsSuccess ? Results.Json(result, statusCode: StatusCodes.Status201Created) : Results.BadRequest(new { error = result.Error });
        }).RequireAuthorization().WithTags("QuotingSupport");
    }

    private static IResult Respond<T>(Result<T> result)
    {
        if (result.IsSuccess) return Results.Ok(result);
        if (result is IValidationResult validation) return Results.BadRequest(new { title = "Dữ liệu chưa hợp lệ", errors = validation.Errors });
        var status = result.Error.Code == "QuotingSupport.NotFound" ? StatusCodes.Status404NotFound : result.Error.Code == "QuotingSupport.Conflict" ? StatusCodes.Status409Conflict : StatusCodes.Status400BadRequest;
        return Results.Json(new { error = result.Error }, statusCode: status);
    }
}
