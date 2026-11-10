namespace TemplateLandingPage.Application.UseCases.V1.Quoting.ProductGroups.Commands.Delete;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities.Quoting;
using TemplateLandingPage.Domain.Repositories.Quoting;

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
