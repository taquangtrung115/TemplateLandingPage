namespace OnePortal.Application.UseCases.V1.Quoting.Templates.Queries;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Quoting.Templates;
using OnePortal.Domain.Repositories.Quoting;

public sealed class GetQuotationTemplateVersionQueryHandler : IQueryHandler<GetQuotationTemplateVersionQuery, QuotationTemplateVersionResponse>
{
    private readonly IQuotationTemplateRepository _templateRepository;

    public GetQuotationTemplateVersionQueryHandler(IQuotationTemplateRepository templateRepository)
    {
        _templateRepository = templateRepository;
    }

    public async Task<Result<QuotationTemplateVersionResponse>> Handle(GetQuotationTemplateVersionQuery request, CancellationToken cancellationToken)
    {
        var template = await _templateRepository.GetByIdWithVersionsAsync(request.TemplateId, cancellationToken);
        if (template is null || template.IsDeleted)
        {
            return Result.Failure<QuotationTemplateVersionResponse>(QuotationTemplateErrors.NotFound);
        }

        var targetVersion = request.Version.HasValue ? request.Version.Value : template.CurrentVersion;
        var version = template.Versions.FirstOrDefault(v => v.Version == targetVersion);

        if (version is null)
        {
            return Result.Failure<QuotationTemplateVersionResponse>(QuotationTemplateErrors.VersionNotFound);
        }

        var response = new QuotationTemplateVersionResponse(
            version.Id,
            version.TemplateId,
            version.Version,
            version.Title,
            version.SellerInfoJson,
            version.SalutationText,
            version.ColumnsConfigJson,
            version.PaymentTermsJson,
            version.SignatureConfigJson,
            version.CustomCss,
            version.IsPublished,
            version.CreatedAtUtc);

        return Result.Success(response);
    }
}
