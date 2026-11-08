namespace TemplateLandingPage.Infrastructure.Services.Quoting;

using System.Globalization;
using System.Text;
using System.Net;
using System.Text.Encodings.Web;
using System.Text.Unicode;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Domain.Entities.Quoting;

public sealed class QuotationHtmlExportService : IQuotationExportService
{
    private static readonly CultureInfo VnCulture = new("vi-VN");

    public Task<byte[]> GenerateHtmlAsync(Quotation quotation, QuotationTemplateVersion templateVersion, CancellationToken cancellationToken = default)
    {
        var html = BuildHtmlContent(quotation, templateVersion);
        return Task.FromResult(Encoding.UTF8.GetBytes(html));
    }

    public Task<byte[]> GeneratePdfAsync(Quotation quotation, QuotationTemplateVersion templateVersion, CancellationToken cancellationToken = default)
    {
        // Generate a standard PDF-1.4 file containing the quotation details
        var pdfBytes = QuotationPdfRenderer.Render(quotation, templateVersion, cancellationToken);
        return Task.FromResult(pdfBytes);
    }

    public static string BuildHtmlContent(Quotation quotation, QuotationTemplateVersion templateVersion)
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
    margin-top: 32px;
    display: flex;
    justify-content: space-between;
    page-break-inside: avoid;
  }}
  .sign-col {{
    width: 45%;
    text-align: center;
  }}
  .sign-title {{
    font-weight: bold;
    margin-bottom: 60px;
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

        sb.Append($@"
  <table class=""table-data"">
    <thead>
      <tr>
        <th style=""width: 40px;"">STT</th>
        <th>Tên sản phẩm / Quy cách</th>
        <th style=""width: 60px;"">ĐVT</th>
        <th style=""width: 70px;"">Số lượng</th>
        <th style=""width: 110px;"">Đơn giá (VNĐ)</th>
        <th style=""width: 80px;"">CK (%)</th>
        <th style=""width: 130px;"">Thành tiền (VNĐ)</th>
        <th>Hình ảnh</th>
      </tr>
    </thead>
    <tbody>");

        var groupedItems = quotation.Items
            .OrderBy(i => i.SortOrder)
            .GroupBy(i => string.IsNullOrWhiteSpace(i.ItemGroup) ? "Danh mục chính" : i.ItemGroup.Trim());

        int stt = 1;
        foreach (var group in groupedItems)
        {
            if (groupedItems.Count() > 1 || group.Key != "Danh mục chính")
            {
                sb.Append($@"
      <tr class=""group-row"">
        <td colspan=""8"">{Html(group.Key.ToUpperInvariant())}</td>
      </tr>");
            }

            foreach (var item in group)
            {
                var imageSource = ImageSource(item.ImageUrl, imageSources);
                sb.Append($@"
      <tr>
        <td class=""text-center"">{stt++}</td>
        <td class=""text-left"">
          <strong>{Html(item.ProductName)}</strong>
          {(string.IsNullOrWhiteSpace(item.Description) ? "" : $"<br><small style=\"color: #6b7280;\">{Html(item.Description)}</small>")}
        </td>
        <td class=""text-center"">{Html(item.Unit)}</td>
        <td class=""text-center"">{item.Quantity.ToString("0.####", VnCulture)}</td>
        <td class=""text-right"">{item.UnitPrice.ToString("N2", VnCulture)}</td>
        <td class=""text-center"">{(item.DiscountPercent > 0 ? $"{item.DiscountPercent}%" : "0%")}</td>
        <td class=""text-right""><strong>{item.TotalAmount.ToString("N2", VnCulture)}</strong></td>
        <td>{(string.IsNullOrEmpty(imageSource) ? "" : $"<img src=\"{imageSource}\" alt=\"{Html(item.ProductName)}\" style=\"max-width:90px;max-height:70px;object-fit:contain\">")}</td>
      </tr>");
            }
        }

        sb.Append($@"
    </tbody>
  </table>

  <table class=""summary-table"">
    <tr>
      <td class=""text-left"">Tạm tính hàng hóa:</td>
      <td class=""text-right"">{quotation.SubTotal.ToString("N2", VnCulture)} đ</td>
    </tr>");

        if (quotation.DiscountPercent > 0 || quotation.DiscountAmount > 0)
        {
            sb.Append($@"
    <tr>
      <td class=""text-left"">Chiết khấu tổng ({quotation.DiscountPercent}%):</td>
      <td class=""text-right"">-{quotation.DiscountAmount.ToString("N2", VnCulture)} đ</td>
    </tr>");
        }

        if (quotation.TaxPercent > 0 || quotation.TaxAmount > 0)
        {
            sb.Append($@"
    <tr>
      <td class=""text-left"">Thuế VAT ({quotation.TaxPercent}%):</td>
      <td class=""text-right"">+{quotation.TaxAmount.ToString("N2", VnCulture)} đ</td>
    </tr>");
        }

        sb.Append($@"
    <tr class=""summary-total"">
      <td class=""text-left"">TỔNG CỘNG:</td>
      <td class=""text-right"">{quotation.TotalAmount.ToString("N2", VnCulture)} đ</td>
    </tr>
  </table>

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

    private static string ImageSource(string? value, Dictionary<string, string> cache)
    {
        if (string.IsNullOrWhiteSpace(value)) return "";
        var path = Uri.TryCreate(value, UriKind.Absolute, out var absolute) ? absolute.AbsolutePath : value;
        if (path.StartsWith("/api/v1/quoting/product-images/", StringComparison.Ordinal))
        {
            var code = Path.GetFileNameWithoutExtension(path);
            if (cache.TryGetValue(code, out var cached)) return cached;
            if (code.Length > 0 && code.All(character => char.IsAsciiLetterOrDigit(character) || character == '-'))
            {
                using var stream = typeof(QuotationHtmlExportService).Assembly.GetManifestResourceStream($"TemplateLandingPage.Infrastructure.Assets.Products.{code}.png");
                if (stream is not null)
                {
                    using var buffer = new MemoryStream();
                    stream.CopyTo(buffer);
                    return cache[code] = "data:image/png;base64," + Convert.ToBase64String(buffer.ToArray());
                }
            }
            return cache[code] = "";
        }
        return absolute is not null && (absolute.Scheme == "https" || absolute.Scheme == "http") ? Html(value) : "";
    }
}
