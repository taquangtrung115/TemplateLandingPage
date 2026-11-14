namespace OnePortal.Application.UseCases.V1.Users.Commands.Validators;

using FluentValidation;
using OnePortal.Contract.Services.V1.Users;

public sealed class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email không được để trống.")
            .EmailAddress().WithMessage("Email không hợp lệ.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Mật khẩu không được để trống.")
            .MinimumLength(6).WithMessage("Mật khẩu phải từ 6 ký tự trở lên.");

        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Họ tên không được để trống.");

        RuleFor(x => x.Role)
            .NotEmpty().WithMessage("Vai trò không được để trống.");
    }
}
