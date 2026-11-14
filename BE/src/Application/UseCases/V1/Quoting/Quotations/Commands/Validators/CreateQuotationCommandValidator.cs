namespace OnePortal.Application.UseCases.V1.Quoting.Quotations.Commands.Validators;

using FluentValidation;
using OnePortal.Application.UseCases.V1.Quoting.Quotations.Helpers;
using OnePortal.Contract.Services.V1.Quoting.Quotations;

public sealed class CreateQuotationCommandValidator : AbstractValidator<CreateQuotationCommand>
{
    public CreateQuotationCommandValidator()
    {
        RuleFor(command => command.ValidUntil)
            .Must((command, validUntil) => !validUntil.HasValue || validUntil.Value.Date >= (command.IssueDate == default ? DateTime.UtcNow.Date : command.IssueDate.Date))
            .WithMessage("Hạn hiệu lực phải từ ngày lập báo giá trở đi.");
        RuleFor(command => command).Must(command => QuotationAmountValidation.CanStore(command.Items, command.DiscountPercent, command.TaxPercent))
            .WithMessage("Tổng tiền vượt giới hạn lưu trữ. Giảm số lượng hoặc đơn giá sản phẩm.");
        RuleFor(command => command.Notes).MaximumLength(2000).WithMessage("Ghi chú không được vượt quá 2.000 ký tự.");

        RuleFor(x => x.DiscountPercent)
            .InclusiveBetween(0, 100).WithMessage("Chiết khấu phải trong khoảng 0% - 100%.");

        RuleFor(x => x.TaxPercent)
            .InclusiveBetween(0, 100).WithMessage("Thuế suất VAT phải trong khoảng 0% - 100%.");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("Báo giá phải có ít nhất một dòng sản phẩm.");

        RuleForEach(command => command.Items).NotNull().WithMessage("Dòng sản phẩm không hợp lệ.");
        RuleForEach(command => command.Items).SetValidator(new QuotationItemDtoValidator());
        RuleFor(command => command.DiscountPercent).PrecisionScale(5, 2, true).WithMessage("Chiết khấu tối đa 2 chữ số thập phân.");
        RuleFor(command => command.TaxPercent).PrecisionScale(5, 2, true).WithMessage("Thuế GTGT tối đa 2 chữ số thập phân.");
    }
}
