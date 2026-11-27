namespace OnePortal.Contract.Services.V1.Quoting.Support;

using OnePortal.Contract.Abstractions.Message;

public sealed record ChangeQuotingSupportStatusCommand(Guid Id, string Status, int ExpectedRevision, Guid UserId) : ICommand<ChangeQuotingSupportStatusResult>;

public sealed record SubmitQuotingSupportCommand(Guid UserId, string FullName, string Email, string? Phone, string Topic, string Priority, string Message)
    : ICommand<SubmitQuotingSupportResult>;
