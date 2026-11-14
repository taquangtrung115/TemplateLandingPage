namespace OnePortal.Application.UseCases.V1.Tenancy.Commands.Update;

using OnePortal.Contract.Abstractions.Message;

public sealed record UpdateTenantCommand(Guid TenantId, string Name, bool IsActive) : ICommand<UpdateTenantResult>;
