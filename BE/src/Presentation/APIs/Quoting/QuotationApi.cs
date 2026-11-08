namespace TemplateLandingPage.Presentation.APIs.Quoting;

using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Quoting.Quotations;
using TemplateLandingPage.Application.UseCases.V1.Quoting.Quotations.Queries.Download;
using TemplateLandingPage.Application.UseCases.V1.Quoting.Quotations.Queries.Summary;
using TemplateLandingPage.Presentation.Abstractions;

public sealed class QuotationApi : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/quoting/quotations")
            .WithTags("Quotations")
            .RequireAuthorization();

        group.MapGet("summary", async (ISender sender, CancellationToken ct) =>
            Respond(await sender.Send(new GetQuotationSummaryQuery(), ct)));

        group.MapGet("{id:guid}/files/{fileId:guid}/download", async (Guid id, Guid fileId, ISender sender, CancellationToken ct) =>
        {
            var result = await sender.Send(new DownloadQuotationFileQuery(id, fileId), ct);
            if (result.IsFailure) return Respond((Result)result);
            return Results.File(result.Value.Content, result.Value.ContentType, result.Value.FileName);
        });

        group.MapPost("", async (CreateQuotationRequest request, ClaimsPrincipal user, ISender sender, CancellationToken ct) =>
        {
            var command = new CreateQuotationCommand(
                request.CustomerId,
                request.TemplateId,
                request.TemplateVersion,
                request.IssueDate,
                request.ValidUntil,
                request.DiscountPercent,
                request.TaxPercent,
                request.Notes,
                request.Items ?? new(),
                UserId(user));

            var result = await sender.Send(command, ct);
            return Respond(result, StatusCodes.Status201Created);
        });

        group.MapGet("", async (string? status, Guid? customerId, string? search, int? page, int? pageSize, ISender sender, CancellationToken ct) =>
        {
            var query = new GetQuotationsQuery(status, customerId, search, page ?? 1, pageSize ?? 20);
            var result = await sender.Send(query, ct);
            return Respond(result);
        });

        group.MapGet("{id:guid}", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var query = new GetQuotationByIdQuery(id);
            var result = await sender.Send(query, ct);
            return Respond(result);
        });

        group.MapPut("{id:guid}", async (Guid id, UpdateQuotationRequest request, ClaimsPrincipal user, ISender sender, CancellationToken ct) =>
        {
            var command = new UpdateQuotationCommand(
                id,
                request.CustomerId,
                request.IssueDate,
                request.ValidUntil,
                request.DiscountPercent,
                request.TaxPercent,
                request.Notes,
                request.Items ?? new(),
                UserId(user));

            var result = await sender.Send(command, ct);
            return Respond(result);
        });

        group.MapPut("{id:guid}/status", async (Guid id, ChangeQuotationStatusRequest request, ClaimsPrincipal user, ISender sender, CancellationToken ct) =>
        {
            var command = new ChangeQuotationStatusCommand(id, request.Status, request.Reason, UserId(user));
            var result = await sender.Send(command, ct);
            return Respond(result);
        });

        group.MapDelete("{id:guid}", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var command = new DeleteQuotationCommand(id);
            var result = await sender.Send(command, ct);
            return Respond(result);
        });

        group.MapPost("{id:guid}/export", async (Guid id, ExportQuotationRequest request, ClaimsPrincipal user, ISender sender, CancellationToken ct) =>
        {
            var command = new ExportQuotationFileCommand(id, request.FileType, UserId(user), request.TaxPercent);
            var result = await sender.Send(command, ct);
            return Respond(result);
        });

        group.MapGet("{id:guid}/preview", async (Guid id, decimal? taxPercent, ISender sender, CancellationToken ct) =>
        {
            var query = new PreviewQuotationQuery(id, taxPercent);
            var result = await sender.Send(query, ct);
            return Respond(result);
        });

        group.MapGet("{id:guid}/histories", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var query = new GetQuotationHistoriesQuery(id);
            var result = await sender.Send(query, ct);
            return Respond(result);
        });

        group.MapGet("{id:guid}/files", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var query = new GetQuotationFilesQuery(id);
            var result = await sender.Send(query, ct);
            return Respond(result);
        });
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
        var status = result.Error == QuotationErrors.NotFound || result.Error == QuotationErrors.FileNotFound ? StatusCodes.Status404NotFound :
                     result.Error == QuotationErrors.CannotEditNonDraft ? StatusCodes.Status400BadRequest :
                     StatusCodes.Status400BadRequest;
        return Results.Json(new { title = "Request failed", status, error = result.Error }, statusCode: status);
    }
}

public record CreateQuotationRequest(
    Guid? CustomerId = null,
    Guid? TemplateId = null,
    int? TemplateVersion = null,
    DateTime IssueDate = default,
    DateTime? ValidUntil = null,
    decimal DiscountPercent = 0,
    decimal TaxPercent = 0,
    string? Notes = null,
    List<QuotationItemDto>? Items = null);

public record UpdateQuotationRequest(
    Guid? CustomerId,
    DateTime IssueDate,
    DateTime? ValidUntil,
    decimal DiscountPercent,
    decimal TaxPercent,
    string? Notes,
    List<QuotationItemDto> Items);

public record ChangeQuotationStatusRequest(string Status, string? Reason = null);

public record ExportQuotationRequest(string FileType = "pdf", decimal? TaxPercent = null);
