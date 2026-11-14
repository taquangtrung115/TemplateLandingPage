namespace OnePortal.Application.UseCases.V1.Categories.Commands;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Categories;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities;
using OnePortal.Domain.Repositories;

public sealed class CreateCategoryCommandHandler : ICommandHandler<CreateCategoryCommand, Guid>
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateCategoryCommandHandler(
        ICategoryRepository categoryRepository,
        IUnitOfWork unitOfWork)
    {
        _categoryRepository = categoryRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        if (await _categoryRepository.ExistsBySlugAsync(request.Slug, cancellationToken))
        {
            return Result.Failure<Guid>(CategoryErrors.DuplicateSlug);
        }

        var category = Category.Create(
            request.Name,
            request.Slug,
            request.Description,
            request.Icon,
            request.OrderIndex,
            request.IsActive);

        _categoryRepository.Add(category);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(category.Id);
    }
}
