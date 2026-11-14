namespace OnePortal.Application.UseCases.V1.Templates.Commands;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Templates;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities;
using OnePortal.Domain.Repositories;

public sealed class CreateTemplateCommandHandler : ICommandHandler<CreateTemplateCommand, Guid>
{
    private readonly ITemplateRepository _templateRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateTemplateCommandHandler(
        ITemplateRepository templateRepository,
        IUnitOfWork unitOfWork)
    {
        _templateRepository = templateRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(CreateTemplateCommand request, CancellationToken cancellationToken)
    {
        if (await _templateRepository.ExistsBySlugAsync(request.Slug, cancellationToken))
        {
            return Result.Failure<Guid>(TemplateErrors.DuplicateSlug);
        }

        var template = Template.Create(
            request.Name,
            request.Slug,
            request.Description,
            request.CategoryId,
            request.Category,
            request.ThumbnailUrl,
            request.PreviewUrl,
            request.LongPreviewUrl,
            request.Badge,
            request.AudioUrl,
            request.MusicTitle,
            request.DefaultConfigJson);

        _templateRepository.Add(template);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(template.Id);
    }
}
