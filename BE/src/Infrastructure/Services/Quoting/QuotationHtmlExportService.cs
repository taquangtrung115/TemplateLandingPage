namespace TemplateLandingPage.Infrastructure.Services.Quoting;

using System.Globalization;
using System.Text;
using System.Net;
using System.Text.Encodings.Web;
using System.Text.Unicode;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Application.Exceptions;
using TemplateLandingPage.Domain.Entities.Quoting;
using TemplateLandingPage.Application.UseCases.V1.Quoting.Products.Helpers;

public sealed class QuotationHtmlExportService : IQuotationExportService
{
    private static readonly CultureInfo VnCulture = new("vi-VN");

    private readonly IQuotingProductImageService? _imageService;
    private readonly IQuotationRemoteImageService? _remoteImageService;
    public QuotationHtmlExportService(IQuotingProductImageService? imageService = null, IQuotationRemoteImageService? remoteImageService = null)
    {
        _imageService = imageService;
        _remoteImageService = remoteImageService;
    }

    public async Task<byte[]> GenerateHtmlAsync(Quotation quotation, QuotationTemplateVersion templateVersion, CancellationToken cancellationToken = default)
    {
        var images = await LoadImagesAsync(quotation, cancellationToken);
        return Encoding.UTF8.GetBytes(BuildHtmlContent(quotation, templateVersion, images));
    }

    public async Task<byte[]> GeneratePdfAsync(Quotation quotation, QuotationTemplateVersion templateVersion, CancellationToken cancellationToken = default)
    {
        var images = await LoadImagesAsync(quotation, cancellationToken);
        return QuotationPdfRenderer.Render(quotation, templateVersion, cancellationToken, images);
    }

    private async Task<IReadOnlyDictionary<string, byte[]>> LoadImagesAsync(Quotation quotation, CancellationToken cancellationToken)
    {
        var urls = quotation.Items.Select(item => item.ImageUrl).Where(url => !string.IsNullOrWhiteSpace(url))
            .Distinct(StringComparer.Ordinal).Cast<string>().ToArray();
        var images = new Dictionary<string, byte[]>(StringComparer.Ordinal);
        long totalBytes = 0;
        using var deadline = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        deadline.CancelAfter(TimeSpan.FromSeconds(45));
        // Bound parallel storage reads and deduplicate repeated product images in a document.
        try
        {
            foreach (var batch in urls.Chunk(4))
            {
                var resolved = await Task.WhenAll(batch.Select(async url =>
                {
                    byte[]? data;
                    if (QuotingProductImageAddress.FileName(url) is { } fileName)
                        data = _imageService is null ? null : (await _imageService.GetAsync(fileName, deadline.Token))?.Data;
                    else
                    {
                        using var bundled = QuotationProductImageSource.OpenBundledImage(url);
                        if (bundled is not null) return (Url: url, Data: (byte[]?)null);
                        data = _remoteImageService is null ? null : await _remoteImageService.GetAsync(url, deadline.Token);
                    }
                    if (data is null || data.Length == 0)
                        throw new QuotationImageUnavailableException();
                    return (Url: url, Data: (byte[]?)data);
                }));
                foreach (var image in resolved)
                {
                    if (image.Data is null) continue;
                    totalBytes += image.Data.Length;
                    if (totalBytes > 32 * 1024 * 1024) throw new QuotationImageUnavailableException();
                    images[image.Url] = image.Data;
                }
            }
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            throw new QuotationImageUnavailableException();
        }
        return images;
    }

