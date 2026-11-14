namespace OnePortal.Application.UseCases.V1.Quoting.Support.Commands.Submit;

using OnePortal.Contract.Abstractions.Message;

public sealed record SubmitQuotingSupportCommand(Guid UserId, string FullName, string Email, string? Phone, string Topic, string Priority, string Message)
    : ICommand<SubmitQuotingSupportResult>;
