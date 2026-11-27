namespace OnePortal.Application.UseCases.V1.Commands.Quoting.ProductGroups;
using OnePortal.Contract.Services.V1.Quoting.ProductGroups;
using OnePortal.Application.UseCases.V1.Quoting.ProductGroups;
using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities.Quoting;
using OnePortal.Domain.Repositories.Quoting;

public sealed class DeleteQuotingProductGroupCommandHandler(IQuotingProductGroupRepository repository, IUnitOfWork unitOfWork)
    : ICommandHandler<DeleteQuotingProductGroupCommand, DeleteQuotingProductGroupResult>
{
    public async Task<Result<DeleteQuotingProductGroupResult>> Handle(DeleteQuotingProductGroupCommand request, CancellationToken cancellationToken)
    {
        var group = await repository.GetByIdAsync(request.Id, cancellationToken);
        if (group is null || group.IsDeleted) return Result.Failure<DeleteQuotingProductGroupResult>(QuotingProductGroupErrors.NotFound);
        if (await repository.HasProductsAsync(request.Id, cancellationToken))
            return Result.Failure<DeleteQuotingProductGroupResult>(QuotingProductGroupErrors.InUse);
        group.Delete();
        repository.Update(group);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success(new DeleteQuotingProductGroupResult(group.Id));
    }
}
