namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Quotations.Commands.Validators;

using FluentValidation;
using TemplateLandingPage.Contract.Services.V1.Quoting.Quotations;

public sealed class QuotationItemDtoValidator : AbstractValidator<QuotationItemDto>
{
    public QuotationItemDtoValidator()
    {
        RuleFor(item => item.ProductName).NotEmpty().MaximumLength(250).WithMessage("Nhập tên sản phẩm, tối đa 250 ký tự.");
        RuleFor(item => item.ProductCode).MaximumLength(50).WithMessage("Mã sản phẩm tối đa 50 ký tự.");
        RuleFor(item => item.Description).MaximumLength(1000).WithMessage("Mô tả sản phẩm tối đa 1.000 ký tự.");
        RuleFor(item => item.Unit).NotEmpty().MaximumLength(50).WithMessage("Nhập đơn vị tính, tối đa 50 ký tự.");
        RuleFor(item => item.ImageUrl).MaximumLength(1000).WithMessage("Đường dẫn ảnh tối đa 1.000 ký tự.");
        RuleFor(item => item.ItemGroup).MaximumLength(150).WithMessage("Nhóm sản phẩm tối đa 150 ký tự.");
        RuleFor(item => item.Quantity).GreaterThan(0).WithMessage("Số lượng phải lớn hơn 0.")
            .PrecisionScale(18, 4, true).WithMessage("Số lượng tối đa 18 chữ số, gồm 4 chữ số thập phân.");
        RuleFor(item => item.UnitPrice).GreaterThanOrEqualTo(0).WithMessage("Đơn giá không được âm.")
            .PrecisionScale(18, 2, true).WithMessage("Đơn giá tối đa 18 chữ số, gồm 2 chữ số thập phân.");
        RuleFor(item => item.DiscountPercent).InclusiveBetween(0, 100).WithMessage("Chiết khấu sản phẩm phải từ 0% đến 100%.")
            .PrecisionScale(5, 2, true).WithMessage("Chiết khấu được nhập tối đa 2 chữ số thập phân.");
        RuleFor(item => item.Notes).MaximumLength(500).WithMessage("Ghi chú sản phẩm tối đa 500 ký tự.");
    }
}
