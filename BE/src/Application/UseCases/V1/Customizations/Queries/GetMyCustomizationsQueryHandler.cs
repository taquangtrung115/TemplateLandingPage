namespace TemplateLandingPage.Application.UseCases.V1.Customizations.Queries;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Customizations;
using TemplateLandingPage.Domain.Repositories;

public sealed class GetMyCustomizationsQueryHandler : IQueryHandler<GetMyCustomizationsQuery, List<CustomizationResponse>>
{
    private readonly ICustomizationRepository _customizationRepository;
    private readonly ITemplateRepository _templateRepository;

    public GetMyCustomizationsQueryHandler(
        ICustomizationRepository customizationRepository,
        ITemplateRepository templateRepository)
    {
        _customizationRepository = customizationRepository;
        _templateRepository = templateRepository;
    }

    public async Task<Result<List<CustomizationResponse>>> Handle(GetMyCustomizationsQuery request, CancellationToken cancellationToken)
    {
        var customizations = await _customizationRepository.GetByUserIdAsync(request.UserId, cancellationToken);
        var templates = await _templateRepository.GetAllAsync(cancellationToken);
        var templateMap = templates.ToDictionary(t => t.Id, t => t.Name);

        var response = customizations.Select(c => new CustomizationResponse(
            c.Id,
            c.UserId,
            c.TemplateId,
            templateMap.TryGetValue(c.TemplateId, out var tName) ? tName : "Template",
            c.Title,
            c.Slug,
            c.ConfigJson,
            c.IsPublished,
            c.CreatedAtUtc)).ToList();

        return Result.Success(response);
    }
}
