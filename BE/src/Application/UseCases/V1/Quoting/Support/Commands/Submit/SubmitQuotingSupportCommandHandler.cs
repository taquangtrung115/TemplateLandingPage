namespace OnePortal.Application.UseCases.V1.Quoting.Support.Commands.Submit;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities.Quoting;
using OnePortal.Domain.Repositories.Quoting;

public sealed class SubmitQuotingSupportCommandHandler(IQuotingSupportRepository repository, IUnitOfWork unitOfWork)
    : ICommandHandler<SubmitQuotingSupportCommand, SubmitQuotingSupportResult>
{
    public async Task<Result<SubmitQuotingSupportResult>> Handle(SubmitQuotingSupportCommand request, CancellationToken cancellationToken)
    {
        var supportRequest = QuotingSupportRequest.Create(request.UserId, request.FullName, request.Email, request.Phone, request.Topic, request.Priority, request.Message);
        repository.Add(supportRequest);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success(new SubmitQuotingSupportResult(supportRequest.Id));
    }
}
