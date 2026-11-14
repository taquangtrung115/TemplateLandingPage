namespace OnePortal.Contract.Services.V1.Customizations;

using OnePortal.Contract.Abstractions.Message;

public record CreateCustomizationCommand(Guid? UserId, Guid TemplateId, string Title, string Slug,
    string ConfigJson, bool IsPublished = false, Guid? ClientDraftId = null) : ICommand<CustomizationMutationResponse>;

public record UpdateCustomizationCommand(Guid Id, string Title, string Slug, string ConfigJson,
    bool IsPublished = false, Guid? CurrentUserId = null, string? CurrentUserRole = null,
    int? ExpectedRevision = null, Guid? RequestId = null) : ICommand<CustomizationMutationResponse>;

public record DeleteCustomizationCommand(Guid Id, Guid? CurrentUserId = null,
    string? CurrentUserRole = null, int? ExpectedRevision = null) : ICommand;
