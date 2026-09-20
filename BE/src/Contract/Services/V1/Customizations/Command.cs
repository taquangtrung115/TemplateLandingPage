namespace TemplateLandingPage.Contract.Services.V1.Customizations;

using TemplateLandingPage.Contract.Abstractions.Message;

public record CreateCustomizationCommand(
    Guid? UserId,
    Guid TemplateId,
    string Title,
    string Slug,
    string ConfigJson,
    bool IsPublished) : ICommand<Guid>;

public record UpdateCustomizationCommand(
    Guid Id,
    string Title,
    string Slug,
    string ConfigJson,
    bool IsPublished,
    Guid? CurrentUserId = null,
    string? CurrentUserRole = null) : ICommand;

public record DeleteCustomizationCommand(
    Guid Id,
    Guid? CurrentUserId = null,
    string? CurrentUserRole = null) : ICommand;
