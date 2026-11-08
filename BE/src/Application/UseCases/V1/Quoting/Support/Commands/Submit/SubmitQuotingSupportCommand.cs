namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Support.Commands.Submit;

using TemplateLandingPage.Contract.Abstractions.Message;

public sealed record SubmitQuotingSupportCommand(Guid UserId, string FullName, string Email, string? Phone, string Topic, string Priority, string Message)
    : ICommand<SubmitQuotingSupportResult>;
