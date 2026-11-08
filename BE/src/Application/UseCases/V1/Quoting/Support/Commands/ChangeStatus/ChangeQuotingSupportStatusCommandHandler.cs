namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Support.Commands.ChangeStatus;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Application.UseCases.V1.Quoting.Support.Dtos;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities.Quoting;
using TemplateLandingPage.Domain.Repositories.Quoting;
public sealed class ChangeQuotingSupportStatusCommandHandler(IQuotingSupportRepository repository, IUnitOfWork unitOfWork) : ICommandHandler<ChangeQuotingSupportStatusCommand, ChangeQuotingSupportStatusResult>
{
    #region Fields
    private readonly IQuotingSupportRepository _repository = repository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    #endregion

    #region Request handling
    public async Task<Result<ChangeQuotingSupportStatusResult>> Handle(ChangeQuotingSupportStatusCommand request, CancellationToken cancellationToken)
    {
        var support = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (support is null) return Result.Failure<ChangeQuotingSupportStatusResult>(new Error("QuotingSupport.NotFound", "Không tìm thấy yêu cầu hỗ trợ."));
        if (support.Revision != request.ExpectedRevision) return Result.Failure<ChangeQuotingSupportStatusResult>(new Error("QuotingSupport.Conflict", "Yêu cầu đã được cập nhật. Tải lại bảng trước khi đổi trạng thái."));
        support.ChangeStatus(Enum.Parse<QuotingSupportStatus>(request.Status), request.UserId);
        _repository.Update(support);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result.Success(new ChangeQuotingSupportStatusResult(QuotingSupportRequestDto.From(support)));
    }
    #endregion
}
