namespace OnePortal.Application.UseCases.V1.Customizations.Commands.Validators;
using FluentValidation;
using OnePortal.Application.UseCases.V1.Customizations.Helpers;
using OnePortal.Contract.Services.V1.Customizations;

public sealed class CreateCustomizationCommandValidator : AbstractValidator<CreateCustomizationCommand>
{
    public CreateCustomizationCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.ClientDraftId).NotEmpty().WithMessage("Cần định danh bản nháp. Vui lòng tải lại trang.");
        RuleFor(x => x.TemplateId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Slug).Must(CustomizationRules.IsValidSlug).WithMessage("Slug tối đa 200 ký tự, gồm chữ thường, số và dấu gạch nối.");
        RuleFor(x => x.ConfigJson).Must(CustomizationRules.IsValidConfig).WithMessage("Cấu hình phải là JSON object hợp lệ, tối đa 2 MB.");
    }
}
