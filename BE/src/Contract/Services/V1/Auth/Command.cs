namespace TemplateLandingPage.Contract.Services.V1.Auth;

using TemplateLandingPage.Contract.Abstractions.Message;

public record RegisterCommand(string Email, string Password, string FullName) : ICommand<Guid>;

public record LoginCommand(string Email, string Password) : ICommand<LoginResponse>;

