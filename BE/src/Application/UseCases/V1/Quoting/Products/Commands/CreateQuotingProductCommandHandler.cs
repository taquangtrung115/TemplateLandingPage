namespace OnePortal.Application.UseCases.V1.Quoting.Products.Commands;

using Microsoft.Extensions.Logging;
using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Quoting.Products;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities.Quoting;
using OnePortal.Domain.Repositories.Quoting;

public sealed class CreateQuotingProductCommandHandler : ICommandHandler<CreateQuotingProductCommand, Guid>
{
    private readonly IQuotingProductRepository _productRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IQuotingProductGroupRepository _groupRepository;
    private readonly ILogger<CreateQuotingProductCommandHandler> _logger;

    public CreateQuotingProductCommandHandler(
        IQuotingProductRepository productRepository,
        IUnitOfWork unitOfWork,
        ILogger<CreateQuotingProductCommandHandler> logger,
        IQuotingProductGroupRepository groupRepository)
    {
        _productRepository = productRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
        _groupRepository = groupRepository;
    }

    public async Task<Result<Guid>> Handle(CreateQuotingProductCommand request, CancellationToken cancellationToken)
    {
        var group = await _groupRepository.ResolveAsync(request.GroupId, request.Category, cancellationToken);
        if (group is null || (!group.IsActive))
            return Result.Failure<Guid>(OnePortal.Application.UseCases.V1.Quoting.ProductGroups.QuotingProductGroupErrors.NotFound);

        var isUnique = await _productRepository.IsCodeUniqueAsync(request.Code, cancellationToken: cancellationToken);
        if (!isUnique)
        {
            return Result.Failure<Guid>(QuotingProductErrors.DuplicateCode);
        }

        var product = QuotingProduct.Create(
            request.Code,
            request.Name,
            request.Description,
            request.Unit,
            request.Price,
            request.ImageUrl,
            request.Category,
            request.IsActive);

        product.AssignGroup(group);
        _productRepository.Add(product);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Quoting product {ProductId} ({Code}) created successfully", product.Id, product.Code);

        return Result.Success(product.Id);
    }
}
