namespace OnePortal.Application.UseCases.V1.Quoting.Quotations.Commands;

using Microsoft.Extensions.Logging;
using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Quoting.Quotations;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Repositories.Quoting;

public sealed class DeleteQuotationCommandHandler : ICommandHandler<DeleteQuotationCommand>
{
    private readonly IQuotationRepository _quotationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<DeleteQuotationCommandHandler> _logger;

    public DeleteQuotationCommandHandler(
        IQuotationRepository quotationRepository,
        IUnitOfWork unitOfWork,
        ILogger<DeleteQuotationCommandHandler> logger)
    {
        _quotationRepository = quotationRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteQuotationCommand request, CancellationToken cancellationToken)
    {
        var quotation = await _quotationRepository.GetByIdAsync(request.Id, cancellationToken);
        if (quotation is null || quotation.IsDeleted)
        {
            return Result.Failure(QuotationErrors.NotFound);
        }

        quotation.Delete();
        _quotationRepository.Update(quotation);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Quotation {QuotationNumber} deleted successfully", quotation.QuotationNumber);

        return Result.Success();
    }
}
