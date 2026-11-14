namespace OnePortal.Application.UseCases.V1.Quoting.ProductGroups.Commands.Update;
using OnePortal.Contract.Abstractions.Message;
public sealed record UpdateQuotingProductGroupCommand(Guid Id, string Code, string Name, string? Description, int SortOrder, bool IsActive = true) : ICommand<UpdateQuotingProductGroupResult>;
