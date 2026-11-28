using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OnePortal.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPhotoVietQrTransactions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "ComboDiscountTotal",
                schema: "photo",
                table: "Orders",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "PaidAtUtc",
                schema: "photo",
                table: "Orders",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentStatus",
                schema: "photo",
                table: "Orders",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Unpaid");

            migrationBuilder.AddColumn<Guid>(
                name: "ComboGroupId",
                schema: "photo",
                table: "OrderItems",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankAccountName",
                schema: "photo",
                table: "ContactConfigs",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankAccountNumber",
                schema: "photo",
                table: "ContactConfigs",
                type: "character varying(19)",
                maxLength: 19,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankBranch",
                schema: "photo",
                table: "ContactConfigs",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankCode",
                schema: "photo",
                table: "ContactConfigs",
                type: "character varying(8)",
                maxLength: 8,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankName",
                schema: "photo",
                table: "ContactConfigs",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "VietQrEnabled",
                schema: "photo",
                table: "ContactConfigs",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "PaymentTransactions",
                schema: "photo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderCode = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    TransactionCode = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    BankCode = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    BankName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    BankAccountNumber = table.Column<string>(type: "character varying(19)", maxLength: 19, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    TransferMemo = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    CustomerPhone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Note = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    StaffNote = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    VerifiedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    VerifiedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Revision = table.Column<int>(type: "integer", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentTransactions", x => x.Id);
                    table.UniqueConstraint("AK_PaymentTransactions_TenantId_Id", x => new { x.TenantId, x.Id });
                    table.ForeignKey(
                        name: "FK_PaymentTransactions_Orders_TenantId_OrderId",
                        columns: x => new { x.TenantId, x.OrderId },
                        principalSchema: "photo",
                        principalTable: "Orders",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PaymentTransactions_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "platform",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransactions_TenantId_OrderId",
                schema: "photo",
                table: "PaymentTransactions",
                columns: new[] { "TenantId", "OrderId" },
                unique: true,
                filter: "\"Status\" <> 'Rejected'");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransactions_TenantId_Status_CreatedAtUtc",
                schema: "photo",
                table: "PaymentTransactions",
                columns: new[] { "TenantId", "Status", "CreatedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_PaymentTransactions_TenantId_TransactionCode",
                schema: "photo",
                table: "PaymentTransactions",
                columns: new[] { "TenantId", "TransactionCode" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PaymentTransactions",
                schema: "photo");

            migrationBuilder.DropColumn(
                name: "ComboDiscountTotal",
                schema: "photo",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PaidAtUtc",
                schema: "photo",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PaymentStatus",
                schema: "photo",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "ComboGroupId",
                schema: "photo",
                table: "OrderItems");

            migrationBuilder.DropColumn(
                name: "BankAccountName",
                schema: "photo",
                table: "ContactConfigs");

            migrationBuilder.DropColumn(
                name: "BankAccountNumber",
                schema: "photo",
                table: "ContactConfigs");

            migrationBuilder.DropColumn(
                name: "BankBranch",
                schema: "photo",
                table: "ContactConfigs");

            migrationBuilder.DropColumn(
                name: "BankCode",
                schema: "photo",
                table: "ContactConfigs");

            migrationBuilder.DropColumn(
                name: "BankName",
                schema: "photo",
                table: "ContactConfigs");

            migrationBuilder.DropColumn(
                name: "VietQrEnabled",
                schema: "photo",
                table: "ContactConfigs");
        }
    }
}
