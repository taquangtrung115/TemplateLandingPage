namespace OnePortal.Application.UseCases.V1.Quoting.Support.Dtos;

using OnePortal.Domain.Entities.Quoting;

public sealed record QuotingSupportRequestDto(Guid Id, string FullName, string Email, string? Phone, string Topic, string Priority,
    string Message, string Status, int Revision, DateTime CreatedAtUtc, DateTime? UpdatedAtUtc, Guid? UpdatedByUserId, DateTime? ResolvedAtUtc, Guid? ResolvedByUserId)
{
    public static QuotingSupportRequestDto From(QuotingSupportRequest request) => new(request.Id, request.FullName, request.Email,
        request.Phone, request.Topic, request.Priority, request.Message, request.Status.ToString(), request.Revision,
        request.CreatedAtUtc, request.UpdatedAtUtc, request.UpdatedByUserId, request.ResolvedAtUtc, request.ResolvedByUserId);
}
