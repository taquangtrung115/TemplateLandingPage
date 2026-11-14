namespace OnePortal.Application.UseCases.V1.Quoting.ProductGroups.Commands.Delete;
using OnePortal.Contract.Abstractions.Message;
public sealed record DeleteQuotingProductGroupCommand(Guid Id) : ICommand<DeleteQuotingProductGroupResult>;
