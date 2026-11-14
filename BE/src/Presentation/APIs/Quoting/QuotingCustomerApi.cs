namespace OnePortal.Presentation.APIs.Quoting;

using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Quoting.Customers;
using OnePortal.Presentation.Abstractions;

public sealed class QuotingCustomerApi : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/quoting/customers")
            .WithTags("QuotingCustomers")
            .RequireAuthorization();

        group.MapPost("", async (CreateQuotingCustomerRequest request, ISender sender, CancellationToken ct) =>
        {
            var command = new CreateQuotingCustomerCommand(
                request.Name,
                request.ContactPerson,
                request.Phone,
                request.Email,
                request.Address,
                request.TaxCode,
                request.Notes);

            var result = await sender.Send(command, ct);
            return Respond(result, StatusCodes.Status201Created);
        });

        group.MapGet("", async (string? search, bool? includeInactive, ISender sender, CancellationToken ct) =>
        {
            var query = new GetQuotingCustomersQuery(search, includeInactive == true);
            var result = await sender.Send(query, ct);
            return Respond(result);
        });

        group.MapGet("{id:guid}", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var query = new GetQuotingCustomerByIdQuery(id);
            var result = await sender.Send(query, ct);
            return Respond(result);
        });

        group.MapPut("{id:guid}", async (Guid id, UpdateQuotingCustomerRequest request, ISender sender, CancellationToken ct) =>
        {
            var command = new UpdateQuotingCustomerCommand(
                id,
                request.Name,
                request.ContactPerson,
                request.Phone,
                request.Email,
                request.Address,
                request.TaxCode,
                request.Notes,
                request.IsActive);

            var result = await sender.Send(command, ct);
            return Respond(result);
        });

        group.MapDelete("{id:guid}", async (Guid id, ISender sender, CancellationToken ct) =>
        {
            var command = new DeleteQuotingCustomerCommand(id);
            var result = await sender.Send(command, ct);
            return Respond(result);
        });
    }

    private static IResult Respond<T>(Result<T> result, int status = StatusCodes.Status200OK) =>
        result.IsSuccess ? Results.Json(result, statusCode: status) : Respond((Result)result);

    private static IResult Respond(Result result)
    {
        if (result.IsSuccess) return Results.Ok(result);
        if (result is IValidationResult validation)
            return Results.BadRequest(new { title = "Validation Error", status = StatusCodes.Status400BadRequest, errors = validation.Errors });
        var status = result.Error == QuotingCustomerErrors.NotFound ? StatusCodes.Status404NotFound : StatusCodes.Status400BadRequest;
        return Results.Json(new { title = "Request failed", status, error = result.Error }, statusCode: status);
    }
}

public record CreateQuotingCustomerRequest(
    string Name,
    string? ContactPerson,
    string Phone,
    string? Email,
    string? Address,
    string? TaxCode,
    string? Notes);

public record UpdateQuotingCustomerRequest(
    string Name,
    string? ContactPerson,
    string Phone,
    string? Email,
    string? Address,
    string? TaxCode,
    string? Notes,
    bool IsActive);
