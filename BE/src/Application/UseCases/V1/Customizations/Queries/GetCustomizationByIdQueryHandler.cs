namespace TemplateLandingPage.Application.UseCases.V1.Customizations.Queries;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Customizations;
using TemplateLandingPage.Domain.Repositories;

public sealed class GetCustomizationByIdQueryHandler : IQueryHandler<GetCustomizationByIdQuery, CustomizationResponse>
{
    private readonly ICustomizationRepository _customizationRepository;
    private readonly ITemplateRepository _templateRepository;

    public GetCustomizationByIdQueryHandler(
        ICustomizationRepository customizationRepository,
        ITemplateRepository templateRepository)
    {
        _customizationRepository = customizationRepository;
        _templateRepository = templateRepository;
    }

    public async Task<Result<CustomizationResponse>> Handle(GetCustomizationByIdQuery request, CancellationToken cancellationToken)
    {
        var customization = await _customizationRepository.GetByIdAsync(request.Id, cancellationToken);
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
