namespace OnePortal.Application.UseCases.V1.Quoting.Quotations.Commands;

using Microsoft.Extensions.Logging;
using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Quoting.Quotations;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Repositories.Quoting;

public sealed class ChangeQuotationStatusCommandHandler : ICommandHandler<ChangeQuotationStatusCommand>
{
    private readonly IQuotationRepository _quotationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ChangeQuotationStatusCommandHandler> _logger;

    public ChangeQuotationStatusCommandHandler(
        IQuotationRepository quotationRepository,
        IUnitOfWork unitOfWork,
        ILogger<ChangeQuotationStatusCommandHandler> logger)
    {
        _quotationRepository = quotationRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result> Handle(ChangeQuotationStatusCommand request, CancellationToken cancellationToken)
    {
        var quotation = await _quotationRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (quotation is null || quotation.IsDeleted)
        {
            return Result.Failure(QuotationErrors.NotFound);
        }

        if (string.IsNullOrWhiteSpace(request.Status) || !new[] { "Draft", "Sent", "Approved", "Rejected", "Cancelled" }
            .Contains(request.Status.Trim(), StringComparer.OrdinalIgnoreCase))
            return Result.Failure(QuotationErrors.InvalidStatus);

        quotation.ChangeStatus(request.Status, request.UserId, request.Reason);
        _quotationRepository.Update(quotation);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Quotation {QuotationNumber} status changed to {Status}", quotation.QuotationNumber, quotation.Status);

        return Result.Success();
    }
}
