namespace TemplateLandingPage.Contract.Services.V1.Templates;

using TemplateLandingPage.Contract.Abstractions.Message;

public record CreateTemplateCommand(
    string Name,
    string Slug,
    string? Description,
    string Category,
    string ThumbnailUrl,
    string? PreviewUrl,
    string DefaultConfigJson) : ICommand<Guid>;

public record UpdateTemplateCommand(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string Category,
    string ThumbnailUrl,
    string? PreviewUrl,
    string DefaultConfigJson,
    bool IsActive) : ICommand;

public record DeleteTemplateCommand(Guid Id) : ICommand;
