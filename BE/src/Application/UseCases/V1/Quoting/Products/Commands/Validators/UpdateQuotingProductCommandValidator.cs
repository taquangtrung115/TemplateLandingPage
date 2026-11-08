namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Products.Commands.Validators;

using FluentValidation;
using TemplateLandingPage.Contract.Services.V1.Quoting.Products;

public sealed class UpdateQuotingProductCommandValidator : AbstractValidator<UpdateQuotingProductCommand>
{
    public UpdateQuotingProductCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("ID sản phẩm không hợp lệ.");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Mã sản phẩm không được để trống.")
            .MaximumLength(50).WithMessage("Mã sản phẩm tối đa 50 ký tự.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên sản phẩm không được để trống.")
            .MaximumLength(250).WithMessage("Tên sản phẩm tối đa 250 ký tự.");

        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(0).WithMessage("Đơn giá sản phẩm không được âm.");

        RuleFor(x => x.Unit)
            .NotEmpty().WithMessage("Đơn vị tính không được để trống.")
            .MaximumLength(50).WithMessage("Đơn vị tính tối đa 50 ký tự.");
    }
}
