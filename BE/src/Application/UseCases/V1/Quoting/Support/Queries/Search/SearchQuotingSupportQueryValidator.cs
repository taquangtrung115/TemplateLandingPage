namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Support.Queries.Search;
using FluentValidation;
public sealed class SearchQuotingSupportQueryValidator : AbstractValidator<SearchQuotingSupportQuery>
{
    public SearchQuotingSupportQueryValidator()
    {
        RuleFor(request => request.Status).Must(status => new[] { "New", "InProgress", "Resolved" }.Contains(status)).WithMessage("Trạng thái hỗ trợ không hợp lệ.");
        RuleFor(request => request.Priority).Must(priority => string.IsNullOrEmpty(priority) || new[] { "normal", "high", "urgent" }.Contains(priority)).WithMessage("Mức ưu tiên không hợp lệ.");
        RuleFor(request => request.SearchTerm).MaximumLength(200).WithMessage("Từ khóa tìm kiếm tối đa 200 ký tự.");
        RuleFor(request => request.Page).GreaterThan(0).WithMessage("Trang phải từ 1 trở lên.");
        RuleFor(request => request.PageSize).InclusiveBetween(1, 100).WithMessage("Số yêu cầu trên trang phải từ 1 đến 100.");
    }
}
