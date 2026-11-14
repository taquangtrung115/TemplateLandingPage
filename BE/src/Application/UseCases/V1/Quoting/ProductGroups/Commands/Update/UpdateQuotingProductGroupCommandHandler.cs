namespace OnePortal.Application.UseCases.V1.Quoting.ProductGroups.Commands.Update;
using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities.Quoting;
using OnePortal.Domain.Repositories.Quoting;

public sealed class UpdateQuotingProductGroupCommandHandler(IQuotingProductGroupRepository repository, IUnitOfWork unitOfWork)
    : ICommandHandler<UpdateQuotingProductGroupCommand, UpdateQuotingProductGroupResult>
{
    public async Task<Result<UpdateQuotingProductGroupResult>> Handle(UpdateQuotingProductGroupCommand request, CancellationToken cancellationToken)
    {
        var group = await repository.GetByIdAsync(request.Id, cancellationToken);
        if (group is null || group.IsDeleted) return Result.Failure<UpdateQuotingProductGroupResult>(QuotingProductGroupErrors.NotFound);
        if (!await repository.IsCodeUniqueAsync(request.Code, request.Id, cancellationToken))
            return Result.Failure<UpdateQuotingProductGroupResult>(QuotingProductGroupErrors.DuplicateCode);
        group.Update(request.Code, request.Name, request.Description, request.SortOrder, request.IsActive);
        repository.Update(group);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success(new UpdateQuotingProductGroupResult(group.Id));
    }
}
