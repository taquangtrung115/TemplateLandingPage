namespace OnePortal.Application.UseCases.V1.Quoting.Products.Commands;

using Microsoft.Extensions.Logging;
using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Quoting.Products;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Repositories.Quoting;

public sealed class UpdateQuotingProductCommandHandler : ICommandHandler<UpdateQuotingProductCommand>
{
    private readonly IQuotingProductRepository _productRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IQuotingProductGroupRepository _groupRepository;
    private readonly ILogger<UpdateQuotingProductCommandHandler> _logger;

    public UpdateQuotingProductCommandHandler(
        IQuotingProductRepository productRepository,
        IUnitOfWork unitOfWork,
        ILogger<UpdateQuotingProductCommandHandler> logger,
        IQuotingProductGroupRepository groupRepository)
    {
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
        _groupRepository = groupRepository;
    }

    public async Task<Result> Handle(UpdateQuotingProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.Id, cancellationToken);
        if (product is null || product.IsDeleted)
        {
            return Result.Failure(QuotingProductErrors.NotFound);
        }

        var group = await _groupRepository.ResolveAsync(request.GroupId ?? (string.IsNullOrWhiteSpace(request.Category) ? product.GroupId : null), request.Category, cancellationToken);
        if (group is null || (!group.IsActive && product.GroupId != group.Id))
            return Result.Failure(OnePortal.Application.UseCases.V1.Quoting.ProductGroups.QuotingProductGroupErrors.NotFound);

        var isUnique = await _productRepository.IsCodeUniqueAsync(request.Code, request.Id, cancellationToken);
        if (!isUnique)
        {
            return Result.Failure(QuotingProductErrors.DuplicateCode);
        }

        product.Update(
            request.Code,
            request.Name,
            request.Description,
            request.Unit,
            request.Price,
            request.ImageUrl,
            request.Category,
            request.IsActive);

        product.AssignGroup(group);
        _productRepository.Update(product);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Quoting product {ProductId} updated successfully", product.Id);

        return Result.Success();
    }
}
