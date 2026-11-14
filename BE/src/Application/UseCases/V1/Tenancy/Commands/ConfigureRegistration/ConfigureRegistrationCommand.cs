namespace OnePortal.Application.UseCases.V1.Tenancy.Commands.ConfigureRegistration;

using OnePortal.Contract.Abstractions.Message;

public sealed record ConfigureRegistrationCommand(bool AllowSelfRegistration) : ICommand<ConfigureRegistrationResult>;
