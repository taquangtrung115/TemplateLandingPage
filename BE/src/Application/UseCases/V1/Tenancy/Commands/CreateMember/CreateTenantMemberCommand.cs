namespace OnePortal.Application.UseCases.V1.Tenancy.Commands.CreateMember;

using OnePortal.Contract.Abstractions.Message;

public sealed record CreateTenantMemberCommand(Guid TenantId, string AppKey, string Email, string FullName, string Password, string Role) : ICommand<CreateTenantMemberResult>;
