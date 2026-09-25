namespace TemplateLandingPage.Presentation.APIs.Admin;

using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Admin;
using TemplateLandingPage.Presentation.Abstractions;
using TemplateLandingPage.Presentation.Authorization;

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
