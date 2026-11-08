namespace TemplateLandingPage.Application.Abstractions;

using TemplateLandingPage.Domain.Entities.Quoting;

public interface IQuotationExportService
{
    Task<byte[]> GenerateHtmlAsync(Quotation quotation, QuotationTemplateVersion templateVersion, CancellationToken cancellationToken = default);
    Task<byte[]> GeneratePdfAsync(Quotation quotation, QuotationTemplateVersion templateVersion, CancellationToken cancellationToken = default);
}
