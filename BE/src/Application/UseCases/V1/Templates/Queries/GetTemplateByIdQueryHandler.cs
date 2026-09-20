namespace TemplateLandingPage.Application.UseCases.V1.Templates.Queries;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Templates;
using TemplateLandingPage.Domain.Repositories;

public sealed class GetTemplateByIdQueryHandler : IQueryHandler<GetTemplateByIdQuery, TemplateResponse>
{
    private readonly ITemplateRepository _templateRepository;

    public GetTemplateByIdQueryHandler(ITemplateRepository templateRepository)
    {
        _templateRepository = templateRepository;
    }

    public async Task<Result<TemplateResponse>> Handle(GetTemplateByIdQuery request, CancellationToken cancellationToken)
    {
        var template = await _templateRepository.GetByIdAsync(request.Id, cancellationToken);
        if (template is null)
        {
            return Result.Failure<TemplateResponse>(TemplateErrors.NotFound);
        }

        var response = new TemplateResponse(
            template.Id,
            template.Name,
            template.Slug,
            template.Description,
            template.Category,
            template.ThumbnailUrl,
            template.PreviewUrl,
            template.DefaultConfigJson,
            template.IsActive,
            template.CreatedAtUtc);

        return Result.Success(response);
    }
}
