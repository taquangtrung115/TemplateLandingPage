namespace TemplateLandingPage.Application.UseCases.V1.Users.Validators;

using FluentValidation;
using TemplateLandingPage.Contract.Services.V1.Users;

public sealed class UpdateUserCommandValidator : AbstractValidator<UpdateUserCommand>
{
    public UpdateUserCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Id không được để trống.");
        RuleFor(x => x.FullName).NotEmpty().WithMessage("Họ tên không được để trống.");
        RuleFor(x => x.Role).NotEmpty().WithMessage("Vai trò không được để trống.");
    }
}
