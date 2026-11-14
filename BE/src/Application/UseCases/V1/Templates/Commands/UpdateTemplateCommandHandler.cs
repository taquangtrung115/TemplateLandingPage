namespace OnePortal.Application.UseCases.V1.Templates.Commands;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Templates;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Repositories;

public sealed class UpdateTemplateCommandHandler : ICommandHandler<UpdateTemplateCommand>
{
    private readonly ITemplateRepository _templateRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateTemplateCommandHandler(
        ITemplateRepository templateRepository,
        IUnitOfWork unitOfWork)
    {
        _templateRepository = templateRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(UpdateTemplateCommand request, CancellationToken cancellationToken)
    {
        var template = await _templateRepository.GetByIdAsync(request.Id, cancellationToken);
        if (template is null)
        {
            return Result.Failure(TemplateErrors.NotFound);
        }

        var existingWithSlug = await _templateRepository.GetBySlugAsync(request.Slug, cancellationToken);
        if (existingWithSlug is not null && existingWithSlug.Id != request.Id)
        {
            return Result.Failure(TemplateErrors.DuplicateSlug);
        }

        template.Update(
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
            request.DefaultConfigJson,
            request.IsActive);

        _templateRepository.Update(template);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
