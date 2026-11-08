namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Templates.Queries;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Quoting.Templates;
using TemplateLandingPage.Domain.Repositories.Quoting;

public sealed class GetQuotationTemplatesQueryHandler : IQueryHandler<GetQuotationTemplatesQuery, List<QuotationTemplateResponse>>
{
    private readonly IQuotationTemplateRepository _templateRepository;

    public GetQuotationTemplatesQueryHandler(IQuotationTemplateRepository templateRepository)
    {
        _templateRepository = templateRepository;
    }

    public async Task<Result<List<QuotationTemplateResponse>>> Handle(GetQuotationTemplatesQuery request, CancellationToken cancellationToken)
    {
        var templates = await _templateRepository.GetAllAsync(cancellationToken);
        if (!request.IncludeInactive)
        {
            templates = templates.Where(t => t.IsActive && !t.IsDeleted).ToList();
        }
        else
        {
            templates = templates.Where(t => !t.IsDeleted).ToList();
        }

        var response = templates.Select(t => new QuotationTemplateResponse(
            t.Id,
            t.Code,
            t.Name,
            t.Description,
            t.CurrentVersion,
            t.IsSystem,
            t.IsActive,
            t.CreatedAtUtc,
            t.Versions.Select(v => new QuotationTemplateVersionResponse(
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
                v.CreatedAtUtc)).ToList())).ToList();

        return Result.Success(response);
    }
}
