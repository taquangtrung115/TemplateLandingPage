namespace OnePortal.Infrastructure.Services.Quoting;

using System.Globalization;
using System.Text;
using PdfSharp;
using PdfSharp.Drawing;
using PdfSharp.Fonts;
using PdfSharp.Pdf;
using OnePortal.Domain.Entities.Quoting;

internal static class QuotationPdfRenderer
{
    #region Font configuration
    private static readonly object FontLock = new();
    private static readonly CultureInfo Vietnamese = CultureInfo.GetCultureInfo("vi-VN");

    private static void EnsureFont()
    {
        lock (FontLock) GlobalFontSettings.FontResolver ??= new QuotationFontResolver();
    }
    #endregion

    #region PDF rendering
    public static byte[] Render(Quotation quotation, QuotationTemplateVersion version, CancellationToken cancellationToken, IReadOnlyDictionary<string, byte[]>? uploadedImages = null)
    {
        EnsureFont();
        using var document = new PdfDocument();
        document.Version = 14;
        document.Info.Title = $"{version.Title} - {quotation.QuotationNumber}";
        var content = QuotationTemplateContent.From(version);
        document.Info.Author = content.SellerName;
        var options = new XPdfFontOptions(PdfFontEncoding.Unicode, PdfFontEmbedding.EmbedCompleteFontFile);
        var body = new XFont("QuotationSans", 9, XFontStyleEx.Regular, options);
        var strong = new XFont("QuotationSans", 9, XFontStyleEx.Bold, options);
        var headerFont = new XFont("QuotationSans", 8, XFontStyleEx.Bold, options);
        var title = new XFont("QuotationSans", 18, XFontStyleEx.Bold, options);
        var ink = XBrushes.Black;
        var accent = new XSolidBrush(XColor.FromArgb(3, 105, 161));
        var rule = new XPen(XColor.FromArgb(203, 213, 225), 0.5);
        PdfPage page = null!;
        XGraphics graphics = null!;
        double y = 0;
        const double left = 40, usableWidth = 515;
        var columns = QuotationExportColumns.Create(quotation);
        var widths = columns.Select(column => column.Key switch
        {
            "sequence" => 23d, "unit" => 55d, "quantity" => 42d,
            "price" => 75d, "discount" => 39d, "total" => 80d, "image" => 90d,
            _ => 0d
        }).ToArray();
        widths[1] = usableWidth - widths.Sum();
        var unitColumn = columns.ToList().FindIndex(column => column.Key == "unit");

        void NewPage()
        {
            graphics?.Dispose();
            page = document.AddPage();
            page.Size = PageSize.A4;
            graphics = XGraphics.FromPdfPage(page);
            y = 40;
        }

        void EnsureSpace(double height)
        {
            if (y + height > page.Height.Point - 42) NewPage();
        }

        List<string> Wrap(string text, XFont font, double width)
        {
            var lines = new List<string>();
            foreach (var paragraph in text.Normalize(NormalizationForm.FormC).Replace("\r", "").Split('\n'))
            {
                var line = "";
                foreach (var word in paragraph.Split(' ', StringSplitOptions.RemoveEmptyEntries))
                {
                    if (line.Length > 0 && graphics.MeasureString(line + " " + word, font).Width > width)
                    { lines.Add(line); line = ""; }
                    // Split unbroken identifiers so a customer-supplied value cannot escape its column.
                    foreach (var character in (line.Length == 0 ? word : " " + word))
                    {
                        if (line.Length > 0 && graphics.MeasureString(line + character, font).Width > width)
                        { lines.Add(line); line = ""; }
                        line += character;
                    }
                }
                lines.Add(line);
            }
            return lines;
        }

        void Paragraph(string text, XFont? font = null, XBrush? brush = null)
        {
            foreach (var line in Wrap(text, font ?? body, usableWidth))
            {
                EnsureSpace(16);
                graphics.DrawString(line, font ?? body, brush ?? ink, new XPoint(left, y + 11));
                y += 16;
            }
        }

        void TableHeader()
        {
            var lines = columns.Select((column, index) => Wrap(column.Label, headerFont, widths[index] - 6)).ToArray();
            var height = Math.Max(26, lines.Max(column => column.Count) * 11 + 8);
            EnsureSpace(height);
            var x = left;
            for (var index = 0; index < columns.Count; index++)
            {
                graphics.DrawRectangle(new XSolidBrush(XColor.FromArgb(224, 242, 254)), x, y, widths[index], height);
                graphics.DrawRectangle(rule, x, y, widths[index], height);
                for (var line = 0; line < lines[index].Count; line++)
                    graphics.DrawString(lines[index][line], headerFont, ink, new XRect(x + 3, y + 4 + line * 11, widths[index] - 6, 11), XStringFormats.TopCenter);
                x += widths[index];
            }
            y += height;
        }

        try
        {
            NewPage();
            Paragraph(content.SellerName, strong);
            if (content.Address.Length > 0) Paragraph($"Địa chỉ: {content.Address}");
            if (content.TaxCode.Length > 0) Paragraph($"Mã số thuế: {content.TaxCode}");
            if (content.Phone.Length > 0) Paragraph($"Điện thoại: {content.Phone}");
            y += 12;
            Paragraph(version.Title, title, accent);
            y += 8;
            Paragraph($"Số báo giá: {quotation.QuotationNumber} | Ngày lập: {quotation.IssueDate:dd/MM/yyyy}");
            Paragraph($"Kính gửi: {quotation.CustomerName}", strong);
            if (quotation.CustomerId.HasValue)
            {
                if (!string.IsNullOrWhiteSpace(quotation.CustomerContactPerson)) Paragraph($"Người liên hệ: {quotation.CustomerContactPerson}");
                if (!string.IsNullOrWhiteSpace(quotation.CustomerAddress)) Paragraph($"Địa chỉ: {quotation.CustomerAddress}");
                if (!string.IsNullOrWhiteSpace(quotation.CustomerPhone)) Paragraph($"Điện thoại: {quotation.CustomerPhone}");
                if (!string.IsNullOrWhiteSpace(quotation.CustomerEmail)) Paragraph($"Email: {quotation.CustomerEmail}");
                if (!string.IsNullOrWhiteSpace(quotation.CustomerTaxCode)) Paragraph($"Mã số thuế: {quotation.CustomerTaxCode}");
            }
            if (!string.IsNullOrWhiteSpace(version.SalutationText)) Paragraph(version.SalutationText);
            y += 10;
            TableHeader();

            var sequence = 0;
            string? currentGroup = null;
            foreach (var item in quotation.Items.OrderBy(item => item.GroupSortOrder).ThenBy(item => item.SortOrder))
            {
                cancellationToken.ThrowIfCancellationRequested();
                var textLines = Wrap(item.ProductName + (string.IsNullOrWhiteSpace(item.Description) ? "" : $"\n{item.Description}"), body, widths[1] - 8);
                var unitLines = Wrap(item.Unit, body, widths[unitColumn] - 8);
                var rowLineCount = Math.Max(textLines.Count, unitLines.Count);
                var fullHeight = Math.Max(60, rowLineCount * 13 + 8);
                if (y + Math.Min(fullHeight, 100) + 22 > page.Height.Point - 42) { NewPage(); TableHeader(); currentGroup = null; }
                if (!string.IsNullOrWhiteSpace(item.ItemGroup) && item.ItemGroup != currentGroup)
                {
                    Paragraph(item.ItemGroup, strong, accent);
                    currentGroup = item.ItemGroup;
                }
                sequence++;
                var rowValues = columns.Select(column => column.Key switch
                {
                    "sequence" => sequence.ToString(),
                    "quantity" => item.Quantity.ToString("0.####", Vietnamese),
                    "discount" => item.DiscountPercent.ToString("0.##", Vietnamese) + "%",
                    "price" => item.UnitPrice.ToString("N2", Vietnamese),
                    "total" => item.TotalAmount.ToString("N2", Vietnamese),
                    _ => ""
                }).ToArray();
                var firstSegment = true;
                var offset = 0;
                while (offset < rowLineCount)
                {
                    var capacity = Math.Max(1, (int)((page.Height.Point - 42 - y - 8) / 13));
                    var lineCount = Math.Min(capacity, rowLineCount - offset);
                    var height = Math.Max(60, lineCount * 13 + 8);
                    var x = left;
                    for (var column = 0; column < widths.Length; column++)
                    {
                        graphics.DrawRectangle(rule, x, y, widths[column], height);
                        if (columns[column].Key is "product" or "unit")
                        {
                            var segment = (column == unitColumn ? unitLines : textLines).Skip(offset).Take(lineCount).ToList();
                            for (var line = 0; line < segment.Count; line++)
                            {
                                if (column == unitColumn)
                                    graphics.DrawString(segment[line], body, ink, new XRect(x + 4, y + (height - segment.Count * 13) / 2 + line * 13, widths[column] - 8, 13), XStringFormats.TopCenter);
                                else graphics.DrawString(segment[line], body, ink, new XPoint(x + 4, y + 14 + line * 13));
                            }
                        }
                        else if (firstSegment)
                        {
                            var alignment = columns[column].Key is "price" or "total" ? XStringFormats.CenterRight : XStringFormats.Center;
                            graphics.DrawString(rowValues[column], body, ink, new XRect(x + 3, y + 4, widths[column] - 6, height - 8), alignment);
                        }
                        x += widths[column];
                    }
                    var uploadedImage = item.ImageUrl is not null && uploadedImages?.TryGetValue(item.ImageUrl, out _) == true ? uploadedImages[item.ImageUrl] : null;
                    if (firstSegment && !string.IsNullOrWhiteSpace(item.ImageUrl))
                    {
                        using var stream = uploadedImage is not null ? new MemoryStream(uploadedImage) : QuotationProductImageSource.OpenBundledImage(item.ImageUrl);
                        if (stream is not null)
                        {
                            using var image = XImage.FromStream(stream);
                            var scale = Math.Min((widths[^1] - 8) / image.PointWidth, (height - 8) / image.PointHeight);
                            var imageWidth = image.PointWidth * scale;
                            graphics.DrawImage(image, left + usableWidth - widths[^1] + (widths[^1] - imageWidth) / 2, y + 4, imageWidth, image.PointHeight * scale);
                        }
                    }
                    y += height;
                    firstSegment = false;
                    offset += lineCount;
                    if (offset < rowLineCount) { NewPage(); TableHeader(); }
                }
            }

            y += 12;
            if (quotation.ShowSubTotal) Paragraph($"Tạm tính hàng hóa: {quotation.SubTotal.ToString("N2", Vietnamese)} VNĐ");
            if (quotation.ShowDiscount && quotation.DiscountPercent > 0) Paragraph($"Chiết khấu ({quotation.DiscountPercent:0.##}%): -{quotation.DiscountAmount.ToString("N2", Vietnamese)} VNĐ");
            if (quotation.TaxPercent > 0) Paragraph($"Thuế GTGT ({quotation.TaxPercent:0.##}%): {quotation.TaxAmount.ToString("N2", Vietnamese)} VNĐ");
            if (quotation.ShowGrandTotal) Paragraph($"TỔNG CỘNG: {quotation.TotalAmount.ToString("N2", Vietnamese)} VNĐ", strong, accent);
            if (quotation.ValidUntil.HasValue) Paragraph($"Hạn hiệu lực: {quotation.ValidUntil:dd/MM/yyyy}");
            if (!string.IsNullOrWhiteSpace(quotation.Notes)) Paragraph($"Ghi chú: {quotation.Notes}");
            if (content.VatNote.Length > 0 && quotation.TaxPercent == 0) Paragraph(content.VatNote);
            if (content.Delivery.Length > 0) Paragraph(content.Delivery);
            if (content.Payment.Length > 0) Paragraph(content.Payment);
            if (content.BankAccount.Length > 0) Paragraph($"Thanh toán: {content.BankHolder} - {content.BankAccount} - {content.BankName}");
            EnsureSpace(110);
            y = Math.Max(y + 10, page.Height.Point - 145);
            var signatureX = left + usableWidth - 270;
            var signatureDate = $"{content.SignCity}, ngày {quotation.IssueDate.Day} tháng {quotation.IssueDate.Month} năm {quotation.IssueDate.Year}";
            foreach (var line in Wrap(signatureDate, body, 270))
            {
                graphics.DrawString(line, body, ink, new XRect(signatureX, y, 270, 16), XStringFormats.TopCenter);
                y += 16;
            }
            foreach (var line in Wrap(content.SignTitle, strong, 270))
            {
                graphics.DrawString(line, strong, ink, new XRect(signatureX, y + 6, 270, 16), XStringFormats.TopCenter);
                y += 16;
            }
            graphics.DrawString("(Ký và đóng dấu)", body, XBrushes.Gray, new XRect(signatureX, y + 12, 270, 16), XStringFormats.TopCenter);
            graphics.Dispose();
            graphics = null!;
            for (var index = 0; index < document.Pages.Count; index++)
            {
                using var footer = XGraphics.FromPdfPage(document.Pages[index], XGraphicsPdfPageOptions.Append);
                footer.DrawString($"{quotation.QuotationNumber}   |   Trang {index + 1}/{document.Pages.Count}", body, XBrushes.Gray,
                    new XRect(left, document.Pages[index].Height.Point - 30, usableWidth, 14), XStringFormats.Center);
            }
            using var output = new MemoryStream();
            document.Save(output, false);
            return output.ToArray();
        }
        finally { graphics?.Dispose(); }
    }
    #endregion
}
