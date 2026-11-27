namespace OnePortal.Presentation.APIs.PhotoPrint;

using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using OnePortal.Contract.Services.V1.PhotoPrint.Contact;
using OnePortal.Presentation.Abstractions;
using OnePortal.Presentation.Authorization;

public sealed class PhotoContactApi : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/photoprint").WithTags("Photo Print");
        group.MapGet("/contact-config", async (ISender sender, HttpContext context, CancellationToken ct) =>
            PhotoPrintResponse.From(await sender.Send(new GetContactConfigQuery(), ct), context))
            .AllowAnonymous();

        group.MapPut("/contact-config", async (PhotoContactInput input, ISender sender, HttpContext context, CancellationToken ct) =>
            PhotoPrintResponse.From(await sender.Send(new SaveContactConfigCommand(input), ct), context))
            .RequireAuthorization(AuthorizationPolicies.AdminOnly);
    }
}
