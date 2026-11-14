namespace OnePortal.Application.Abstractions;

using OnePortal.Domain.Entities.Quoting;

public interface IQuotationExportService
{
    Task<byte[]> GenerateHtmlAsync(Quotation quotation, QuotationTemplateVersion templateVersion, CancellationToken cancellationToken = default);
    Task<byte[]> GeneratePdfAsync(Quotation quotation, QuotationTemplateVersion templateVersion, CancellationToken cancellationToken = default);
}
