namespace TemplateLandingPage.Application.UseCases.V1.Templates.Queries;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Templates;
using TemplateLandingPage.Domain.Repositories;

public sealed class GetTemplateBySlugQueryHandler : IQueryHandler<GetTemplateBySlugQuery, TemplateResponse>
{
    private readonly ITemplateRepository _templateRepository;

    public GetTemplateBySlugQueryHandler(ITemplateRepository templateRepository)
    {
        _templateRepository = templateRepository;
    }

    public async Task<Result<TemplateResponse>> Handle(GetTemplateBySlugQuery request, CancellationToken cancellationToken)
    {
        var template = await _templateRepository.GetBySlugAsync(request.Slug, request.IncludeInactive, cancellationToken);
        if (template is null)
        {
            return Result.Failure<TemplateResponse>(TemplateErrors.NotFound);
        }

        var response = new TemplateResponse(
            template.Id,
            template.Name,
            template.Slug,
            template.Description,
            template.CategoryId,
            template.Category,
            template.ThumbnailUrl,
            template.PreviewUrl,
            template.LongPreviewUrl,
            template.Badge,
            template.AudioUrl,
            template.MusicTitle,
            template.DefaultConfigJson,
            template.IsActive,
            template.IsCommunity,
            template.AuthorName,
            template.CreatedAtUtc);

        return Result.Success(response);
    }
}
