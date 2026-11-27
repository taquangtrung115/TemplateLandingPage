namespace OnePortal.Contract.Services.V1.Customizations;

using OnePortal.Contract.Abstractions.Message;

public record CreateCustomizationCommand(Guid? UserId, Guid TemplateId, string Title, string Slug,
    string ConfigJson, bool IsPublished = false, Guid? ClientDraftId = null) : ICommand<CustomizationMutationResponse>;

public record UpdateCustomizationCommand(Guid Id, string Title, string Slug, string ConfigJson,
    bool IsPublished = false, Guid? CurrentUserId = null, string? CurrentUserRole = null,
    int? ExpectedRevision = null, Guid? RequestId = null) : ICommand<CustomizationMutationResponse>;

public record DeleteCustomizationCommand(Guid Id, Guid? CurrentUserId = null,
    string? CurrentUserRole = null, int? ExpectedRevision = null) : ICommand;

public sealed record AssignCustomizationOwnerCommand(Guid Id, Guid UserId, int ExpectedRevision,
    Guid CurrentUserId, string CurrentUserRole) : ICommand<CustomizationMutationResponse>;

public sealed record CreateCustomizationVersionCommand(Guid Id, string Title, string Slug, string ConfigJson,
    int ExpectedRevision, Guid RequestId, Guid CurrentUserId, string CurrentUserRole) : ICommand<CustomizationMutationResponse>;

public sealed record RemoveCustomizationPublicationCommand(Guid Id, Guid? VersionId, int ExpectedRevision,
    Guid CurrentUserId, string CurrentUserRole) : ICommand<CustomizationMutationResponse>;

public sealed record SetCustomizationPublicationCommand(Guid Id, Guid VersionId, int ExpectedRevision,
    Guid CurrentUserId, string CurrentUserRole) : ICommand<CustomizationMutationResponse>;
