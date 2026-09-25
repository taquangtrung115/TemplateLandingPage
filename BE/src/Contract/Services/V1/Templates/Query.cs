namespace TemplateLandingPage.Contract.Services.V1.Templates;

using TemplateLandingPage.Contract.Abstractions.Message;

public record GetTemplatesQuery(
    string? Category = null,
    Guid? CategoryId = null,
    string? Badge = null,
    string? Search = null,
    bool? IsActiveOnly = null,
    bool? IsCommunity = null) : IQuery<List<TemplateSummaryResponse>>;

public record GetTemplateByIdQuery(Guid Id, bool IncludeInactive = false) : IQuery<TemplateResponse>;

public record GetTemplateBySlugQuery(string Slug, bool IncludeInactive = false) : IQuery<TemplateResponse>;
