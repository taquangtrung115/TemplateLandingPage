namespace TemplateLandingPage.Contract.Services.V1.Quoting.Templates;

using TemplateLandingPage.Contract.Abstractions.Message;

public record GetQuotationTemplatesQuery(bool IncludeInactive = false) : IQuery<List<QuotationTemplateResponse>>;

public record GetQuotationTemplateByIdQuery(Guid Id) : IQuery<QuotationTemplateResponse>;

public record GetQuotationTemplateVersionQuery(Guid TemplateId, int? Version = null) : IQuery<QuotationTemplateVersionResponse>;
