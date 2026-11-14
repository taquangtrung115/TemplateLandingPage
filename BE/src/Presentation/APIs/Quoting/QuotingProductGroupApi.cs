namespace OnePortal.Presentation.APIs.Quoting;

using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using OnePortal.Application.UseCases.V1.Quoting.ProductGroups.Commands.Create;
using OnePortal.Application.UseCases.V1.Quoting.ProductGroups.Commands.Update;
using OnePortal.Application.UseCases.V1.Quoting.ProductGroups.Commands.Delete;
using OnePortal.Application.UseCases.V1.Quoting.ProductGroups.Queries.Search;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Presentation.Abstractions;
using OnePortal.Presentation.Authorization;

public sealed class QuotingProductGroupApi : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/quoting/product-groups").WithTags("QuotingProductGroups").RequireAuthorization();
        group.MapGet("", async (bool? includeInactive, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new SearchQuotingProductGroupsQuery(includeInactive == true), ct)));
        group.MapPost("", async (CreateQuotingProductGroupCommand request, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(request, ct), StatusCodes.Status201Created)).RequireAuthorization(AuthorizationPolicies.AdminOnly);
        group.MapPut("{id:guid}", async (Guid id, UpdateQuotingProductGroupCommand request, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(request with { Id = id }, ct))).RequireAuthorization(AuthorizationPolicies.AdminOnly);
        group.MapDelete("{id:guid}", async (Guid id, ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new DeleteQuotingProductGroupCommand(id), ct))).RequireAuthorization(AuthorizationPolicies.AdminOnly);
    }

    private static IResult Respond<T>(Result<T> result, int status = StatusCodes.Status200OK)
    {
        if (result.IsSuccess) return Results.Json(result, statusCode: status);
        if (result is IValidationResult validation)
            return Results.BadRequest(new { title = "Validation Error", errors = validation.Errors });
        var errorStatus = result.Error.Code.EndsWith("NotFound") ? StatusCodes.Status404NotFound :
            result.Error.Code.EndsWith("DuplicateCode") || result.Error.Code.EndsWith("InUse") ? StatusCodes.Status409Conflict : StatusCodes.Status400BadRequest;
        return Results.Json(new { title = "Request failed", error = result.Error }, statusCode: errorStatus);
    }
}
