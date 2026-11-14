namespace OnePortal.Application.UseCases.V1.Tenancy.Commands.ConfigureApplication;

using OnePortal.Contract.Abstractions.Message;

public sealed record ConfigureTenantApplicationCommand(Guid TenantId, string AppKey, bool IsEnabled, bool AllowSelfRegistration) : ICommand<ConfigureTenantApplicationResult>;
