namespace OnePortal.Application.UseCases.V1.Categories.Commands;

using OnePortal.Application.Abstractions;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Contract.Services.V1.Categories;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Repositories;

public sealed class UpdateCategoryCommandHandler : ICommandHandler<UpdateCategoryCommand>
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateCategoryCommandHandler(
        ICategoryRepository categoryRepository,
        IUnitOfWork unitOfWork)
    {
        _categoryRepository = categoryRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _categoryRepository.GetByIdAsync(request.Id, cancellationToken);
        if (category is null)
        {
            return Result.Failure(CategoryErrors.NotFound);
        }

        var existingWithSlug = await _categoryRepository.GetBySlugAsync(request.Slug, cancellationToken);
        if (existingWithSlug is not null && existingWithSlug.Id != request.Id)
        {
            return Result.Failure(CategoryErrors.DuplicateSlug);
        }

        category.Update(
            request.Name,
            request.Slug,
            request.Description,
            request.Icon,
            request.OrderIndex,
            request.IsActive);

        _categoryRepository.Update(category);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
