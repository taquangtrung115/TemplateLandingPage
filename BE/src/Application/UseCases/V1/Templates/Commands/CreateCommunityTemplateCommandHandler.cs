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
    private readonly ICustomizationRepository _customizationRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateCommunityTemplateCommandHandler(
        ITemplateRepository templateRepository,
        ICustomizationRepository customizationRepository,
        ICategoryRepository categoryRepository,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork)
    {
        _templateRepository = templateRepository;
        _customizationRepository = customizationRepository;
        _categoryRepository = categoryRepository;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(CreateCommunityTemplateCommand request, CancellationToken cancellationToken)
    {
        var source = await _customizationRepository.ReadAccessAsync(request.SourceCustomizationId, cancellationToken);
        if (source is null)
        {
            return Result.Failure<Guid>(TemplateErrors.NotFound);
        }

        if (!request.IsAdmin && source.UserId != request.CurrentUserId)
        {
            return Result.Failure<Guid>(TemplateErrors.AccessDenied);
        }

        var version = await _customizationRepository.ReadVersionAsync(
            request.SourceCustomizationId,
            request.CustomizationVersionId,
            cancellationToken);
        if (version is null)
        {
            return Result.Failure<Guid>(TemplateErrors.NotFound);
        }

        var category = await _categoryRepository.GetActiveByIdAsync(request.CategoryId, cancellationToken);
        if (category is null)
        {
            return Result.Failure<Guid>(TemplateErrors.NotFound);
        }

        var author = await _userRepository.GetActiveByIdAsync(request.CurrentUserId, cancellationToken);
        if (author is null)
        {
            return Result.Failure<Guid>(TemplateErrors.AccessDenied);
        }

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
            category.Id,
            category.Name,
            request.ThumbnailUrl,
            version.ConfigJson,
            author.FullName,
            request.CurrentUserId);

        _templateRepository.Add(template);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(template.Id);
    }
}
