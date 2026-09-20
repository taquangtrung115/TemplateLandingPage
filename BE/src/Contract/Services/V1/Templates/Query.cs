namespace TemplateLandingPage.Contract.Services.V1.Templates;

using TemplateLandingPage.Contract.Abstractions.Message;

public record GetTemplatesQuery(string? Category = null, bool? IsActiveOnly = null) : IQuery<List<TemplateResponse>>;

public record GetTemplateByIdQuery(Guid Id) : IQuery<TemplateResponse>;

public record GetTemplateBySlugQuery(string Slug) : IQuery<TemplateResponse>;
