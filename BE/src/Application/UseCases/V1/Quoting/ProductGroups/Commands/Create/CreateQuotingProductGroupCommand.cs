namespace TemplateLandingPage.Application.UseCases.V1.Quoting.ProductGroups.Commands.Create;
using TemplateLandingPage.Contract.Abstractions.Message;
public sealed record CreateQuotingProductGroupCommand(string Code, string Name, string? Description, int SortOrder, bool IsActive = true) : ICommand<CreateQuotingProductGroupResult>;
