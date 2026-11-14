namespace OnePortal.Application.UseCases.V1.Templates.Commands;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Templates;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Repositories;

public sealed class DeleteTemplateCommandHandler : ICommandHandler<DeleteTemplateCommand>
{
    private readonly ITemplateRepository _templateRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteTemplateCommandHandler(
        ITemplateRepository templateRepository,
        IUnitOfWork unitOfWork)
    {
        _templateRepository = templateRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteTemplateCommand request, CancellationToken cancellationToken)
    {
        var template = await _templateRepository.GetByIdAsync(request.Id, cancellationToken);
        if (template is null)
        {
            return Result.Failure(TemplateErrors.NotFound);
        }

        template.Delete();
        _templateRepository.Update(template);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
