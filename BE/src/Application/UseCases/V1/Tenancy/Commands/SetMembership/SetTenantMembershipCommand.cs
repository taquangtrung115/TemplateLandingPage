namespace OnePortal.Application.UseCases.V1.Tenancy.Commands.SetMembership;

using OnePortal.Contract.Abstractions.Message;

public sealed record SetTenantMembershipCommand(Guid TenantId, string AppKey, string Email, string Role, bool IsActive) : ICommand<SetTenantMembershipResult>;
