namespace OnePortal.Persistence.Data;

using Microsoft.EntityFrameworkCore;
using System.Text;
using OnePortal.Domain.Entities.Quoting;

public static class QuotingSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        #region Catalog definitions
        var sampleProducts = new[]
        {
            // A/ DÒNG COMBO
            new { Code = "CB-01", Name = "COMBO NGUYÊN BẢN BAO NGON", Desc = "Surimi Hải sản, Surimi mực, Cá viên, Bò viên, Chả cá cốm, Hải sản tàu hủ, Khoai tây chiên", Unit = "GÓI", Price = 18000m, Cat = "A/ DÒNG COMBO", Img = "/api/v1/quoting/product-images/CB-01.png" },
            new { Code = "CB-02", Name = "SURIMI HẢI SẢN BAO NGON", Desc = "Surimi tôm tươi cuộn rong biển, Surimi Hải sản, Surimi mực, Cá viên, Bò viên, Chả cá cốm, Hải sản tàu hủ, Khoai tây chiên", Unit = "GÓI", Price = 18000m, Cat = "A/ DÒNG COMBO", Img = "/api/v1/quoting/product-images/CB-02.png" },
            new { Code = "CB-03", Name = "SURIMI TÔM TƯƠI + KHOAI TÂY", Desc = "Surimi tôm tươi cuộn rong biển, Surimi Hải sản, Surimi mực, Cá viên, Bò viên, Hải sản tàu hủ, Khoai tây chiên", Unit = "GÓI", Price = 23500m, Cat = "A/ DÒNG COMBO", Img = "/api/v1/quoting/product-images/CB-03.png" },
            new { Code = "CB-04", Name = "SURIMI TÔM TÍCH + KHOAI TÂY", Desc = "Surimi tôm tích cuộn rong biển, Surimi Hải sản, Surimi mực, Cá viên, Bò viên, Hải sản tàu hủ, Khoai tây chiên", Unit = "GÓI", Price = 31500m, Cat = "A/ DÒNG COMBO", Img = "/api/v1/quoting/product-images/CB-04.png" },
            new { Code = "CB-05", Name = "TERI-YAKI ĐẶC SẢN SIZE S", Desc = "Surimi tôm tích cuộn rong biển, Surimi tôm tươi cuộn rong biển, Surimi Hải sản, Surimi mực, Khoai tây chiên", Unit = "GÓI", Price = 23500m, Cat = "A/ DÒNG COMBO", Img = "/api/v1/quoting/product-images/CB-05.png" },
            new { Code = "CB-06", Name = "TERI-YAKI ĐẶC SẢN SIZE M", Desc = "Surimi tôm tích cuộn rong biển, Surimi tôm tươi cuộn rong biển, Surimi Hải sản, Surimi mực, Khoai tây chiên", Unit = "GÓI", Price = 31500m, Cat = "A/ DÒNG COMBO", Img = "/api/v1/quoting/product-images/CB-06.png" },

            // B/ DÒNG SẢN PHẨM XIÊN QUE
            new { Code = "XQ-01", Name = "XIÊN QUE SURIMI HẢI SẢN", Desc = "10 que xiên surimi hải sản chiên giòn", Unit = "10 QUE/GÓI", Price = 25000m, Cat = "B/ DÒNG SẢN PHẨM XIÊN QUE", Img = "/api/v1/quoting/product-images/XQ-01.png" },
            new { Code = "XQ-02", Name = "XIÊN QUE SURIMI TÔM TƯƠI", Desc = "10 que xiên tôm tươi thơm béo", Unit = "10 QUE/GÓI", Price = 30000m, Cat = "B/ DÒNG SẢN PHẨM XIÊN QUE", Img = "/api/v1/quoting/product-images/XQ-02.png" },
            new { Code = "XQ-03", Name = "XIÊN QUE SURIMI TÔM TÍCH", Desc = "10 que xiên tôm tích cao cấp đặc sản", Unit = "10 QUE/GÓI", Price = 75000m, Cat = "B/ DÒNG SẢN PHẨM XIÊN QUE", Img = "/api/v1/quoting/product-images/XQ-03.png" },
            new { Code = "XQ-04", Name = "SURIMI TÔM TƯƠI CUỘN RONG BIỂN", Desc = "10 cuộn rong biển bọc tôm tươi", Unit = "10 CUỘN/GÓI", Price = 40000m, Cat = "B/ DÒNG SẢN PHẨM XIÊN QUE", Img = "/api/v1/quoting/product-images/XQ-04.png" },
            new { Code = "XQ-05", Name = "SURIMI TÔM TÍCH CUỘN RONG BIỂN", Desc = "10 cuộn rong biển bọc tôm tích giòn ngọt", Unit = "10 CUỘN/GÓI", Price = 50000m, Cat = "B/ DÒNG SẢN PHẨM XIÊN QUE", Img = "/api/v1/quoting/product-images/XQ-05.png" }
        };

        #endregion

        #region Product groups
        // Group identities are reused on seed so catalog edits and quotation snapshots survive.
        var groups = await context.QuotingProductGroups.IgnoreQueryFilters().Where(entity => entity.TenantId == context.CurrentTenantId).ToListAsync();
        foreach (var definition in new[] { (Code: "COMBO", Name: "A/ DÒNG COMBO", Order: 1), (Code: "XIEN-QUE", Name: "B/ DÒNG SẢN PHẨM XIÊN QUE", Order: 2) })
        {
            if (groups.Any(group => group.Code == definition.Code)) continue;
            var group = QuotingProductGroup.Create(definition.Code, definition.Name, null, definition.Order);
            context.QuotingProductGroups.Add(group);
            groups.Add(group);
        }
        var ungrouped = await context.QuotingProducts.IgnoreQueryFilters().Where(entity => entity.TenantId == context.CurrentTenantId).Where(product => product.GroupId == null).ToListAsync();
        var standardByCode = sampleProducts.ToDictionary(product => product.Code, StringComparer.OrdinalIgnoreCase);
        var standardByName = sampleProducts.ToDictionary(product => NormalizeProductName(product.Name), StringComparer.OrdinalIgnoreCase);
        var groupedProducts = ungrouped.GroupBy(product =>
        {
            if (!string.IsNullOrWhiteSpace(product.Category)) return product.Category.Trim();
            if (standardByCode.TryGetValue(product.Code.Trim(), out var standard)
                || standardByName.TryGetValue(NormalizeProductName(product.Name), out standard)) return standard.Cat;
            return "Chưa phân loại";
        });
        foreach (var bucket in groupedProducts)
        {
            var standardGroupCode = bucket.Key switch
            {
                "A/ DÒNG COMBO" => "COMBO",
                "B/ DÒNG SẢN PHẨM XIÊN QUE" => "XIEN-QUE",
                _ => null
            };
            var group = standardGroupCode is not null
                ? groups.Single(group => group.Code == standardGroupCode)
                : groups.FirstOrDefault(group => group.Name == bucket.Key);
            if (group is null)
            {
                group = QuotingProductGroup.Create($"LEGACY-{Guid.NewGuid():N}", bucket.Key, null, groups.Count + 1);
                context.QuotingProductGroups.Add(group);
                groups.Add(group);
            }
            foreach (var product in bucket) product.AssignGroup(group, updateLegacyCategory: false);
        }
        await context.SaveChangesAsync();

        #endregion

        #region System template
        // 1. Seed System Template V1
        var systemTemplate = await context.QuotationTemplates.IgnoreQueryFilters().Where(entity => entity.TenantId == context.CurrentTenantId)
            .Include(t => t.Versions)
            .FirstOrDefaultAsync(t => t.Code == "TPL-CHUOI-AN-VAT-V1");

        if (systemTemplate is null)
        {
            systemTemplate = QuotationTemplate.Create(
                "TPL-CHUOI-AN-VAT-V1",
                "Báo giá Chuỗi Ăn Vặt",
                "Mẫu bảng báo giá chuẩn thương mại phân nhóm A/ Dòng Combo và B/ Dòng Sản Phẩm Xiên Que",
                true);

            var sellerJson = """
            {
              "companyName": "CHUỖI ĂN VẶT",
              "address": "19 NGÔ VĂN NĂM PHÚ THẠNH TPHCM",
              "taxCode": "0319645690",
              "phone": "",
              "bankAccount": "68681068",
              "bankName": "AB BANK",
              "bankHolder": "CTY TNHH MARVISION"
            }
            """;

            var salutation = "Lời nói đầu công ty chúng tôi xin cảm ơn Quý khách hàng đã quan tâm và ủng hộ sản phẩm của công ty chúng tôi. Công ty chúng tôi xin gửi bảng giá như sau:";

            var columnsConfig = """
            {
              "showStt": true,
              "showCode": false,
              "showUnit": true,
              "showQuantity": true,
              "showUnitPrice": true,
              "showDiscount": true,
              "showTotal": true,
              "groups": ["A/ DÒNG COMBO", "B/ DÒNG SẢN PHẨM XIÊN QUE"]
            }
            """;

            var paymentTerms = """
            {
              "vatNote": "Giá bán đã bao gồm thuế GTGT (VAT)",
              "delivery": "Giao hàng tại TP.HCM",
              "payment": "Thanh toán sau khi nhận hàng",
              "validityDays": 30
            }
            """;

            var signatureConfig = """
            {
              "leftTitle": "ĐẠI DIỆN KHÁCH HÀNG",
              "rightTitle": "PHÒNG KINH DOANH",
              "city": "TP.HCM"
            }
            """;

            systemTemplate.AddNewVersion(
                "BẢNG BÁO GIÁ",
                sellerJson,
                salutation,
                columnsConfig,
                paymentTerms,
                signatureConfig,
                null,
                null);

            context.QuotationTemplates.Add(systemTemplate);
            await context.SaveChangesAsync();
        }

        #endregion

        #region Standard products

        var existingProducts = await context.QuotingProducts.IgnoreQueryFilters().Where(entity => entity.TenantId == context.CurrentTenantId).AsNoTracking().ToListAsync();
        var existingCodes = existingProducts.Select(product => product.Code.Trim()).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var existingNames = existingProducts.Select(product => NormalizeProductName(product.Name)).ToHashSet(StringComparer.OrdinalIgnoreCase);
        foreach (var product in sampleProducts)
        {
            // Re-running seed must preserve edited prices, inactive records and deliberate soft deletes.
            if (existingCodes.Contains(product.Code) || existingNames.Contains(NormalizeProductName(product.Name))) continue;
            var entity = QuotingProduct.Create(product.Code, product.Name, product.Desc, product.Unit, product.Price, product.Img, product.Cat);
            entity.AssignGroup(groups.Single(group => group.Code == (product.Code.StartsWith("CB-") ? "COMBO" : "XIEN-QUE")));
            context.QuotingProducts.Add(entity);
            existingCodes.Add(product.Code);
            existingNames.Add(NormalizeProductName(product.Name));
        }

        await context.SaveChangesAsync();
        #endregion
    }

    private static string NormalizeProductName(string name) =>
        string.Join(" ", name.Normalize(NormalizationForm.FormC).Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries)).ToUpperInvariant();
}
