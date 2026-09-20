namespace TemplateLandingPage.Application.UseCases.V1.Customizations.Queries;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Customizations;
using TemplateLandingPage.Domain.Repositories;

public sealed class GetCustomizationBySlugQueryHandler : IQueryHandler<GetCustomizationBySlugQuery, CustomizationResponse>
{
    private readonly ICustomizationRepository _customizationRepository;
    private readonly ITemplateRepository _templateRepository;

    public GetCustomizationBySlugQueryHandler(
        ICustomizationRepository customizationRepository,
        ITemplateRepository templateRepository)
    {
        _customizationRepository = customizationRepository;
        _templateRepository = templateRepository;
    }

    public async Task<Result<CustomizationResponse>> Handle(GetCustomizationBySlugQuery request, CancellationToken cancellationToken)
    {
        var customization = await _customizationRepository.GetBySlugAsync(request.Slug, cancellationToken);
        if (customization is null)
        {
            return Result.Failure<CustomizationResponse>(CustomizationErrors.NotFound);
        }

        var template = await _templateRepository.GetByIdAsync(customization.TemplateId, cancellationToken);
        var templateName = template?.Name ?? "Template";

        var response = new CustomizationResponse(
            customization.Id,
            customization.UserId,
            customization.TemplateId,
            templateName,
            customization.Title,
            customization.Slug,
            customization.ConfigJson,
            customization.IsPublished,
            customization.CreatedAtUtc);

        return Result.Success(response);
    }
}
