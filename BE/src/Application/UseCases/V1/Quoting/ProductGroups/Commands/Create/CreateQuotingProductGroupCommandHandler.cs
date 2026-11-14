namespace OnePortal.Application.UseCases.V1.Quoting.ProductGroups.Commands.Create;
using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities.Quoting;
using OnePortal.Domain.Repositories.Quoting;

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
