namespace TemplateLandingPage.Application.UseCases.V1.Templates.Queries;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Templates;
using TemplateLandingPage.Domain.Entities;
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
        var templates = await _templateRepository.GetListAsync(
            request.Category,
            request.CategoryId,
            request.Badge,
            request.Search,
            request.IsActiveOnly,
            request.IsCommunity,
            cancellationToken);

        var response = (templates ?? new List<Template>()).Select(t => new TemplateResponse(
            t.Id,
            t.Name,
            t.Slug,
            t.Description,
            t.CategoryId,
            t.Category,
            t.ThumbnailUrl,
            t.PreviewUrl,
            t.LongPreviewUrl,
            t.Badge,
            t.AudioUrl,
            t.MusicTitle,
            t.DefaultConfigJson,
            t.IsActive,
            t.IsCommunity,
            t.AuthorName,
            t.CreatedAtUtc)).ToList();

        return Result.Success(response);
    }
}
