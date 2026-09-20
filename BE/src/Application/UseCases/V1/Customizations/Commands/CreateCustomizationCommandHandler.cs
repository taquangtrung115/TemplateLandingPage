namespace TemplateLandingPage.Application.UseCases.V1.Customizations.Commands;

using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Customizations;
using TemplateLandingPage.Contract.Services.V1.Templates;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Repositories;

public sealed class CreateCustomizationCommandHandler : ICommandHandler<CreateCustomizationCommand, Guid>
{
    private readonly ICustomizationRepository _customizationRepository;
    private readonly ITemplateRepository _templateRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateCustomizationCommandHandler(
        ICustomizationRepository customizationRepository,
        ITemplateRepository templateRepository,
        IUnitOfWork unitOfWork)
    {
        _customizationRepository = customizationRepository;
        _templateRepository = templateRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(CreateCustomizationCommand request, CancellationToken cancellationToken)
    {
        var template = await _templateRepository.GetByIdAsync(request.TemplateId, cancellationToken);
        if (template is null)
        {
            return Result.Failure<Guid>(TemplateErrors.NotFound);
        }

        if (await _customizationRepository.ExistsBySlugAsync(request.Slug, cancellationToken))
        {
            return Result.Failure<Guid>(CustomizationErrors.DuplicateSlug);
        }

        var customization = UserCustomization.Create(
            request.UserId,
            request.TemplateId,
            request.Title,
            request.Slug,
            request.ConfigJson,
            request.IsPublished);

        _customizationRepository.Add(customization);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(customization.Id);
    }
}
