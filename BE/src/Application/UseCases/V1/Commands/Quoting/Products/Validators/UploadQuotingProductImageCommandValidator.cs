namespace OnePortal.Application.UseCases.V1.Commands.Quoting.Products.Validators;
using OnePortal.Contract.Services.V1.Quoting.Products;
using FluentValidation;
public sealed class UploadQuotingProductImageCommandValidator : AbstractValidator<UploadQuotingProductImageCommand>
{
    public UploadQuotingProductImageCommandValidator()
    {
        RuleFor(request => request.Length).InclusiveBetween(1, 5 * 1024 * 1024).WithMessage("Chọn ảnh JPG hoặc PNG, dung lượng tối đa 5 MB.");
        RuleFor(request => request.ContentType).Must(type => type is "image/jpeg" or "image/png").WithMessage("Chỉ hỗ trợ ảnh JPG và PNG.");
        RuleFor(request => request.Content).NotNull();
    }
}