    public static string BuildHtmlContent(Quotation quotation, QuotationTemplateVersion templateVersion, IReadOnlyDictionary<string, byte[]>? uploadedImages = null)
    {
        var sb = new StringBuilder();

        var imageSources = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        var config = QuotationTemplateContent.From(templateVersion);
        var sellerName = Html(config.SellerName);
        var sellerAddress = Html(config.Address);
        var sellerTaxCode = Html(config.TaxCode);
        var sellerPhone = Html(config.Phone);
        var bankAccount = Html(config.BankAccount);
        var bankName = Html(config.BankName);
        var bankHolder = Html(config.BankHolder);

        string salutation = string.IsNullOrWhiteSpace(templateVersion.SalutationText)
            ? "Lời nói đầu công ty chúng tôi xin cảm ơn Quý khách hàng đã quan tâm và ủng hộ sản phẩm của công ty chúng tôi. Công ty chúng tôi xin gửi bảng giá như sau:"
            : templateVersion.SalutationText;

        sb.Append($@"<!DOCTYPE html>
<html lang=""vi"">
<head>
<meta charset=""utf-8"">
<title>{Html(templateVersion.Title)} - {Html(quotation.QuotationNumber)}</title>
<style>
  @page {{
    size: A4;
    margin: 15mm 20mm;
  }}
  * {{
    box-sizing: border-box;
    font-family: 'Times New Roman', Times, serif, Arial;
  }}
  body {{
    color: #111827;
    background: #fff;
    margin: 0;
    padding: 24px;
    font-size: 14px;
    line-height: 1.5;
    min-height: 257mm;
    display: flex;
    flex-direction: column;
  }}
  .header {{
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 12px;
    margin-bottom: 16px;
  }}
  .seller-title {{
    font-size: 18px;
    font-weight: bold;
    color: #1e3a8a;
    text-transform: uppercase;
  }}
  .seller-info {{
    font-size: 13px;
    color: #4b5563;
    margin-top: 4px;
  }}
  .quotation-title-box {{
    text-align: center;
    margin: 20px 0 16px 0;
  }}
  .quotation-title {{
    font-size: 24px;
    font-weight: bold;
    color: #b91c1c;
    letter-spacing: 1px;
    margin: 0;
    text-transform: uppercase;
  }}
  .quotation-sub {{
    font-size: 13px;
    color: #6b7280;
    margin-top: 4px;
  }}
  .salutation-box {{
    margin-bottom: 16px;
    font-size: 14px;
    line-height: 1.6;
  }}
  .customer-box {{
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 12px 16px;
    margin-bottom: 16px;
  }}
  .table-data {{
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
  }}
  .table-data th, .table-data td {{
    border: 1px solid #d1d5db;
    padding: 8px 10px;
  }}
  .table-data th {{
    background: #f3f4f6;
    font-weight: bold;
    text-align: center;
    color: #1f2937;
  }}
  .group-row {{
    background: #fef3c7;
    font-weight: bold;
    color: #92400e;
  }}
  .text-center {{ text-align: center; }}
  .text-right {{ text-align: right; }}
  .text-left {{ text-align: left; }}
  .summary-table {{
    width: 320px;
    margin-left: auto;
    border-collapse: collapse;
    margin-top: 12px;
    margin-bottom: 20px;
  }}
  .summary-table td {{
    padding: 6px 8px;
  }}
  .summary-total {{
    font-weight: bold;
    font-size: 15px;
    color: #b91c1c;
    border-top: 2px solid #d1d5db;
  }}
  .terms-box {{
    margin-top: 20px;
    border-top: 1px dashed #d1d5db;
    padding-top: 12px;
    font-size: 13px;
  }}
  .bank-box {{
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 6px;
    padding: 10px 14px;
    margin-top: 10px;
    font-size: 13px;
    color: #1e40af;
  }}
  .signature-block {{
    margin-top: auto;
    padding-top: 32px;
    display: flex;
    justify-content: flex-end;
    gap: 10%;
    page-break-inside: avoid;
    flex-shrink: 0;
  }}
  .sign-col {{
    min-height: 135px;
    width: 45%;
    text-align: center;
  }}
  .sign-title {{
    font-weight: bold;
    margin-top: 8px;
    margin-bottom: 8px;
  }}
  {(templateVersion.CustomCss ?? "").Replace("<", "").Replace(">", "")}
</style>
</head>
<body>
  <div class=""header"">
    <div class=""seller-title"">{sellerName}</div>
    <div class=""seller-info"">Địa chỉ: {sellerAddress}</div>
    <div class=""seller-info"">Mã số thuế: {sellerTaxCode}{(config.Phone.Length > 0 ? $" | Điện thoại: {sellerPhone}" : "")}</div>
  </div>

  <div class=""quotation-title-box"">
    <h1 class=""quotation-title"">{Html(templateVersion.Title)}</h1>
    <div class=""quotation-sub"">Số: <strong>{Html(quotation.QuotationNumber)}</strong> | Ngày lập: {quotation.IssueDate:dd/MM/yyyy}</div>
  </div>

  <div class=""salutation-box"">
    <p><strong>Kính gửi:</strong> {Html(quotation.CustomerName.ToUpperInvariant())}</p>
    <p style=""font-style: italic;"">{Html(salutation)}</p>
  </div>");

        if (quotation.CustomerId.HasValue)
        {
            sb.Append($@"
  <div class=""customer-box"">
    <table style=""width: 100%; border: none;"">
      <tr>
        <td style=""width: 50%; border: none; padding: 2px 0;""><strong>Khách hàng:</strong> {Html(quotation.CustomerName)}</td>
        <td style=""width: 50%; border: none; padding: 2px 0;""><strong>Điện thoại:</strong> {Html(quotation.CustomerPhone ?? "—")}</td>
      </tr>
      <tr>
        <td style=""border: none; padding: 2px 0;""><strong>Người liên hệ:</strong> {Html(quotation.CustomerContactPerson ?? "—")}</td>
        <td style=""border: none; padding: 2px 0;""><strong>Email:</strong> {Html(quotation.CustomerEmail ?? "—")}</td>
      </tr>
      <tr>
        <td colspan=""2"" style=""border: none; padding: 2px 0;""><strong>Địa chỉ:</strong> {Html(quotation.CustomerAddress ?? "—")}</td>
      </tr>
      {(string.IsNullOrWhiteSpace(quotation.CustomerTaxCode) ? "" : $@"<tr><td colspan=""2"" style=""border: none; padding: 2px 0;""><strong>Mã số thuế:</strong> {Html(quotation.CustomerTaxCode)}</td></tr>")}
    </table>
  </div>");
        }

        var columnCount = 5 + (quotation.ShowQuantity ? 1 : 0) + (quotation.ShowDiscount ? 1 : 0) + (quotation.ShowGrandTotal ? 1 : 0);
        sb.Append($@"
  <table class=""table-data"">
    <thead><tr>
      <th>STT</th><th>Tên sản phẩm / Quy cách</th><th>ĐVT</th>
      {(quotation.ShowQuantity ? "<th>Số lượng</th>" : "")}
      <th>Đơn giá (VNĐ)</th>
      {(quotation.ShowDiscount ? "<th>CK (%)</th>" : "")}
      {(quotation.ShowGrandTotal ? "<th>Thành tiền (VNĐ)</th>" : "")}
      <th>Hình ảnh</th>
    </tr></thead><tbody>");

        var groupedItems = quotation.Items.OrderBy(item => item.GroupSortOrder).ThenBy(item => item.SortOrder)
            .GroupBy(item => string.IsNullOrWhiteSpace(item.ItemGroup) ? "Danh mục chính" : item.ItemGroup.Trim()).ToList();
        var sequence = 1;
        foreach (var group in groupedItems)
        {
            if (groupedItems.Count > 1 || group.Key != "Danh mục chính")
                sb.Append($"<tr class=\"group-row\"><td colspan=\"{columnCount}\">{Html(group.Key.ToUpperInvariant())}</td></tr>");
            foreach (var item in group)
            {
                var imageSource = ImageSource(item.ImageUrl, imageSources, uploadedImages);
                sb.Append($@"<tr>
                  <td class=""text-center"">{sequence++}</td>
                  <td><strong>{Html(item.ProductName)}</strong>{(string.IsNullOrWhiteSpace(item.Description) ? "" : $"<br><small>{Html(item.Description)}</small>")}</td>
                  <td class=""text-center"">{Html(item.Unit)}</td>
                  {(quotation.ShowQuantity ? $"<td class=\"text-center\">{item.Quantity.ToString("0.####", VnCulture)}</td>" : "")}
                  <td class=""text-right"">{item.UnitPrice.ToString("N2", VnCulture)}</td>
                  {(quotation.ShowDiscount ? $"<td class=\"text-center\">{item.DiscountPercent.ToString("0.##", VnCulture)}%</td>" : "")}
                  {(quotation.ShowGrandTotal ? $"<td class=\"text-right\"><strong>{item.TotalAmount.ToString("N2", VnCulture)}</strong></td>" : "")}
                  <td>{(string.IsNullOrEmpty(imageSource) ? "" : $"<img src=\"{imageSource}\" alt=\"{Html(item.ProductName)}\" style=\"max-width:90px;max-height:70px;object-fit:contain\">")}</td>
                </tr>");
            }
        }
        sb.Append("</tbody></table><table class=\"summary-table\">");
        if (quotation.ShowSubTotal)
            sb.Append($"<tr><td>Tạm tính hàng hóa:</td><td class=\"text-right\">{quotation.SubTotal.ToString("N2", VnCulture)} đ</td></tr>");
        if (quotation.ShowDiscount && quotation.DiscountPercent > 0)
            sb.Append($"<tr><td>Chiết khấu tổng ({quotation.DiscountPercent}%):</td><td class=\"text-right\">-{quotation.DiscountAmount.ToString("N2", VnCulture)} đ</td></tr>");
        if (quotation.TaxPercent > 0)
            sb.Append($"<tr><td>Thuế VAT ({quotation.TaxPercent}%):</td><td class=\"text-right\">{quotation.TaxAmount.ToString("N2", VnCulture)} đ</td></tr>");
        if (quotation.ShowGrandTotal)
            sb.Append($"<tr class=\"summary-total\"><td>TỔNG CỘNG:</td><td class=\"text-right\">{quotation.TotalAmount.ToString("N2", VnCulture)} đ</td></tr>");
        sb.Append($@"</table>

  <div class=""terms-box"">
    <p><strong>* Điều khoản & Ghi chú:</strong></p>
    <ul>
      {(quotation.TaxPercent == 0 && config.VatNote.Length > 0 ? $"<li>{Html(config.VatNote)}</li>" : "")}
      {(quotation.ValidUntil.HasValue ? $"<li>Hiệu lực báo giá: {quotation.ValidUntil.Value:dd/MM/yyyy}.</li>" : "")}
      <li>{Html(config.Delivery)}</li>
      <li>{Html(config.Payment)}</li>
      {(string.IsNullOrWhiteSpace(quotation.Notes) ? "" : $"<li>Ghi chú thêm: {Html(quotation.Notes)}</li>")}
    </ul>

    <div class=""bank-box"">
      <strong>Thông tin chuyển khoản:</strong><br>
      Tên tài khoản: <strong>{bankHolder}</strong><br>
      Số tài khoản: <strong>{bankAccount}</strong><br>
      Ngân hàng: <strong>{bankName}</strong><br>
      Nội dung: Thanh toan bao gia {Html(quotation.QuotationNumber)}
    </div>
  </div>

  <div class=""signature-block"">
    {(quotation.CustomerId.HasValue ? $"<div class=\"sign-col\"><div class=\"sign-title\">{Html(config.CustomerSignTitle)}</div><p>(Ký và ghi rõ họ tên)</p></div>" : "")}
    <div class=""sign-col"">
      <div>{Html(config.SignCity)}, ngày {quotation.IssueDate.Day} tháng {quotation.IssueDate.Month} năm {quotation.IssueDate.Year}</div>
      <div class=""sign-title"">{Html(config.SignTitle)}</div>
      <p style=""color: #9ca3af; font-size: 12px;"">(Ký và đóng dấu)</p>
    </div>
  </div>
</body>
</html>");

        return sb.ToString();
    }

    private static readonly HtmlEncoder ContentEncoder = HtmlEncoder.Create(UnicodeRanges.All);
    private static string Html(string? value) => ContentEncoder.Encode(value ?? string.Empty);

    private static string ImageSource(string? value, Dictionary<string, string> cache, IReadOnlyDictionary<string, byte[]>? uploadedImages)
    {
        if (string.IsNullOrWhiteSpace(value)) return "";
        if (uploadedImages?.TryGetValue(value, out var imageBytes) == true)
            return "data:" + (imageBytes[0] == 0x89 ? "image/png" : "image/jpeg") + ";base64," + Convert.ToBase64String(imageBytes);
        if (cache.TryGetValue(value, out var cached)) return cached;
        using var stream = QuotationProductImageSource.OpenBundledImage(value);
        if (stream is not null)
        {
            using var buffer = new MemoryStream();
            stream.CopyTo(buffer);
            return cache[value] = "data:image/png;base64," + Convert.ToBase64String(buffer.ToArray());
        }
        Uri.TryCreate(value, UriKind.Absolute, out var absolute);
        return absolute is not null && (absolute.Scheme == "https" || absolute.Scheme == "http") ? Html(value) : "";
    }
}
