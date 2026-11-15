namespace OnePortal.Infrastructure.Services.Quoting;

using OnePortal.Domain.Entities.Quoting;

internal static class QuotationExportColumns
{
    #region Table contract
    public static IReadOnlyList<(string Key, string Label)> Create(Quotation quotation)
    {
        var columns = new List<(string Key, string Label)>
        {
            ("sequence", "STT"), ("product", "Tên sản phẩm / Quy cách"), ("unit", "ĐVT")
        };
        if (quotation.ShowQuantity) columns.Add(("quantity", "Số lượng"));
        columns.Add(("price", "Đơn giá (VNĐ)"));
        if (quotation.ShowDiscount) columns.Add(("discount", "CK (%)"));
        if (quotation.ShowGrandTotal) columns.Add(("total", "Thành tiền (VNĐ)"));
        columns.Add(("image", "Hình ảnh"));
        return columns;
    }
    #endregion
}
