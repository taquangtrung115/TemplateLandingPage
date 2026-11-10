from pathlib import Path
p=Path('BE/src/Infrastructure/Services/Quoting/QuotationHtmlExportService.cs');s=p.read_text();s=s.replace('    line-height: 1.5;','    line-height: 1.5;\n    min-height: 257mm;\n    display: flex;\n    flex-direction: column;');s=s.replace('    margin-top: 32px;\n    display: flex;\n    justify-content: space-between;','    margin-top: auto;\n    padding-top: 32px;\n    display: flex;\n    justify-content: flex-end;\n    gap: 10%;');s=s.replace('  .sign-title {{\n    font-weight: bold;\n    margin-bottom: 60px;','  .sign-title {{\n    font-weight: bold;\n    margin-top: 8px;\n    margin-bottom: 8px;');s=s.replace('    page-break-inside: avoid;','    page-break-inside: avoid;\n    flex-shrink: 0;');s=s.replace('  .sign-col {{','  .sign-col {{\n    min-height: 135px;');
start=s.index('        sb.Append($@"\n  <table class=""table-data"">');end=s.index('  <div class=""terms-box"">',start)
s=s[:start]+'''        var columnCount = 5 + (quotation.ShowQuantity ? 1 : 0) + (quotation.ShowDiscount ? 1 : 0) + (quotation.ShowGrandTotal ? 1 : 0);
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
                sb.Append($"<tr class=\\"group-row\\"><td colspan=\\"{columnCount}\\">{Html(group.Key.ToUpperInvariant())}</td></tr>");
            foreach (var item in group)
            {
                var imageSource = ImageSource(item.ImageUrl, imageSources, uploadedImages);
                sb.Append($@"<tr>
                  <td class=""text-center"">{sequence++}</td>
                  <td><strong>{Html(item.ProductName)}</strong>{(string.IsNullOrWhiteSpace(item.Description) ? "" : $"<br><small>{Html(item.Description)}</small>")}</td>
                  <td class=""text-center"">{Html(item.Unit)}</td>
                  {(quotation.ShowQuantity ? $"<td class=\\"text-center\\">{item.Quantity.ToString("0.####", VnCulture)}</td>" : "")}
                  <td class=""text-right"">{item.UnitPrice.ToString("N2", VnCulture)}</td>
                  {(quotation.ShowDiscount ? $"<td class=\\"text-center\\">{item.DiscountPercent.ToString("0.##", VnCulture)}%</td>" : "")}
                  {(quotation.ShowGrandTotal ? $"<td class=\\"text-right\\"><strong>{item.TotalAmount.ToString("N2", VnCulture)}</strong></td>" : "")}
                  <td>{(string.IsNullOrEmpty(imageSource) ? "" : $"<img src=\\"{imageSource}\\" alt=\\"{Html(item.ProductName)}\\" style=\\"max-width:90px;max-height:70px;object-fit:contain\\">")}</td>
                </tr>");
            }
        }
        sb.Append("</tbody></table><table class=\\"summary-table\\">");
        if (quotation.ShowSubTotal)
            sb.Append($"<tr><td>Tạm tính hàng hóa:</td><td class=\\"text-right\\">{quotation.SubTotal.ToString("N2", VnCulture)} đ</td></tr>");
        if (quotation.ShowDiscount && quotation.DiscountPercent > 0)
            sb.Append($"<tr><td>Chiết khấu tổng ({quotation.DiscountPercent}%):</td><td class=\\"text-right\\">-{quotation.DiscountAmount.ToString("N2", VnCulture)} đ</td></tr>");
        if (quotation.TaxPercent > 0)
            sb.Append($"<tr><td>Thuế VAT ({quotation.TaxPercent}%):</td><td class=\\"text-right\\">{quotation.TaxAmount.ToString("N2", VnCulture)} đ</td></tr>");
        if (quotation.ShowGrandTotal)
            sb.Append($"<tr class=\\"summary-total\\"><td>TỔNG CỘNG:</td><td class=\\"text-right\\">{quotation.TotalAmount.ToString("N2", VnCulture)} đ</td></tr>");
        sb.Append($@"</table>

'''+s[end:];p.write_text(s)
p=Path('BE/src/Infrastructure/Services/Quoting/QuotationPdfRenderer.cs');s=p.read_text();s=s.replace('        var widths = new double[] { 23, 172, 48, 35, 64, 65, 108 };','''        var columns = new List<(string Key, string Label, double Width)> { ("sequence", "STT", 23), ("product", "Sản phẩm / ĐVT", 172) };
        if (quotation.ShowQuantity) columns.Add(("quantity", "SL", 48));
        if (quotation.ShowDiscount) columns.Add(("discount", "CK %", 35));
        columns.Add(("price", "Đơn giá", 64));
        if (quotation.ShowGrandTotal) columns.Add(("total", "Thành tiền", 65));
        columns.Add(("image", "Hình ảnh", 108));
        var availableWidth = usableWidth - columns.Sum(column => column.Width);
        columns[1] = ("product", "Sản phẩm / ĐVT", columns[1].Width + availableWidth);
        var widths = columns.Select(column => column.Width).ToArray();''');s=s.replace('var labels = new[] { "STT", "Sản phẩm / ĐVT", "SL", "CK %", "Đơn giá", "Thành tiền", "Hình ảnh" };','var labels = columns.Select(column => column.Label).ToArray();');s=s.replace('quotation.Items.OrderBy(item => item.SortOrder)','quotation.Items.OrderBy(item => item.GroupSortOrder).ThenBy(item => item.SortOrder)');s=s.replace('''                var rowValues = new[] { (++sequence).ToString(), "", item.Quantity.ToString("0.####", Vietnamese), item.DiscountPercent.ToString("0.##", Vietnamese),
                    item.UnitPrice.ToString("N2", Vietnamese), item.TotalAmount.ToString("N2", Vietnamese), "" };''','''                sequence++;
                var rowValues = columns.Select(column => column.Key switch
                {
                    "sequence" => sequence.ToString(),
                    "quantity" => item.Quantity.ToString("0.####", Vietnamese),
                    "discount" => item.DiscountPercent.ToString("0.##", Vietnamese),
                    "price" => item.UnitPrice.ToString("N2", Vietnamese),
                    "total" => item.TotalAmount.ToString("N2", Vietnamese),
                    _ => ""
                }).ToArray();''');s=s.replace('            Paragraph($"Tạm tính:', '            if (quotation.ShowSubTotal) Paragraph($"Tạm tính hàng hóa:');s=s.replace('if (quotation.DiscountPercent > 0) Paragraph','if (quotation.ShowDiscount && quotation.DiscountPercent > 0) Paragraph');s=s.replace('            Paragraph($"TỔNG THANH TOÁN:', '            if (quotation.ShowGrandTotal) Paragraph($"TỔNG CỘNG:');s=s.replace('''            y += 10;
            Paragraph($"{content.SignCity}, ngày {quotation.IssueDate:dd/MM/yyyy}");
            Paragraph(content.SignTitle, strong);''','''            EnsureSpace(145);
            y = Math.Max(y + 12, page.Height.Point - 175);
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
            graphics.DrawString("(Ký và đóng dấu)", body, XBrushes.Gray, new XRect(signatureX, y + 12, 270, 16), XStringFormats.TopCenter);''');p.write_text(s)
print('HTML/PDF display columns, totals and signature updated')
