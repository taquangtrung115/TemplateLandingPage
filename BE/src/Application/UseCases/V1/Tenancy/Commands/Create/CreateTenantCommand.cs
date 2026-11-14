namespace OnePortal.Application.UseCases.V1.Tenancy.Commands.Create;

using OnePortal.Contract.Abstractions.Message;

public sealed record CreateTenantCommand(string Key, string Name, string[] Applications, string? AdminEmail) : ICommand<CreateTenantResult>;
