namespace TemplateLandingPage.Application.UseCases.V1.Templates.Commands;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Templates;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Repositories;

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
            request.Category,
            request.ThumbnailUrl,
            request.PreviewUrl,
            request.DefaultConfigJson,
            request.IsActive);

        _templateRepository.Update(template);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
