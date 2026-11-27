namespace OnePortal.Application.UseCases.V1.Quoting.Support.Helpers;

using OnePortal.Contract.Services.V1.Quoting.Support;
using OnePortal.Domain.Entities.Quoting;

internal static class QuotingSupportResponseMapper
{
    public static QuotingSupportRequestDto From(QuotingSupportRequest request) => new(request.Id, request.FullName, request.Email,
        request.Phone, request.Topic, request.Priority, request.Message, request.Status.ToString(), request.Revision,
        request.CreatedAtUtc, request.UpdatedAtUtc, request.UpdatedByUserId, request.ResolvedAtUtc, request.ResolvedByUserId);
}
