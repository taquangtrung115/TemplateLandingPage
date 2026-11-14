namespace OnePortal.Presentation.APIs.Admin;

using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Admin;
using OnePortal.Presentation.Abstractions;
using OnePortal.Presentation.Authorization;

public sealed class AdminOverviewApi : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/v1/admin/overview", async (ISender sender) =>
        {
            var result = await sender.Send(new GetAdminOverviewQuery());
            return Results.Ok(result);
        })
        .RequireAuthorization(AuthorizationPolicies.AdminOnly)
        .WithTags("Admin")
        .WithName("GetAdminOverview")
        .Produces<Result<AdminOverviewResponse>>(StatusCodes.Status200OK);
    }
}
