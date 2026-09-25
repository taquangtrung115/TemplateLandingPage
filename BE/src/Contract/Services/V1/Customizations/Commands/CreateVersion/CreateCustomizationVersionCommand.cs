namespace TemplateLandingPage.Contract.Services.V1.Customizations;
using TemplateLandingPage.Contract.Abstractions.Message;
public sealed record CreateCustomizationVersionCommand(Guid Id, string Title, string Slug, string ConfigJson,
    int ExpectedRevision, Guid RequestId, Guid CurrentUserId, string CurrentUserRole) : ICommand<CustomizationMutationResponse>;
