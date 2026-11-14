namespace OnePortal.Application.UseCases.V1.Templates.Queries;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Templates;
using OnePortal.Domain.Repositories;
using OnePortal.Domain.ReadModels;

public sealed class GetTemplatesQueryHandler : IQueryHandler<GetTemplatesQuery, List<TemplateSummaryResponse>>
{
    private readonly ITemplateRepository _templateRepository;

    public GetTemplatesQueryHandler(ITemplateRepository templateRepository)
    {
        _templateRepository = templateRepository;
    }

    public async Task<Result<List<TemplateSummaryResponse>>> Handle(GetTemplatesQuery request, CancellationToken cancellationToken)
    {
        var templates = await _templateRepository.GetListAsync(
            request.Category,
            request.CategoryId,
            request.Badge,
            request.Search,
            request.IsActiveOnly,
            request.IsCommunity,
            cancellationToken);

        var response = (templates ?? new List<TemplateSummary>()).Select(t => new TemplateSummaryResponse(
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
            t.IsActive,
            t.IsCommunity,
            t.AuthorName,
            t.CreatedAtUtc)).ToList();

        return Result.Success(response);
    }
}
