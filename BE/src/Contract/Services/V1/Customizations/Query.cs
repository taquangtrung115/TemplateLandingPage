namespace TemplateLandingPage.Contract.Services.V1.Customizations;

using TemplateLandingPage.Contract.Abstractions.Message;

public record GetCustomizationByIdQuery(Guid Id) : IQuery<CustomizationResponse>;

public record GetCustomizationBySlugQuery(string Slug) : IQuery<CustomizationResponse>;

public record GetMyCustomizationsQuery(Guid UserId) : IQuery<List<CustomizationResponse>>;
