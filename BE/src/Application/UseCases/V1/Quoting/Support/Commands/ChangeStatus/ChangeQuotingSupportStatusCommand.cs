namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Support.Commands.ChangeStatus;
using TemplateLandingPage.Contract.Abstractions.Message;
public sealed record ChangeQuotingSupportStatusCommand(Guid Id, string Status, int ExpectedRevision, Guid UserId) : ICommand<ChangeQuotingSupportStatusResult>;
