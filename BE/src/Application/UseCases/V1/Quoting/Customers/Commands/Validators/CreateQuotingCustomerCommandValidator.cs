namespace OnePortal.Application.UseCases.V1.Quoting.Customers.Commands.Validators;

using FluentValidation;
using OnePortal.Contract.Services.V1.Quoting.Customers;

public sealed class CreateQuotingCustomerCommandValidator : AbstractValidator<CreateQuotingCustomerCommand>
{
    public CreateQuotingCustomerCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tên khách hàng không được để trống.")
            .MaximumLength(250).WithMessage("Tên khách hàng tối đa 250 ký tự.");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Số điện thoại không được để trống.")
            .MaximumLength(50).WithMessage("Số điện thoại tối đa 50 ký tự.");

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("Email không hợp lệ.")
            .When(x => !string.IsNullOrWhiteSpace(x.Email));
    }
}
