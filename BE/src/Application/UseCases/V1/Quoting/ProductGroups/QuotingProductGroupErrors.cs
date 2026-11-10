namespace TemplateLandingPage.Application.UseCases.V1.Quoting.ProductGroups;
using TemplateLandingPage.Contract.Abstractions.Shared;
public static class QuotingProductGroupErrors
{
    public static readonly Error NotFound = new("ProductGroup.NotFound", "Chọn nhóm sản phẩm đang hoạt động trong danh mục.");
    public static readonly Error DuplicateCode = new("ProductGroup.DuplicateCode", "Mã nhóm sản phẩm đã tồn tại.");
    public static readonly Error InUse = new("ProductGroup.InUse", "Nhóm đang có sản phẩm. Chuyển sản phẩm sang nhóm khác trước khi xóa.");
}
