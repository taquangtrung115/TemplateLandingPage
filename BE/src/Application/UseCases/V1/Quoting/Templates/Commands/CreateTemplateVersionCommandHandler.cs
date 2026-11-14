namespace OnePortal.Application.UseCases.V1.Quoting.Templates.Commands;

using Microsoft.Extensions.Logging;
using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Quoting.Templates;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Repositories.Quoting;

public sealed class CreateTemplateVersionCommandHandler : ICommandHandler<CreateTemplateVersionCommand, int>
{
    private readonly IQuotationTemplateRepository _templateRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateTemplateVersionCommandHandler> _logger;

    public CreateTemplateVersionCommandHandler(
        IQuotationTemplateRepository templateRepository,
        IUnitOfWork unitOfWork,
        ILogger<CreateTemplateVersionCommandHandler> logger)
    {
        _templateRepository = templateRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<int>> Handle(CreateTemplateVersionCommand request, CancellationToken cancellationToken)
    {
        var template = await _templateRepository.GetByIdWithVersionsAsync(request.TemplateId, cancellationToken);
        if (template is null || template.IsDeleted)
        {
            return Result.Failure<int>(QuotationTemplateErrors.NotFound);
        }

        var version = template.AddNewVersion(
            request.Title,
            request.SellerInfoJson,
            request.SalutationText,
            request.ColumnsConfigJson,
            request.PaymentTermsJson,
            request.SignatureConfigJson,
            request.CustomCss,
            request.UserId == Guid.Empty ? null : request.UserId);

        _templateRepository.Update(template);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Quotation template {TemplateId} added new version {Version}", template.Id, version.Version);

        return Result.Success(version.Version);
    }
}
