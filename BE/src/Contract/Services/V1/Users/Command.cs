namespace TemplateLandingPage.Contract.Services.V1.Users;

using TemplateLandingPage.Contract.Abstractions.Message;

public record CreateUserCommand(string Email, string Password, string FullName, string Role) : ICommand<Guid>;

public record UpdateUserCommand(Guid Id, string FullName, string Role, bool IsActive) : ICommand;

public record DeleteUserCommand(Guid Id, Guid CurrentUserId) : ICommand;
