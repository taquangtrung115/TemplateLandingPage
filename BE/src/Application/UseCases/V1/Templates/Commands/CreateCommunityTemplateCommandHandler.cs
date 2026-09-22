namespace TemplateLandingPage.Application.UseCases.V1.Templates.Commands;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Templates;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;

public sealed class CreateCommunityTemplateCommandHandler : ICommandHandler<CreateCommunityTemplateCommand, Guid>
{
    private readonly ITemplateRepository _templateRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateCommunityTemplateCommandHandler(
        ITemplateRepository templateRepository,
        IUnitOfWork unitOfWork)
    {
        _templateRepository = templateRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(CreateCommunityTemplateCommand request, CancellationToken cancellationToken)
    {
        var finalSlug = request.Slug.Trim().ToLowerInvariant();

        if (await _templateRepository.ExistsBySlugAsync(finalSlug, cancellationToken))
        {
            var suffix = Guid.NewGuid().ToString("N")[..5];
            // Cắt ngắn phần thân slug gốc về tối đa 194 ký tự trước khi nối suffix (-xxxxx)
            var baseSlug = finalSlug.Length > 194 ? finalSlug[..194].TrimEnd('-') : finalSlug;
            finalSlug = $"{baseSlug}-{suffix}";
        }

        var template = Template.CreateCommunity(
            request.Name,
            finalSlug,
            request.Description,
            request.Category,
            request.ThumbnailUrl,
            request.DefaultConfigJson,
            request.AuthorName,
            request.CreatedByUserId);

        _templateRepository.Add(template);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(template.Id);
    }
}
