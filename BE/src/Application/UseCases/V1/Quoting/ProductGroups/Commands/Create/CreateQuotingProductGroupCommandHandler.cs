namespace TemplateLandingPage.Application.UseCases.V1.Quoting.ProductGroups.Commands.Create;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities.Quoting;
using TemplateLandingPage.Domain.Repositories.Quoting;

public sealed class CreateQuotingProductGroupCommandHandler(IQuotingProductGroupRepository repository, IUnitOfWork unitOfWork)
    : ICommandHandler<CreateQuotingProductGroupCommand, CreateQuotingProductGroupResult>
{
    public async Task<Result<CreateQuotingProductGroupResult>> Handle(CreateQuotingProductGroupCommand request, CancellationToken cancellationToken)
    {
        if (!await repository.IsCodeUniqueAsync(request.Code, null, cancellationToken))
            return Result.Failure<CreateQuotingProductGroupResult>(QuotingProductGroupErrors.DuplicateCode);
        var group = QuotingProductGroup.Create(request.Code, request.Name, request.Description, request.SortOrder, request.IsActive);
        repository.Add(group);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success(new CreateQuotingProductGroupResult(group.Id));
    }
}
