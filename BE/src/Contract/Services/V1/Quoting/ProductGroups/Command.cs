namespace OnePortal.Contract.Services.V1.Quoting.ProductGroups;

using OnePortal.Contract.Abstractions.Message;

public sealed record CreateQuotingProductGroupCommand(string Code, string Name, string? Description, int SortOrder, bool IsActive = true) : ICommand<CreateQuotingProductGroupResult>;

public sealed record DeleteQuotingProductGroupCommand(Guid Id) : ICommand<DeleteQuotingProductGroupResult>;

public sealed record UpdateQuotingProductGroupCommand(Guid Id, string Code, string Name, string? Description, int SortOrder, bool IsActive = true) : ICommand<UpdateQuotingProductGroupResult>;
