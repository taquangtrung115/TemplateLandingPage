using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OnePortal.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantWorkspaceMemberships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TenantWorkspaceMemberships",
                schema: "platform",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Role = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantWorkspaceMemberships", x => x.Id);
                    table.UniqueConstraint("AK_TenantWorkspaceMemberships_TenantId_Id", x => new { x.TenantId, x.Id });
                    table.ForeignKey(
                        name: "FK_TenantWorkspaceMemberships_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "platform",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TenantWorkspaceMemberships_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TenantWorkspaceMemberships_TenantId_UserId",
                schema: "platform",
                table: "TenantWorkspaceMemberships",
                columns: new[] { "TenantId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantWorkspaceMemberships_UserId_TenantId",
                schema: "platform",
                table: "TenantWorkspaceMemberships",
                columns: new[] { "UserId", "TenantId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TenantWorkspaceMemberships",
                schema: "platform");
        }
    }
}
