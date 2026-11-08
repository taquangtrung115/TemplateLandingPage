namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Templates.Commands;

using Microsoft.Extensions.Logging;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Quoting.Templates;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Repositories.Quoting;

public sealed class UpdateQuotationTemplateCommandHandler : ICommandHandler<UpdateQuotationTemplateCommand>
{
    private readonly IQuotationTemplateRepository _templateRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateQuotationTemplateCommandHandler> _logger;

    public UpdateQuotationTemplateCommandHandler(
        IQuotationTemplateRepository templateRepository,
        IUnitOfWork unitOfWork,
        ILogger<UpdateQuotationTemplateCommandHandler> logger)
    {
        _templateRepository = templateRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result> Handle(UpdateQuotationTemplateCommand request, CancellationToken cancellationToken)
    {
        var template = await _templateRepository.GetByIdAsync(request.Id, cancellationToken);
        if (template is null || template.IsDeleted)
        {
            return Result.Failure(QuotationTemplateErrors.NotFound);
        }

        template.UpdateInfo(request.Name, request.Description, request.IsActive);
        _templateRepository.Update(template);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Quotation template {TemplateId} updated successfully", template.Id);

        return Result.Success();
    }
}
