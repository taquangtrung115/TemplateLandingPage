namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Support.Commands.Submit;

using FluentValidation;

public sealed class SubmitQuotingSupportCommandValidator : AbstractValidator<SubmitQuotingSupportCommand>
{
    public SubmitQuotingSupportCommandValidator()
    {
        RuleFor(request => request.UserId).NotEmpty();
        RuleFor(request => request.FullName).NotEmpty().MaximumLength(150).WithMessage("Nhập họ tên, tối đa 150 ký tự.");
        RuleFor(request => request.Email).NotEmpty().EmailAddress().MaximumLength(150).WithMessage("Nhập email hợp lệ, tối đa 150 ký tự.");
        RuleFor(request => request.Phone).MaximumLength(50).WithMessage("Số điện thoại không được vượt quá 50 ký tự.");
        RuleFor(request => request.Topic).NotEmpty().MaximumLength(100).WithMessage("Chọn chủ đề hỗ trợ.");
        RuleFor(request => request.Priority).Must(priority => new[] { "normal", "high", "urgent" }.Contains(priority)).WithMessage("Chọn mức độ ưu tiên hợp lệ.");
        RuleFor(request => request.Message).NotEmpty().MaximumLength(4000).WithMessage("Nhập nội dung yêu cầu, tối đa 4.000 ký tự.");
    }
}
