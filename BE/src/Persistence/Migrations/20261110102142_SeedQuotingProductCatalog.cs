using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateLandingPage.Persistence.Migrations;

public partial class SeedQuotingProductCatalog : Migration
{
    #region Catalog seed
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Freeze these defaults in the migration; later catalog edits must never replay over customer data.
        migrationBuilder.Sql("""
            INSERT INTO quo."ProductGroups" ("Id", "Code", "Name", "SortOrder", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
                ('a0000000-0000-4000-8000-000000000001', 'COMBO', 'A/ DÒNG COMBO', 1, TRUE, FALSE, CURRENT_TIMESTAMP),
                ('b0000000-0000-4000-8000-000000000002', 'XIEN-QUE', 'B/ DÒNG SẢN PHẨM XIÊN QUE', 2, TRUE, FALSE, CURRENT_TIMESTAMP)
            ON CONFLICT ("Code") DO NOTHING;

            WITH seed (code, name, description, unit, price, group_code, image_url) AS (
                VALUES
                    ('CB-01', 'COMBO NGUYÊN BẢN BAO NGON', 'Surimi Hải sản, Surimi mực, Cá viên, Bò viên, Chả cá cốm, Hải sản tàu hủ, Khoai tây chiên', 'GÓI', 18000, 'COMBO', '/api/v1/quoting/product-images/CB-01.png'),
                    ('CB-02', 'SURIMI HẢI SẢN BAO NGON', 'Surimi tôm tươi cuộn rong biển, Surimi Hải sản, Surimi mực, Cá viên, Bò viên, Chả cá cốm, Hải sản tàu hủ, Khoai tây chiên', 'GÓI', 18000, 'COMBO', '/api/v1/quoting/product-images/CB-02.png'),
                    ('CB-03', 'SURIMI TÔM TƯƠI + KHOAI TÂY', 'Surimi tôm tươi cuộn rong biển, Surimi Hải sản, Surimi mực, Cá viên, Bò viên, Hải sản tàu hủ, Khoai tây chiên', 'GÓI', 23500, 'COMBO', '/api/v1/quoting/product-images/CB-03.png'),
                    ('CB-04', 'SURIMI TÔM TÍCH + KHOAI TÂY', 'Surimi tôm tích cuộn rong biển, Surimi Hải sản, Surimi mực, Cá viên, Bò viên, Hải sản tàu hủ, Khoai tây chiên', 'GÓI', 31500, 'COMBO', '/api/v1/quoting/product-images/CB-04.png'),
                    ('CB-05', 'TERI-YAKI ĐẶC SẢN SIZE S', 'Surimi tôm tích cuộn rong biển, Surimi tôm tươi cuộn rong biển, Surimi Hải sản, Surimi mực, Khoai tây chiên', 'GÓI', 23500, 'COMBO', '/api/v1/quoting/product-images/CB-05.png'),
                    ('CB-06', 'TERI-YAKI ĐẶC SẢN SIZE M', 'Surimi tôm tích cuộn rong biển, Surimi tôm tươi cuộn rong biển, Surimi Hải sản, Surimi mực, Khoai tây chiên', 'GÓI', 31500, 'COMBO', '/api/v1/quoting/product-images/CB-06.png'),
                    ('XQ-01', 'XIÊN QUE SURIMI HẢI SẢN', '10 que xiên surimi hải sản chiên giòn', '10 QUE/GÓI', 25000, 'XIEN-QUE', '/api/v1/quoting/product-images/XQ-01.png'),
                    ('XQ-02', 'XIÊN QUE SURIMI TÔM TƯƠI', '10 que xiên tôm tươi thơm béo', '10 QUE/GÓI', 30000, 'XIEN-QUE', '/api/v1/quoting/product-images/XQ-02.png'),
                    ('XQ-03', 'XIÊN QUE SURIMI TÔM TÍCH', '10 que xiên tôm tích cao cấp đặc sản', '10 QUE/GÓI', 75000, 'XIEN-QUE', '/api/v1/quoting/product-images/XQ-03.png'),
                    ('XQ-04', 'SURIMI TÔM TƯƠI CUỘN RONG BIỂN', '10 cuộn rong biển bọc tôm tươi', '10 CUỘN/GÓI', 40000, 'XIEN-QUE', '/api/v1/quoting/product-images/XQ-04.png'),
                    ('XQ-05', 'SURIMI TÔM TÍCH CUỘN RONG BIỂN', '10 cuộn rong biển bọc tôm tích giòn ngọt', '10 CUỘN/GÓI', 50000, 'XIEN-QUE', '/api/v1/quoting/product-images/XQ-05.png')
            ), repaired_groups AS (
                UPDATE quo."Products" AS product SET "GroupId" = product_group."Id"
                FROM seed
                JOIN quo."ProductGroups" AS product_group ON product_group."Code" = seed.group_code
                WHERE (
                    upper(btrim(product."Code")) = seed.code
                    OR (
                        NOT EXISTS (SELECT 1 FROM seed AS known_code WHERE known_code.code = upper(btrim(product."Code")))
                        AND upper(btrim(regexp_replace(normalize(product."Name", NFC), '[[:space:]]+', ' ', 'g'))) = seed.name
                    )
                ) AND (
                    product."GroupId" IS NULL
                    OR (
                        (product."Category" IS NULL OR product."Category" ~ '^[[:space:]]*$')
                        AND EXISTS (SELECT 1 FROM quo."ProductGroups" AS legacy_group
                            WHERE legacy_group."Id" = product."GroupId"
                                AND legacy_group."Code" LIKE 'LEGACY-%' AND legacy_group."Name" = 'Chưa phân loại')
                    )
                )
                RETURNING product."Id"
            )
            INSERT INTO quo."Products" (
                "Id", "Code", "Name", "Description", "Unit", "Price", "ImageUrl", "Category", "GroupId",
                "IsActive", "IsDeleted", "CreatedAtUtc")
            SELECT md5('quoting-standard-product:' || seed.code)::uuid, seed.code, seed.name, seed.description,
                seed.unit, seed.price, seed.image_url, product_group."Name", product_group."Id", TRUE, FALSE, CURRENT_TIMESTAMP
            FROM seed
            JOIN quo."ProductGroups" AS product_group ON product_group."Code" = seed.group_code
            WHERE NOT EXISTS (
                SELECT 1 FROM quo."Products" AS product
                WHERE upper(btrim(product."Code")) = seed.code
                    OR upper(btrim(regexp_replace(normalize(product."Name", NFC), '[[:space:]]+', ' ', 'g'))) = seed.name
            )
            ON CONFLICT DO NOTHING;
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // Catalog entries can already be edited or referenced by quotations; retain them on rollback.
    }
    #endregion
}
