namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Templates.Queries;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Quoting.Templates;
using TemplateLandingPage.Domain.Repositories.Quoting;

public sealed class GetQuotationTemplateByIdQueryHandler : IQueryHandler<GetQuotationTemplateByIdQuery, QuotationTemplateResponse>
{
    private readonly IQuotationTemplateRepository _templateRepository;

    public GetQuotationTemplateByIdQueryHandler(IQuotationTemplateRepository templateRepository)
    {
        _templateRepository = templateRepository;
    }

    public async Task<Result<QuotationTemplateResponse>> Handle(GetQuotationTemplateByIdQuery request, CancellationToken cancellationToken)
    {
        var template = await _templateRepository.GetByIdWithVersionsAsync(request.Id, cancellationToken);
        if (template is null || template.IsDeleted)
        {
            return Result.Failure<QuotationTemplateResponse>(QuotationTemplateErrors.NotFound);
        }

        var response = new QuotationTemplateResponse(
            template.Id,
            template.Code,
            template.Name,
            template.Description,
            template.CurrentVersion,
            template.IsSystem,
            template.IsActive,
            template.CreatedAtUtc,
            template.Versions.Select(v => new QuotationTemplateVersionResponse(
                v.Id,
                v.TemplateId,
                v.Version,
                v.Title,
                v.SellerInfoJson,
                v.SalutationText,
                v.ColumnsConfigJson,
                v.PaymentTermsJson,
                v.SignatureConfigJson,
                v.CustomCss,
                v.IsPublished,
                v.CreatedAtUtc)).ToList());

        return Result.Success(response);
    }
}
