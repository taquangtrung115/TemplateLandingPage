namespace TemplateLandingPage.Presentation.APIs.Quoting;

using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Quoting.Templates;
using TemplateLandingPage.Presentation.Abstractions;
using TemplateLandingPage.Presentation.Authorization;

public sealed class QuotationTemplateApi : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/quoting/templates")
            .WithTags("QuotationTemplates");

        group.MapPost("", async (CreateQuotationTemplateRequest request, ClaimsPrincipal user, ISender sender, CancellationToken ct) =>
        {
            var command = new CreateQuotationTemplateCommand(
                request.Code,
                request.Name,
                request.Description,
                request.IsSystem,
                request.Title,
                request.SellerInfoJson,
                request.SalutationText,
                request.ColumnsConfigJson,
                request.PaymentTermsJson,
                request.SignatureConfigJson,
                request.CustomCss,
                UserId(user));

            var result = await sender.Send(command, ct);
            return Respond(result, StatusCodes.Status201Created);
        })
        .RequireAuthorization(AuthorizationPolicies.AdminOnly);

        group.MapGet("", async (bool? includeInactive, ISender sender, CancellationToken ct) =>
        {
            var query = new GetQuotationTemplatesQuery(includeInactive == true);
            var result = await sender.Send(query, ct);
            return Respond(result);
        })
        .RequireAuthorization();

        group.MapGet("{id:guid}", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var query = new GetQuotationTemplateByIdQuery(id);
            var result = await sender.Send(query, ct);
            return Respond(result);
        })
        .RequireAuthorization();

        group.MapGet("{id:guid}/versions/{version:int?}", async (Guid id, int? version, ISender sender, CancellationToken ct) =>
        {
            var query = new GetQuotationTemplateVersionQuery(id, version);
            var result = await sender.Send(query, ct);
            return Respond(result);
        })
        .RequireAuthorization();

        group.MapPost("{id:guid}/versions", async (Guid id, CreateTemplateVersionRequest request, ClaimsPrincipal user, ISender sender, CancellationToken ct) =>
        {
            var command = new CreateTemplateVersionCommand(
                id,
                request.Title,
                request.SellerInfoJson,
                request.SalutationText,
                request.ColumnsConfigJson,
                request.PaymentTermsJson,
                request.SignatureConfigJson,
                request.CustomCss,
                UserId(user));

            var result = await sender.Send(command, ct);
            return Respond(result, StatusCodes.Status201Created);
        })
        .RequireAuthorization(AuthorizationPolicies.AdminOnly);

        group.MapPut("{id:guid}", async (Guid id, UpdateQuotationTemplateRequest request, ISender sender, CancellationToken ct) =>
        {
            var command = new UpdateQuotationTemplateCommand(id, request.Name, request.Description, request.IsActive);
            var result = await sender.Send(command, ct);
            return Respond(result);
        })
        .RequireAuthorization(AuthorizationPolicies.AdminOnly);
    }

    private static Guid UserId(ClaimsPrincipal user) =>
        Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub"), out var id) ? id : Guid.Empty;

    private static IResult Respond<T>(Result<T> result, int status = StatusCodes.Status200OK) =>
        result.IsSuccess ? Results.Json(result, statusCode: status) : Respond((Result)result);

    private static IResult Respond(Result result)
    {
        if (result.IsSuccess) return Results.Ok(result);
        if (result is IValidationResult validation)
            return Results.BadRequest(new { title = "Validation Error", status = StatusCodes.Status400BadRequest, errors = validation.Errors });
        var status = result.Error == QuotationTemplateErrors.NotFound || result.Error == QuotationTemplateErrors.VersionNotFound ? StatusCodes.Status404NotFound :
                     result.Error == QuotationTemplateErrors.DuplicateCode ? StatusCodes.Status409Conflict :
                     StatusCodes.Status400BadRequest;
        return Results.Json(new { title = "Request failed", status, error = result.Error }, statusCode: status);
    }
}

public record CreateQuotationTemplateRequest(
    string Code,
    string Name,
    string? Description,
    bool IsSystem,
    string Title,
    string SellerInfoJson,
    string SalutationText,
    string ColumnsConfigJson,
    string PaymentTermsJson,
    string SignatureConfigJson,
    string? CustomCss);

public record CreateTemplateVersionRequest(
    string Title,
    string SellerInfoJson,
    string SalutationText,
    string ColumnsConfigJson,
    string PaymentTermsJson,
    string SignatureConfigJson,
    string? CustomCss);

public record UpdateQuotationTemplateRequest(
    string Name,
    string? Description,
    bool IsActive);
