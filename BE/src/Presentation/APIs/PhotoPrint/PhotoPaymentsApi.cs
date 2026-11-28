namespace OnePortal.Presentation.APIs.PhotoPrint;

using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using OnePortal.Contract.Services.V1.PhotoPrint.Payments;
using OnePortal.Presentation.Abstractions;
using OnePortal.Presentation.Authorization;

public sealed class PhotoPaymentsApi : IEndpoint
{
    public const string ConfirmRatePolicy = "photoprint-vietqr-confirm";

    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/photoprint/payments").WithTags("Photo Print");
        group.MapPost("/vietqr-confirm", async (ConfirmVietQrPaymentInput input, ISender sender, HttpContext context, CancellationToken ct) =>
            PhotoPrintResponse.From(await sender.Send(new ConfirmVietQrPaymentCommand(input), ct), context))
            .AllowAnonymous().RequireRateLimiting(ConfirmRatePolicy);

        group.MapGet("", async (string? search, string? status, int? page, int? pageSize, ISender sender, HttpContext context, CancellationToken ct) =>
            PhotoPrintResponse.From(await sender.Send(new GetPhotoPaymentsQuery(new PhotoPaymentFilter(search, status, page ?? 1, pageSize ?? 20)), ct), context))
            .RequireAuthorization(AuthorizationPolicies.AdminOnly);

        group.MapPut("/{id:guid}/verify", async (Guid id, VerifyPhotoPaymentInput input, ISender sender, HttpContext context, CancellationToken ct) =>
            PhotoPrintResponse.From(await sender.Send(new VerifyPhotoPaymentCommand(id, input), ct), context))
            .RequireAuthorization(AuthorizationPolicies.AdminOnly);
    }
}
