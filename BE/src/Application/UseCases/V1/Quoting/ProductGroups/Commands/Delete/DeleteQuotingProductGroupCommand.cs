namespace TemplateLandingPage.Application.UseCases.V1.Quoting.ProductGroups.Commands.Delete;
using TemplateLandingPage.Contract.Abstractions.Message;
public sealed record DeleteQuotingProductGroupCommand(Guid Id) : ICommand<DeleteQuotingProductGroupResult>;
