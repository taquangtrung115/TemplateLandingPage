using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateLandingPage.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddQuotingSupportWorkflow : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ResolvedAtUtc",
                schema: "quo",
                table: "SupportRequests",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ResolvedByUserId",
                schema: "quo",
                table: "SupportRequests",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Revision",
                schema: "quo",
                table: "SupportRequests",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                schema: "quo",
                table: "SupportRequests",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                schema: "quo",
                table: "SupportRequests",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedByUserId",
                schema: "quo",
                table: "SupportRequests",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SupportRequests_Status_CreatedAtUtc_Id",
                schema: "quo",
                table: "SupportRequests",
                columns: new[] { "Status", "CreatedAtUtc", "Id" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SupportRequests_Status_CreatedAtUtc_Id",
                schema: "quo",
                table: "SupportRequests");

            migrationBuilder.DropColumn(
                name: "ResolvedAtUtc",
                schema: "quo",
                table: "SupportRequests");

            migrationBuilder.DropColumn(
                name: "ResolvedByUserId",
                schema: "quo",
                table: "SupportRequests");

            migrationBuilder.DropColumn(
                name: "Revision",
                schema: "quo",
                table: "SupportRequests");

            migrationBuilder.DropColumn(
                name: "Status",
                schema: "quo",
                table: "SupportRequests");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                schema: "quo",
                table: "SupportRequests");

            migrationBuilder.DropColumn(
                name: "UpdatedByUserId",
                schema: "quo",
                table: "SupportRequests");
        }
    }
}
