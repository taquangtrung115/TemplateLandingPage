namespace TemplateLandingPage.Application.UseCases.V1.Quoting.ProductGroups.Commands.Update;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities.Quoting;
using TemplateLandingPage.Domain.Repositories.Quoting;

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
