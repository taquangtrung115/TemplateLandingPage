using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateLandingPage.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class HardenQuotingWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateSequence(
                name: "QuotationNumbers",
                schema: "quo");

            // Preserve uniqueness when upgrading databases that already contain quotation numbers.
            migrationBuilder.Sql("""
                SELECT setval('quo."QuotationNumbers"', GREATEST(COALESCE(
                    (SELECT MAX((regexp_match("QuotationNumber", '^BG-[0-9]{6}-([0-9]+)$'))[1]::bigint)
                     FROM quo."Quotations" WHERE "QuotationNumber" ~ '^BG-[0-9]{6}-[0-9]+$'), 0) + 1, 1), false);
                """);

            migrationBuilder.AlterColumn<Guid>(
                name: "CustomerId",
                schema: "quo",
                table: "Quotations",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.CreateTable(
                name: "SupportRequests",
                schema: "quo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    FullName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Topic = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Priority = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Message = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupportRequests", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SupportRequests_CreatedByUserId_CreatedAtUtc",
                schema: "quo",
                table: "SupportRequests",
                columns: new[] { "CreatedByUserId", "CreatedAtUtc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SupportRequests",
                schema: "quo");

            migrationBuilder.DropSequence(
                name: "QuotationNumbers",
                schema: "quo");

            migrationBuilder.AlterColumn<Guid>(
                name: "CustomerId",
                schema: "quo",
                table: "Quotations",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);
        }
    }
}
