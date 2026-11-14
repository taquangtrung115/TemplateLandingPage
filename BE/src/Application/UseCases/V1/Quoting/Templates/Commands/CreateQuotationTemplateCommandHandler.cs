namespace OnePortal.Application.UseCases.V1.Quoting.Templates.Commands;

using Microsoft.Extensions.Logging;
using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Quoting.Templates;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities.Quoting;
using OnePortal.Domain.Repositories.Quoting;

public sealed class CreateQuotationTemplateCommandHandler : ICommandHandler<CreateQuotationTemplateCommand, Guid>
{
    private readonly IQuotationTemplateRepository _templateRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateQuotationTemplateCommandHandler> _logger;

    public CreateQuotationTemplateCommandHandler(
        IQuotationTemplateRepository templateRepository,
        IUnitOfWork unitOfWork,
        ILogger<CreateQuotationTemplateCommandHandler> logger)
    {
        _templateRepository = templateRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Guid>> Handle(CreateQuotationTemplateCommand request, CancellationToken cancellationToken)
    {
        var template = QuotationTemplate.Create(
            request.Code,
            request.Name,
            request.Description,
            request.IsSystem);

        template.AddNewVersion(
            request.Title,
            request.SellerInfoJson,
            request.SalutationText,
            request.ColumnsConfigJson,
            request.PaymentTermsJson,
            request.SignatureConfigJson,
            request.CustomCss,
            request.UserId == Guid.Empty ? null : request.UserId);

        _templateRepository.Add(template);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Quotation template {TemplateId} ({Code}) created successfully", template.Id, template.Code);

        return Result.Success(template.Id);
    }
}
