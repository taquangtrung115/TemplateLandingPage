namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Quotations.Queries;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Quoting.Quotations;
using TemplateLandingPage.Domain.Repositories.Quoting;

public sealed class GetQuotationFilesQueryHandler : IQueryHandler<GetQuotationFilesQuery, List<QuotationFileResponse>>
{
    private readonly IQuotationRepository _quotationRepository;

    public GetQuotationFilesQueryHandler(IQuotationRepository quotationRepository)
    {
        _quotationRepository = quotationRepository;
    }

    public async Task<Result<List<QuotationFileResponse>>> Handle(GetQuotationFilesQuery request, CancellationToken cancellationToken)
    {
        var quotation = await _quotationRepository.GetByIdForReadAsync(request.QuotationId, cancellationToken);
        if (quotation is null || quotation.IsDeleted)
        {
            return Result.Failure<List<QuotationFileResponse>>(QuotationErrors.NotFound);
        }

        var response = quotation.Files
            .OrderByDescending(f => f.CreatedAtUtc)
            .Select(f => new QuotationFileResponse(
                f.Id,
                f.QuotationId,
                f.FileName,
                f.FileType,
                f.FileUrl,
                f.FileSize,
                f.StorageProvider,
                f.CreatedAtUtc))
            .ToList();

        return Result.Success(response);
    }
}
