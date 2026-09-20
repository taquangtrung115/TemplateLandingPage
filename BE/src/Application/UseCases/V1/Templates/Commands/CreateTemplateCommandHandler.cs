namespace TemplateLandingPage.Application.UseCases.V1.Templates.Commands;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Templates;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;

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
            request.Category,
            request.ThumbnailUrl,
            request.PreviewUrl,
            request.DefaultConfigJson);

        _templateRepository.Add(template);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(template.Id);
    }
}
