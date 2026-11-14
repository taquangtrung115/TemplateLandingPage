namespace OnePortal.Application.UseCases.V1.Quoting.Quotations.Queries.Validators;

using FluentValidation;
using OnePortal.Contract.Services.V1.Quoting.Quotations;

public sealed class GetQuotationsQueryValidator : AbstractValidator<GetQuotationsQuery>
{
    public GetQuotationsQueryValidator()
    {
        RuleFor(query => query.PageIndex).GreaterThan(0).WithMessage("Số trang phải từ 1 trở lên.");
        RuleFor(query => query.PageSize).InclusiveBetween(1, 100).WithMessage("Mỗi trang được hiển thị từ 1 đến 100 báo giá.");
        RuleFor(query => query.SearchTerm).MaximumLength(250).WithMessage("Từ khóa tìm kiếm không được vượt quá 250 ký tự.");
    }
}
