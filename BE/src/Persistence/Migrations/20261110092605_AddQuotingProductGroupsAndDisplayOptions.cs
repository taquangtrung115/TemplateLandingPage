using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OnePortal.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddQuotingProductGroupsAndDisplayOptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ShowDiscount",
                schema: "quo",
                table: "Quotations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ShowGrandTotal",
                schema: "quo",
                table: "Quotations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ShowQuantity",
                schema: "quo",
                table: "Quotations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ShowSubTotal",
                schema: "quo",
                table: "Quotations",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "GroupSortOrder",
                schema: "quo",
                table: "QuotationItems",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "GroupId",
                schema: "quo",
                table: "Products",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ProductGroups",
                schema: "quo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ModifiedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductGroups", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Products_GroupId",
                schema: "quo",
                table: "Products",
                column: "GroupId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductGroups_Code",
                schema: "quo",
                table: "ProductGroups",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductGroups_SortOrder_Code",
                schema: "quo",
                table: "ProductGroups",
                columns: new[] { "SortOrder", "Code" });

            // Existing quotations retain their prior visible columns; new requests default to a price list.
            migrationBuilder.Sql("""
                UPDATE quo."Quotations" SET "ShowDiscount" = TRUE, "ShowQuantity" = TRUE, "ShowSubTotal" = TRUE, "ShowGrandTotal" = TRUE;
                INSERT INTO quo."ProductGroups" ("Id", "Code", "Name", "SortOrder", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
                  ('a0000000-0000-4000-8000-000000000001', 'COMBO', 'A/ DÒNG COMBO', 1, TRUE, FALSE, CURRENT_TIMESTAMP),
                  ('b0000000-0000-4000-8000-000000000002', 'XIEN-QUE', 'B/ DÒNG SẢN PHẨM XIÊN QUE', 2, TRUE, FALSE, CURRENT_TIMESTAMP);
                INSERT INTO quo."ProductGroups" ("Id", "Code", "Name", "SortOrder", "IsActive", "IsDeleted", "CreatedAtUtc")
                SELECT md5('quoting-product-group:' || name)::uuid, 'LEGACY-' || md5(name), name,
                    2 + row_number() OVER (ORDER BY name)::integer, TRUE, FALSE, CURRENT_TIMESTAMP
                FROM (SELECT DISTINCT COALESCE(NULLIF(btrim("Category"), ''), 'Chưa phân loại') AS name FROM quo."Products") AS legacy
                WHERE NOT EXISTS (SELECT 1 FROM quo."ProductGroups" AS g WHERE g."Name" = legacy.name);
                UPDATE quo."Products" AS p SET "GroupId" = g."Id"
                FROM quo."ProductGroups" AS g WHERE g."Name" = COALESCE(NULLIF(btrim(p."Category"), ''), 'Chưa phân loại');
                """);

            migrationBuilder.AddForeignKey(
                name: "FK_Products_ProductGroups_GroupId",
                schema: "quo",
                table: "Products",
                column: "GroupId",
                principalSchema: "quo",
                principalTable: "ProductGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Products_ProductGroups_GroupId",
                schema: "quo",
                table: "Products");

            migrationBuilder.DropTable(
                name: "ProductGroups",
                schema: "quo");

            migrationBuilder.DropIndex(
                name: "IX_Products_GroupId",
                schema: "quo",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "ShowDiscount",
                schema: "quo",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "ShowGrandTotal",
                schema: "quo",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "ShowQuantity",
                schema: "quo",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "ShowSubTotal",
                schema: "quo",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "GroupSortOrder",
                schema: "quo",
                table: "QuotationItems");

            migrationBuilder.DropColumn(
                name: "GroupId",
                schema: "quo",
                table: "Products");
        }
    }
}
