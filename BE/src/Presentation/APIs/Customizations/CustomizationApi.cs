namespace TemplateLandingPage.Presentation.APIs.Customizations;

using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Customizations;
using TemplateLandingPage.Presentation.Abstractions;

public sealed class CustomizationApi : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/customizations").WithTags("Customizations");

        group.MapGet("slug/{slug}", async (string slug, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new GetCustomizationBySlugQuery(slug), ct))).AllowAnonymous();

        group.MapGet("slug/{slug}/versions/{number:int}", async (string slug, int number, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new GetCustomizationBySlugQuery(slug, number), ct))).AllowAnonymous();

        group.MapGet("my", async (int? page, int? pageSize, ClaimsPrincipal user, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new GetMyCustomizationsQuery(UserId(user), page ?? 1, pageSize ?? 20), ct))).RequireAuthorization();

        group.MapGet("{id:guid}", async (Guid id, ClaimsPrincipal user, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new GetCustomizationByIdQuery(id, UserId(user), Role(user)), ct))).RequireAuthorization();

        group.MapPost("", async (CreateCustomizationRequest request, ClaimsPrincipal user, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new CreateCustomizationCommand(UserId(user), request.TemplateId,
                request.Title, request.Slug, request.ConfigJson, false, request.ClientDraftId), ct), StatusCodes.Status201Created)).RequireAuthorization();

        group.MapPut("{id:guid}", async (Guid id, UpdateCustomizationRequest request, ClaimsPrincipal user, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new UpdateCustomizationCommand(id, request.Title, request.Slug, request.ConfigJson,
                false, UserId(user), Role(user), request.ExpectedRevision, request.RequestId), ct))).RequireAuthorization();

        group.MapDelete("{id:guid}", async (Guid id, int? expectedRevision, ClaimsPrincipal user, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new DeleteCustomizationCommand(id, UserId(user), Role(user), expectedRevision), ct))).RequireAuthorization();

        group.MapGet("{id:guid}/versions", async (Guid id, int? page, int? pageSize, ClaimsPrincipal user, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new GetCustomizationVersionsQuery(id, UserId(user), Role(user), page ?? 1, pageSize ?? 20), ct))).RequireAuthorization();

        group.MapGet("{id:guid}/versions/{versionId:guid}", async (Guid id, Guid versionId, ClaimsPrincipal user, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new GetCustomizationVersionQuery(id, versionId, UserId(user), Role(user)), ct))).RequireAuthorization();

        group.MapPost("{id:guid}/versions", async (Guid id, CreateVersionRequest request, ClaimsPrincipal user, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new CreateCustomizationVersionCommand(id, request.Title, request.Slug, request.ConfigJson,
                request.ExpectedRevision, request.RequestId, UserId(user), Role(user)), ct), StatusCodes.Status201Created)).RequireAuthorization();

        group.MapPut("{id:guid}/publication", async (Guid id, PublicationRequest request, ClaimsPrincipal user, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new SetCustomizationPublicationCommand(id, request.VersionId,
                request.ExpectedRevision, UserId(user), Role(user)), ct))).RequireAuthorization();

        group.MapDelete("{id:guid}/publication", async (Guid id, int expectedRevision, ClaimsPrincipal user, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new RemoveCustomizationPublicationCommand(id, null, expectedRevision, UserId(user), Role(user)), ct))).RequireAuthorization();

        group.MapDelete("{id:guid}/versions/{versionId:guid}/publication", async (Guid id, Guid versionId, int expectedRevision, ClaimsPrincipal user, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new RemoveCustomizationPublicationCommand(id, versionId, expectedRevision, UserId(user), Role(user)), ct))).RequireAuthorization();

        var admin = app.MapGroup("/api/v1/admin/customizations").WithTags("Administration").RequireAuthorization("Admin");
        admin.MapGet("", async (bool? ownerless, int? page, int? pageSize, ClaimsPrincipal user, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new SearchAdminCustomizationsQuery(UserId(user), Role(user), ownerless ?? true, page ?? 1, pageSize ?? 20), ct)));
        admin.MapPut("{id:guid}/owner", async (Guid id, AssignOwnerRequest request, ClaimsPrincipal user, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new AssignCustomizationOwnerCommand(id, request.UserId, request.ExpectedRevision, UserId(user), Role(user)), ct)));
    }

    private static Guid UserId(ClaimsPrincipal user) =>
        Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub"), out var id) ? id : Guid.Empty;

    private static string Role(ClaimsPrincipal user) => user.FindFirstValue(ClaimTypes.Role) ?? "User";

    private static IResult Respond<T>(Result<T> result, int status = StatusCodes.Status200OK) =>
        result.IsSuccess ? Results.Json(result, statusCode: status) : Respond((Result)result);

    private static IResult Respond(Result result)
    {
        if (result.IsSuccess) return Results.Ok(result);
        if (result is IValidationResult validation)
            return Results.BadRequest(new { title = "Validation Error", status = 400, errors = validation.Errors });
        var status = result.Error == CustomizationErrors.NotFound ? 404 :
            result.Error == CustomizationErrors.Unauthorized ? 403 :
            result.Error == CustomizationErrors.Conflict || result.Error == CustomizationErrors.DuplicateSlug ? 409 : 400;
        return Results.Json(new { title = "Request failed", status, error = result.Error }, statusCode: status);
    }
}
