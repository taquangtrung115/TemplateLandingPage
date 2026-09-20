namespace TemplateLandingPage.Application.UseCases.V1.Templates.Queries;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Templates;
using TemplateLandingPage.Domain.Repositories;

public sealed class GetTemplatesQueryHandler : IQueryHandler<GetTemplatesQuery, List<TemplateResponse>>
{
    private readonly ITemplateRepository _templateRepository;

    public GetTemplatesQueryHandler(ITemplateRepository templateRepository)
    {
        _templateRepository = templateRepository;
    }

    public async Task<Result<List<TemplateResponse>>> Handle(GetTemplatesQuery request, CancellationToken cancellationToken)
    {
        var templates = await _templateRepository.GetAllAsync(cancellationToken);

        if (!string.IsNullOrWhiteSpace(request.Category))
        {
            templates = templates.Where(t => t.Category.Equals(request.Category, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        if (request.IsActiveOnly.HasValue && request.IsActiveOnly.Value)
        {
            templates = templates.Where(t => t.IsActive).ToList();
        }

        var response = templates.Select(t => new TemplateResponse(
            t.Id,
            t.Name,
            t.Slug,
            t.Description,
            t.Category,
            t.ThumbnailUrl,
            t.PreviewUrl,
            t.DefaultConfigJson,
            t.IsActive,
            t.CreatedAtUtc)).ToList();

        return Result.Success(response);
    }
}
