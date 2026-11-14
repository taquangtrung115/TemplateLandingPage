using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OnePortal.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMultiTenantPlatform : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CustomizationSlugAliases_UserCustomizations_CustomizationId",
                table: "CustomizationSlugAliases");

            migrationBuilder.DropForeignKey(
                name: "FK_CustomizationVersions_UserCustomizations_CustomizationId",
                table: "CustomizationVersions");

            migrationBuilder.DropForeignKey(
                name: "FK_GuestbookEntries_CustomizationVersions_CustomizationVersion~",
                table: "GuestbookEntries");

            migrationBuilder.DropForeignKey(
                name: "FK_NavigationMenus_NavigationMenus_ParentId",
                table: "NavigationMenus");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_ProductGroups_GroupId",
                schema: "quo",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_QuotationFiles_Quotations_QuotationId",
                schema: "quo",
                table: "QuotationFiles");

            migrationBuilder.DropForeignKey(
                name: "FK_QuotationHistories_Quotations_QuotationId",
                schema: "quo",
                table: "QuotationHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_QuotationItems_Quotations_QuotationId",
                schema: "quo",
                table: "QuotationItems");

            migrationBuilder.DropForeignKey(
                name: "FK_QuotationTemplateVersions_QuotationTemplates_TemplateId",
                schema: "quo",
                table: "QuotationTemplateVersions");

            migrationBuilder.DropForeignKey(
                name: "FK_RsvpEntries_CustomizationVersions_CustomizationVersionId",
                table: "RsvpEntries");

            migrationBuilder.DropForeignKey(
                name: "FK_Templates_Categories_CategoryId",
                table: "Templates");

            migrationBuilder.DropForeignKey(
                name: "FK_UserCustomizations_CustomizationVersions_PublishedVersionId",
                table: "UserCustomizations");

            migrationBuilder.DropIndex(
                name: "IX_UserCustomizations_PublishedVersionId",
                table: "UserCustomizations");

            migrationBuilder.DropIndex(
                name: "IX_UserCustomizations_Slug",
                table: "UserCustomizations");

            migrationBuilder.DropIndex(
                name: "IX_UserCustomizations_UserId_ClientDraftId",
                table: "UserCustomizations");

            migrationBuilder.DropIndex(
                name: "IX_Templates_CategoryId",
                table: "Templates");

            migrationBuilder.DropIndex(
                name: "IX_Templates_Slug",
                table: "Templates");

            migrationBuilder.DropIndex(
                name: "IX_QuotationTemplateVersions_TemplateId_Version",
                schema: "quo",
                table: "QuotationTemplateVersions");

            migrationBuilder.DropIndex(
                name: "IX_QuotationTemplates_Code",
                schema: "quo",
                table: "QuotationTemplates");

            migrationBuilder.DropIndex(
                name: "IX_Quotations_QuotationNumber",
                schema: "quo",
                table: "Quotations");

            migrationBuilder.DropIndex(
                name: "IX_QuotationItems_QuotationId",
                schema: "quo",
                table: "QuotationItems");

            migrationBuilder.DropIndex(
                name: "IX_QuotationHistories_QuotationId",
                schema: "quo",
                table: "QuotationHistories");

            migrationBuilder.DropIndex(
                name: "IX_QuotationFiles_QuotationId",
                schema: "quo",
                table: "QuotationFiles");

            migrationBuilder.DropIndex(
                name: "IX_Products_Code",
                schema: "quo",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_GroupId",
                schema: "quo",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_ProductGroups_Code",
                schema: "quo",
                table: "ProductGroups");

            migrationBuilder.DropIndex(
                name: "IX_NavigationMenus_ParentId",
                table: "NavigationMenus");

            migrationBuilder.DropIndex(
                name: "IX_CustomizationVersions_CustomizationId_RequestId",
                table: "CustomizationVersions");

            migrationBuilder.DropIndex(
                name: "IX_CustomizationVersions_CustomizationId_VersionNumber",
                table: "CustomizationVersions");

            migrationBuilder.DropIndex(
                name: "IX_CustomizationSlugAliases_CustomizationId",
                table: "CustomizationSlugAliases");

            migrationBuilder.DropIndex(
                name: "IX_CustomizationSlugAliases_Slug",
                table: "CustomizationSlugAliases");

            migrationBuilder.DropIndex(
                name: "IX_Categories_Slug",
                table: "Categories");

            migrationBuilder.EnsureSchema(
                name: "platform");

            migrationBuilder.AddColumn<bool>(
                name: "IsPlatformAdmin",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "UserCustomizations",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Templates",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "quo",
                table: "SupportRequests",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "RsvpEntries",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "quo",
                table: "QuotationTemplateVersions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "quo",
                table: "QuotationTemplates",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "quo",
                table: "Quotations",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "quo",
                table: "QuotationItems",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "quo",
                table: "QuotationHistories",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "quo",
                table: "QuotationFiles",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "quo",
                table: "Products",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Products",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "quo",
                table: "ProductGroups",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "NavigationMenus",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "GuestbookEntries",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "CustomizationVersions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "CustomizationSlugAliases",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                schema: "quo",
                table: "Customers",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "Categories",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddUniqueConstraint(
                name: "AK_UserCustomizations_TenantId_Id",
                table: "UserCustomizations",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Templates_TenantId_Id",
                table: "Templates",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_SupportRequests_TenantId_Id",
                schema: "quo",
                table: "SupportRequests",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_RsvpEntries_TenantId_Id",
                table: "RsvpEntries",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_QuotationTemplateVersions_TenantId_Id",
                schema: "quo",
                table: "QuotationTemplateVersions",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_QuotationTemplates_TenantId_Id",
                schema: "quo",
                table: "QuotationTemplates",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Quotations_TenantId_Id",
                schema: "quo",
                table: "Quotations",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_QuotationItems_TenantId_Id",
                schema: "quo",
                table: "QuotationItems",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_QuotationHistories_TenantId_Id",
                schema: "quo",
                table: "QuotationHistories",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_QuotationFiles_TenantId_Id",
                schema: "quo",
                table: "QuotationFiles",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Products_TenantId_Id",
                schema: "quo",
                table: "Products",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Products_TenantId_Id",
                table: "Products",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_ProductGroups_TenantId_Id",
                schema: "quo",
                table: "ProductGroups",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_NavigationMenus_TenantId_Id",
                table: "NavigationMenus",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_GuestbookEntries_TenantId_Id",
                table: "GuestbookEntries",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_CustomizationVersions_TenantId_Id",
                table: "CustomizationVersions",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_CustomizationSlugAliases_TenantId_Id",
                table: "CustomizationSlugAliases",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Customers_TenantId_Id",
                schema: "quo",
                table: "Customers",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Categories_TenantId_Id",
                table: "Categories",
                columns: new[] { "TenantId", "Id" });

            migrationBuilder.CreateTable(
                name: "Applications",
                schema: "platform",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Applications", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SystemSeedHistory",
                schema: "platform",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Version = table.Column<int>(type: "integer", nullable: false),
                    CompletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemSeedHistory", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tenants",
                schema: "platform",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Key = table.Column<string>(type: "character varying(63)", maxLength: 63, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tenants", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TenantApplications",
                schema: "platform",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AppKey = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    AllowSelfRegistration = table.Column<bool>(type: "boolean", nullable: false),
                    ProvisioningStatus = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    LastInitializationError = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    SeedVersion = table.Column<int>(type: "integer", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantApplications", x => x.Id);
                    table.UniqueConstraint("AK_TenantApplications_TenantId_AppKey", x => new { x.TenantId, x.AppKey });
                    table.UniqueConstraint("AK_TenantApplications_TenantId_Id", x => new { x.TenantId, x.Id });
                    table.ForeignKey(
                        name: "FK_TenantApplications_Applications_AppKey",
                        column: x => x.AppKey,
                        principalSchema: "platform",
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TenantApplications_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "platform",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TenantSeedHistory",
                schema: "platform",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AppKey = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    SeedKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Version = table.Column<int>(type: "integer", nullable: false),
                    CompletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantSeedHistory", x => x.Id);
                    table.UniqueConstraint("AK_TenantSeedHistory_TenantId_Id", x => new { x.TenantId, x.Id });
                    table.ForeignKey(
                        name: "FK_TenantSeedHistory_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "platform",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TenantMemberships",
                schema: "platform",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    AppKey = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Role = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantMemberships", x => x.Id);
                    table.UniqueConstraint("AK_TenantMemberships_TenantId_Id", x => new { x.TenantId, x.Id });
                    table.ForeignKey(
                        name: "FK_TenantMemberships_TenantApplications_TenantId_AppKey",
                        columns: x => new { x.TenantId, x.AppKey },
                        principalSchema: "platform",
                        principalTable: "TenantApplications",
                        principalColumns: new[] { "TenantId", "AppKey" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TenantMemberships_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "platform",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TenantMemberships_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserCustomizations_TenantId_PublishedVersionId",
                table: "UserCustomizations",
                columns: new[] { "TenantId", "PublishedVersionId" });

            migrationBuilder.CreateIndex(
                name: "IX_UserCustomizations_TenantId_Slug",
                table: "UserCustomizations",
                columns: new[] { "TenantId", "Slug" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserCustomizations_TenantId_UserId_ClientDraftId",
                table: "UserCustomizations",
                columns: new[] { "TenantId", "UserId", "ClientDraftId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Templates_TenantId_CategoryId",
                table: "Templates",
                columns: new[] { "TenantId", "CategoryId" });

            migrationBuilder.CreateIndex(
                name: "IX_Templates_TenantId_Slug",
                table: "Templates",
                columns: new[] { "TenantId", "Slug" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RsvpEntries_TenantId_CustomizationVersionId",
                table: "RsvpEntries",
                columns: new[] { "TenantId", "CustomizationVersionId" });

            migrationBuilder.CreateIndex(
                name: "IX_QuotationTemplateVersions_TenantId_TemplateId_Version",
                schema: "quo",
                table: "QuotationTemplateVersions",
                columns: new[] { "TenantId", "TemplateId", "Version" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_QuotationTemplates_TenantId_Code",
                schema: "quo",
                table: "QuotationTemplates",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Quotations_TenantId_QuotationNumber",
                schema: "quo",
                table: "Quotations",
                columns: new[] { "TenantId", "QuotationNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_QuotationItems_TenantId_QuotationId",
                schema: "quo",
                table: "QuotationItems",
                columns: new[] { "TenantId", "QuotationId" });

            migrationBuilder.CreateIndex(
                name: "IX_QuotationHistories_TenantId_QuotationId",
                schema: "quo",
                table: "QuotationHistories",
                columns: new[] { "TenantId", "QuotationId" });

            migrationBuilder.CreateIndex(
                name: "IX_QuotationFiles_TenantId_QuotationId",
                schema: "quo",
                table: "QuotationFiles",
                columns: new[] { "TenantId", "QuotationId" });

            migrationBuilder.CreateIndex(
                name: "IX_Products_TenantId_Code",
                schema: "quo",
                table: "Products",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Products_TenantId_GroupId",
                schema: "quo",
                table: "Products",
                columns: new[] { "TenantId", "GroupId" });

            migrationBuilder.CreateIndex(
                name: "IX_ProductGroups_TenantId_Code",
                schema: "quo",
                table: "ProductGroups",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NavigationMenus_TenantId_ParentId",
                table: "NavigationMenus",
                columns: new[] { "TenantId", "ParentId" });

            migrationBuilder.CreateIndex(
                name: "IX_GuestbookEntries_TenantId_CustomizationVersionId",
                table: "GuestbookEntries",
                columns: new[] { "TenantId", "CustomizationVersionId" });

            migrationBuilder.CreateIndex(
                name: "IX_CustomizationVersions_TenantId_CustomizationId_RequestId",
                table: "CustomizationVersions",
                columns: new[] { "TenantId", "CustomizationId", "RequestId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CustomizationVersions_TenantId_CustomizationId_VersionNumber",
                table: "CustomizationVersions",
                columns: new[] { "TenantId", "CustomizationId", "VersionNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CustomizationSlugAliases_TenantId_CustomizationId",
                table: "CustomizationSlugAliases",
                columns: new[] { "TenantId", "CustomizationId" });

            migrationBuilder.CreateIndex(
                name: "IX_CustomizationSlugAliases_TenantId_Slug",
                table: "CustomizationSlugAliases",
                columns: new[] { "TenantId", "Slug" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Categories_TenantId_Slug",
                table: "Categories",
                columns: new[] { "TenantId", "Slug" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantApplications_AppKey",
                schema: "platform",
                table: "TenantApplications",
                column: "AppKey");

            migrationBuilder.CreateIndex(
                name: "IX_TenantMemberships_TenantId_AppKey_UserId",
                schema: "platform",
                table: "TenantMemberships",
                columns: new[] { "TenantId", "AppKey", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantMemberships_UserId",
                schema: "platform",
                table: "TenantMemberships",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_Key",
                schema: "platform",
                table: "Tenants",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantSeedHistory_TenantId_AppKey_SeedKey_Version",
                schema: "platform",
                table: "TenantSeedHistory",
                columns: new[] { "TenantId", "AppKey", "SeedKey", "Version" },
                unique: true);

            migrationBuilder.Sql("""
                INSERT INTO platform."Applications" ("Id", "Name") VALUES ('landing', 'Landing Page'), ('quoting', 'Quoting');
                INSERT INTO platform."Tenants" ("Id", "Key", "Name", "IsActive", "CreatedAtUtc") VALUES
                    ('6ba7809b-1af1-42ad-80e7-a2da9d58c001', 'landing-default', 'Landing Page', TRUE, CURRENT_TIMESTAMP),
                    ('6ba7809b-1af1-42ad-80e7-a2da9d58c002', 'quoting-default', 'Quoting', TRUE, CURRENT_TIMESTAMP);
                INSERT INTO platform."TenantApplications" ("Id", "TenantId", "AppKey", "IsEnabled", "AllowSelfRegistration", "ProvisioningStatus", "SeedVersion") VALUES
                    ('6ba7809b-1af1-42ad-80e7-a2da9d58c011', '6ba7809b-1af1-42ad-80e7-a2da9d58c001', 'landing', TRUE, TRUE, 'Provisioning', 0),
                    ('6ba7809b-1af1-42ad-80e7-a2da9d58c012', '6ba7809b-1af1-42ad-80e7-a2da9d58c002', 'quoting', TRUE, FALSE, 'Provisioning', 0);
                UPDATE public."UserCustomizations" SET "TenantId" = '6ba7809b-1af1-42ad-80e7-a2da9d58c001' WHERE "TenantId" IS NULL;
                UPDATE public."Templates" SET "TenantId" = '6ba7809b-1af1-42ad-80e7-a2da9d58c001' WHERE "TenantId" IS NULL;
                UPDATE quo."SupportRequests" SET "TenantId" = '6ba7809b-1af1-42ad-80e7-a2da9d58c002' WHERE "TenantId" IS NULL;
                UPDATE public."RsvpEntries" SET "TenantId" = '6ba7809b-1af1-42ad-80e7-a2da9d58c001' WHERE "TenantId" IS NULL;
                UPDATE quo."QuotationTemplateVersions" SET "TenantId" = '6ba7809b-1af1-42ad-80e7-a2da9d58c002' WHERE "TenantId" IS NULL;
                UPDATE quo."QuotationTemplates" SET "TenantId" = '6ba7809b-1af1-42ad-80e7-a2da9d58c002' WHERE "TenantId" IS NULL;
                UPDATE quo."Quotations" SET "TenantId" = '6ba7809b-1af1-42ad-80e7-a2da9d58c002' WHERE "TenantId" IS NULL;
                UPDATE quo."QuotationItems" SET "TenantId" = '6ba7809b-1af1-42ad-80e7-a2da9d58c002' WHERE "TenantId" IS NULL;
                UPDATE quo."QuotationHistories" SET "TenantId" = '6ba7809b-1af1-42ad-80e7-a2da9d58c002' WHERE "TenantId" IS NULL;
                UPDATE quo."QuotationFiles" SET "TenantId" = '6ba7809b-1af1-42ad-80e7-a2da9d58c002' WHERE "TenantId" IS NULL;
                UPDATE quo."Products" SET "TenantId" = '6ba7809b-1af1-42ad-80e7-a2da9d58c002' WHERE "TenantId" IS NULL;
                UPDATE public."Products" SET "TenantId" = '6ba7809b-1af1-42ad-80e7-a2da9d58c001' WHERE "TenantId" IS NULL;
                UPDATE quo."ProductGroups" SET "TenantId" = '6ba7809b-1af1-42ad-80e7-a2da9d58c002' WHERE "TenantId" IS NULL;
                UPDATE public."NavigationMenus" SET "TenantId" = '6ba7809b-1af1-42ad-80e7-a2da9d58c001' WHERE "TenantId" IS NULL;
                UPDATE public."GuestbookEntries" SET "TenantId" = '6ba7809b-1af1-42ad-80e7-a2da9d58c001' WHERE "TenantId" IS NULL;
                UPDATE public."CustomizationVersions" SET "TenantId" = '6ba7809b-1af1-42ad-80e7-a2da9d58c001' WHERE "TenantId" IS NULL;
                UPDATE public."CustomizationSlugAliases" SET "TenantId" = '6ba7809b-1af1-42ad-80e7-a2da9d58c001' WHERE "TenantId" IS NULL;
                UPDATE quo."Customers" SET "TenantId" = '6ba7809b-1af1-42ad-80e7-a2da9d58c002' WHERE "TenantId" IS NULL;
                UPDATE public."Categories" SET "TenantId" = '6ba7809b-1af1-42ad-80e7-a2da9d58c001' WHERE "TenantId" IS NULL;
                INSERT INTO platform."TenantMemberships" ("Id", "TenantId", "UserId", "AppKey", "Role", "IsActive")
                SELECT md5('legacy-membership:' || app."AppKey" || ':' || usr."Id"::text)::uuid,
                       app."TenantId", usr."Id", app."AppKey", CASE WHEN usr."Role" = 'Admin' THEN 'Admin' ELSE 'User' END,
                       usr."IsActive" AND NOT usr."IsDeleted"
                FROM public."Users" usr CROSS JOIN platform."TenantApplications" app;
                """);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "UserCustomizations",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "Templates",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                schema: "quo",
                table: "SupportRequests",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "RsvpEntries",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                schema: "quo",
                table: "QuotationTemplateVersions",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                schema: "quo",
                table: "QuotationTemplates",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                schema: "quo",
                table: "Quotations",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                schema: "quo",
                table: "QuotationItems",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                schema: "quo",
                table: "QuotationHistories",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                schema: "quo",
                table: "QuotationFiles",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                schema: "quo",
                table: "Products",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "Products",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                schema: "quo",
                table: "ProductGroups",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "NavigationMenus",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "GuestbookEntries",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "CustomizationVersions",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "CustomizationSlugAliases",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                schema: "quo",
                table: "Customers",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "Categories",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Categories_Tenants_TenantId",
                table: "Categories",
                column: "TenantId",
                principalSchema: "platform",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Customers_Tenants_TenantId",
                schema: "quo",
                table: "Customers",
                column: "TenantId",
                principalSchema: "platform",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CustomizationSlugAliases_Tenants_TenantId",
                table: "CustomizationSlugAliases",
                column: "TenantId",
                principalSchema: "platform",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CustomizationSlugAliases_UserCustomizations_TenantId_Custom~",
                table: "CustomizationSlugAliases",
                columns: new[] { "TenantId", "CustomizationId" },
                principalTable: "UserCustomizations",
                principalColumns: new[] { "TenantId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CustomizationVersions_Tenants_TenantId",
                table: "CustomizationVersions",
                column: "TenantId",
                principalSchema: "platform",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CustomizationVersions_UserCustomizations_TenantId_Customiza~",
                table: "CustomizationVersions",
                columns: new[] { "TenantId", "CustomizationId" },
                principalTable: "UserCustomizations",
                principalColumns: new[] { "TenantId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_GuestbookEntries_CustomizationVersions_TenantId_Customizati~",
                table: "GuestbookEntries",
                columns: new[] { "TenantId", "CustomizationVersionId" },
                principalTable: "CustomizationVersions",
                principalColumns: new[] { "TenantId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_GuestbookEntries_Tenants_TenantId",
                table: "GuestbookEntries",
                column: "TenantId",
                principalSchema: "platform",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_NavigationMenus_NavigationMenus_TenantId_ParentId",
                table: "NavigationMenus",
                columns: new[] { "TenantId", "ParentId" },
                principalTable: "NavigationMenus",
                principalColumns: new[] { "TenantId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_NavigationMenus_Tenants_TenantId",
                table: "NavigationMenus",
                column: "TenantId",
                principalSchema: "platform",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductGroups_Tenants_TenantId",
                schema: "quo",
                table: "ProductGroups",
                column: "TenantId",
                principalSchema: "platform",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Tenants_TenantId",
                table: "Products",
                column: "TenantId",
                principalSchema: "platform",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Products_ProductGroups_TenantId_GroupId",
                schema: "quo",
                table: "Products",
                columns: new[] { "TenantId", "GroupId" },
                principalSchema: "quo",
                principalTable: "ProductGroups",
                principalColumns: new[] { "TenantId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Tenants_TenantId",
                schema: "quo",
                table: "Products",
                column: "TenantId",
                principalSchema: "platform",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_QuotationFiles_Quotations_TenantId_QuotationId",
                schema: "quo",
                table: "QuotationFiles",
                columns: new[] { "TenantId", "QuotationId" },
                principalSchema: "quo",
                principalTable: "Quotations",
                principalColumns: new[] { "TenantId", "Id" },
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_QuotationFiles_Tenants_TenantId",
                schema: "quo",
                table: "QuotationFiles",
                column: "TenantId",
                principalSchema: "platform",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_QuotationHistories_Quotations_TenantId_QuotationId",
                schema: "quo",
                table: "QuotationHistories",
                columns: new[] { "TenantId", "QuotationId" },
                principalSchema: "quo",
                principalTable: "Quotations",
                principalColumns: new[] { "TenantId", "Id" },
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_QuotationHistories_Tenants_TenantId",
                schema: "quo",
                table: "QuotationHistories",
                column: "TenantId",
                principalSchema: "platform",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_QuotationItems_Quotations_TenantId_QuotationId",
                schema: "quo",
                table: "QuotationItems",
                columns: new[] { "TenantId", "QuotationId" },
                principalSchema: "quo",
                principalTable: "Quotations",
                principalColumns: new[] { "TenantId", "Id" },
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_QuotationItems_Tenants_TenantId",
                schema: "quo",
                table: "QuotationItems",
                column: "TenantId",
                principalSchema: "platform",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Quotations_Tenants_TenantId",
                schema: "quo",
                table: "Quotations",
                column: "TenantId",
                principalSchema: "platform",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_QuotationTemplates_Tenants_TenantId",
                schema: "quo",
                table: "QuotationTemplates",
                column: "TenantId",
                principalSchema: "platform",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_QuotationTemplateVersions_QuotationTemplates_TenantId_Templ~",
                schema: "quo",
                table: "QuotationTemplateVersions",
                columns: new[] { "TenantId", "TemplateId" },
                principalSchema: "quo",
                principalTable: "QuotationTemplates",
                principalColumns: new[] { "TenantId", "Id" },
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_QuotationTemplateVersions_Tenants_TenantId",
                schema: "quo",
                table: "QuotationTemplateVersions",
                column: "TenantId",
                principalSchema: "platform",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RsvpEntries_CustomizationVersions_TenantId_CustomizationVer~",
                table: "RsvpEntries",
                columns: new[] { "TenantId", "CustomizationVersionId" },
                principalTable: "CustomizationVersions",
                principalColumns: new[] { "TenantId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RsvpEntries_Tenants_TenantId",
                table: "RsvpEntries",
                column: "TenantId",
                principalSchema: "platform",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SupportRequests_Tenants_TenantId",
                schema: "quo",
                table: "SupportRequests",
                column: "TenantId",
                principalSchema: "platform",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Templates_Categories_TenantId_CategoryId",
                table: "Templates",
                columns: new[] { "TenantId", "CategoryId" },
                principalTable: "Categories",
                principalColumns: new[] { "TenantId", "Id" },
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Templates_Tenants_TenantId",
                table: "Templates",
                column: "TenantId",
                principalSchema: "platform",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserCustomizations_CustomizationVersions_TenantId_Published~",
                table: "UserCustomizations",
                columns: new[] { "TenantId", "PublishedVersionId" },
                principalTable: "CustomizationVersions",
                principalColumns: new[] { "TenantId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserCustomizations_Tenants_TenantId",
                table: "UserCustomizations",
                column: "TenantId",
                principalSchema: "platform",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Categories_Tenants_TenantId",
                table: "Categories");

            migrationBuilder.DropForeignKey(
                name: "FK_Customers_Tenants_TenantId",
                schema: "quo",
                table: "Customers");

            migrationBuilder.DropForeignKey(
                name: "FK_CustomizationSlugAliases_Tenants_TenantId",
                table: "CustomizationSlugAliases");

            migrationBuilder.DropForeignKey(
                name: "FK_CustomizationSlugAliases_UserCustomizations_TenantId_Custom~",
                table: "CustomizationSlugAliases");

            migrationBuilder.DropForeignKey(
                name: "FK_CustomizationVersions_Tenants_TenantId",
                table: "CustomizationVersions");

            migrationBuilder.DropForeignKey(
                name: "FK_CustomizationVersions_UserCustomizations_TenantId_Customiza~",
                table: "CustomizationVersions");

            migrationBuilder.DropForeignKey(
                name: "FK_GuestbookEntries_CustomizationVersions_TenantId_Customizati~",
                table: "GuestbookEntries");

            migrationBuilder.DropForeignKey(
                name: "FK_GuestbookEntries_Tenants_TenantId",
                table: "GuestbookEntries");

            migrationBuilder.DropForeignKey(
                name: "FK_NavigationMenus_NavigationMenus_TenantId_ParentId",
                table: "NavigationMenus");

            migrationBuilder.DropForeignKey(
                name: "FK_NavigationMenus_Tenants_TenantId",
                table: "NavigationMenus");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductGroups_Tenants_TenantId",
                schema: "quo",
                table: "ProductGroups");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_Tenants_TenantId",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_ProductGroups_TenantId_GroupId",
                schema: "quo",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_Products_Tenants_TenantId",
                schema: "quo",
                table: "Products");

            migrationBuilder.DropForeignKey(
                name: "FK_QuotationFiles_Quotations_TenantId_QuotationId",
                schema: "quo",
                table: "QuotationFiles");

            migrationBuilder.DropForeignKey(
                name: "FK_QuotationFiles_Tenants_TenantId",
                schema: "quo",
                table: "QuotationFiles");

            migrationBuilder.DropForeignKey(
                name: "FK_QuotationHistories_Quotations_TenantId_QuotationId",
                schema: "quo",
                table: "QuotationHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_QuotationHistories_Tenants_TenantId",
                schema: "quo",
                table: "QuotationHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_QuotationItems_Quotations_TenantId_QuotationId",
                schema: "quo",
                table: "QuotationItems");

            migrationBuilder.DropForeignKey(
                name: "FK_QuotationItems_Tenants_TenantId",
                schema: "quo",
                table: "QuotationItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Quotations_Tenants_TenantId",
                schema: "quo",
                table: "Quotations");

            migrationBuilder.DropForeignKey(
                name: "FK_QuotationTemplates_Tenants_TenantId",
                schema: "quo",
                table: "QuotationTemplates");

            migrationBuilder.DropForeignKey(
                name: "FK_QuotationTemplateVersions_QuotationTemplates_TenantId_Templ~",
                schema: "quo",
                table: "QuotationTemplateVersions");

            migrationBuilder.DropForeignKey(
                name: "FK_QuotationTemplateVersions_Tenants_TenantId",
                schema: "quo",
                table: "QuotationTemplateVersions");

            migrationBuilder.DropForeignKey(
                name: "FK_RsvpEntries_CustomizationVersions_TenantId_CustomizationVer~",
                table: "RsvpEntries");

            migrationBuilder.DropForeignKey(
                name: "FK_RsvpEntries_Tenants_TenantId",
                table: "RsvpEntries");

            migrationBuilder.DropForeignKey(
                name: "FK_SupportRequests_Tenants_TenantId",
                schema: "quo",
                table: "SupportRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_Templates_Categories_TenantId_CategoryId",
                table: "Templates");

            migrationBuilder.DropForeignKey(
                name: "FK_Templates_Tenants_TenantId",
                table: "Templates");

            migrationBuilder.DropForeignKey(
                name: "FK_UserCustomizations_CustomizationVersions_TenantId_Published~",
                table: "UserCustomizations");

            migrationBuilder.DropForeignKey(
                name: "FK_UserCustomizations_Tenants_TenantId",
                table: "UserCustomizations");

            migrationBuilder.DropTable(
                name: "SystemSeedHistory",
                schema: "platform");

            migrationBuilder.DropTable(
                name: "TenantMemberships",
                schema: "platform");

            migrationBuilder.DropTable(
                name: "TenantSeedHistory",
                schema: "platform");

            migrationBuilder.DropTable(
                name: "TenantApplications",
                schema: "platform");

            migrationBuilder.DropTable(
                name: "Applications",
                schema: "platform");

            migrationBuilder.DropTable(
                name: "Tenants",
                schema: "platform");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_UserCustomizations_TenantId_Id",
                table: "UserCustomizations");

            migrationBuilder.DropIndex(
                name: "IX_UserCustomizations_TenantId_PublishedVersionId",
                table: "UserCustomizations");

            migrationBuilder.DropIndex(
                name: "IX_UserCustomizations_TenantId_Slug",
                table: "UserCustomizations");

            migrationBuilder.DropIndex(
                name: "IX_UserCustomizations_TenantId_UserId_ClientDraftId",
                table: "UserCustomizations");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Templates_TenantId_Id",
                table: "Templates");

            migrationBuilder.DropIndex(
                name: "IX_Templates_TenantId_CategoryId",
                table: "Templates");

            migrationBuilder.DropIndex(
                name: "IX_Templates_TenantId_Slug",
                table: "Templates");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_SupportRequests_TenantId_Id",
                schema: "quo",
                table: "SupportRequests");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_RsvpEntries_TenantId_Id",
                table: "RsvpEntries");

            migrationBuilder.DropIndex(
                name: "IX_RsvpEntries_TenantId_CustomizationVersionId",
                table: "RsvpEntries");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_QuotationTemplateVersions_TenantId_Id",
                schema: "quo",
                table: "QuotationTemplateVersions");

            migrationBuilder.DropIndex(
                name: "IX_QuotationTemplateVersions_TenantId_TemplateId_Version",
                schema: "quo",
                table: "QuotationTemplateVersions");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_QuotationTemplates_TenantId_Id",
                schema: "quo",
                table: "QuotationTemplates");

            migrationBuilder.DropIndex(
                name: "IX_QuotationTemplates_TenantId_Code",
                schema: "quo",
                table: "QuotationTemplates");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Quotations_TenantId_Id",
                schema: "quo",
                table: "Quotations");

            migrationBuilder.DropIndex(
                name: "IX_Quotations_TenantId_QuotationNumber",
                schema: "quo",
                table: "Quotations");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_QuotationItems_TenantId_Id",
                schema: "quo",
                table: "QuotationItems");

            migrationBuilder.DropIndex(
                name: "IX_QuotationItems_TenantId_QuotationId",
                schema: "quo",
                table: "QuotationItems");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_QuotationHistories_TenantId_Id",
                schema: "quo",
                table: "QuotationHistories");

            migrationBuilder.DropIndex(
                name: "IX_QuotationHistories_TenantId_QuotationId",
                schema: "quo",
                table: "QuotationHistories");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_QuotationFiles_TenantId_Id",
                schema: "quo",
                table: "QuotationFiles");

            migrationBuilder.DropIndex(
                name: "IX_QuotationFiles_TenantId_QuotationId",
                schema: "quo",
                table: "QuotationFiles");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Products_TenantId_Id",
                schema: "quo",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_TenantId_Code",
                schema: "quo",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Products_TenantId_GroupId",
                schema: "quo",
                table: "Products");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Products_TenantId_Id",
                table: "Products");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_ProductGroups_TenantId_Id",
                schema: "quo",
                table: "ProductGroups");

            migrationBuilder.DropIndex(
                name: "IX_ProductGroups_TenantId_Code",
                schema: "quo",
                table: "ProductGroups");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_NavigationMenus_TenantId_Id",
                table: "NavigationMenus");

            migrationBuilder.DropIndex(
                name: "IX_NavigationMenus_TenantId_ParentId",
                table: "NavigationMenus");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_GuestbookEntries_TenantId_Id",
                table: "GuestbookEntries");

            migrationBuilder.DropIndex(
                name: "IX_GuestbookEntries_TenantId_CustomizationVersionId",
                table: "GuestbookEntries");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_CustomizationVersions_TenantId_Id",
                table: "CustomizationVersions");

            migrationBuilder.DropIndex(
                name: "IX_CustomizationVersions_TenantId_CustomizationId_RequestId",
                table: "CustomizationVersions");

            migrationBuilder.DropIndex(
                name: "IX_CustomizationVersions_TenantId_CustomizationId_VersionNumber",
                table: "CustomizationVersions");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_CustomizationSlugAliases_TenantId_Id",
                table: "CustomizationSlugAliases");

            migrationBuilder.DropIndex(
                name: "IX_CustomizationSlugAliases_TenantId_CustomizationId",
                table: "CustomizationSlugAliases");

            migrationBuilder.DropIndex(
                name: "IX_CustomizationSlugAliases_TenantId_Slug",
                table: "CustomizationSlugAliases");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Customers_TenantId_Id",
                schema: "quo",
                table: "Customers");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Categories_TenantId_Id",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Categories_TenantId_Slug",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "IsPlatformAdmin",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "UserCustomizations");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Templates");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "quo",
                table: "SupportRequests");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "RsvpEntries");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "quo",
                table: "QuotationTemplateVersions");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "quo",
                table: "QuotationTemplates");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "quo",
                table: "Quotations");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "quo",
                table: "QuotationItems");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "quo",
                table: "QuotationHistories");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "quo",
                table: "QuotationFiles");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "quo",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "quo",
                table: "ProductGroups");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "NavigationMenus");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "GuestbookEntries");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "CustomizationVersions");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "CustomizationSlugAliases");

            migrationBuilder.DropColumn(
                name: "TenantId",
                schema: "quo",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Categories");

            migrationBuilder.CreateIndex(
                name: "IX_UserCustomizations_PublishedVersionId",
                table: "UserCustomizations",
                column: "PublishedVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCustomizations_Slug",
                table: "UserCustomizations",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserCustomizations_UserId_ClientDraftId",
                table: "UserCustomizations",
                columns: new[] { "UserId", "ClientDraftId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Templates_CategoryId",
                table: "Templates",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Templates_Slug",
                table: "Templates",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_QuotationTemplateVersions_TemplateId_Version",
                schema: "quo",
                table: "QuotationTemplateVersions",
                columns: new[] { "TemplateId", "Version" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_QuotationTemplates_Code",
                schema: "quo",
                table: "QuotationTemplates",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Quotations_QuotationNumber",
                schema: "quo",
                table: "Quotations",
                column: "QuotationNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_QuotationItems_QuotationId",
                schema: "quo",
                table: "QuotationItems",
                column: "QuotationId");

            migrationBuilder.CreateIndex(
                name: "IX_QuotationHistories_QuotationId",
                schema: "quo",
                table: "QuotationHistories",
                column: "QuotationId");

            migrationBuilder.CreateIndex(
                name: "IX_QuotationFiles_QuotationId",
                schema: "quo",
                table: "QuotationFiles",
                column: "QuotationId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_Code",
                schema: "quo",
                table: "Products",
                column: "Code",
                unique: true);

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
                name: "IX_NavigationMenus_ParentId",
                table: "NavigationMenus",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomizationVersions_CustomizationId_RequestId",
                table: "CustomizationVersions",
                columns: new[] { "CustomizationId", "RequestId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CustomizationVersions_CustomizationId_VersionNumber",
                table: "CustomizationVersions",
                columns: new[] { "CustomizationId", "VersionNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CustomizationSlugAliases_CustomizationId",
                table: "CustomizationSlugAliases",
                column: "CustomizationId");

            migrationBuilder.CreateIndex(
                name: "IX_CustomizationSlugAliases_Slug",
                table: "CustomizationSlugAliases",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Categories_Slug",
                table: "Categories",
                column: "Slug",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_CustomizationSlugAliases_UserCustomizations_CustomizationId",
                table: "CustomizationSlugAliases",
                column: "CustomizationId",
                principalTable: "UserCustomizations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CustomizationVersions_UserCustomizations_CustomizationId",
                table: "CustomizationVersions",
                column: "CustomizationId",
                principalTable: "UserCustomizations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_GuestbookEntries_CustomizationVersions_CustomizationVersion~",
                table: "GuestbookEntries",
                column: "CustomizationVersionId",
                principalTable: "CustomizationVersions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_NavigationMenus_NavigationMenus_ParentId",
                table: "NavigationMenus",
                column: "ParentId",
                principalTable: "NavigationMenus",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Products_ProductGroups_GroupId",
                schema: "quo",
                table: "Products",
                column: "GroupId",
                principalSchema: "quo",
                principalTable: "ProductGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_QuotationFiles_Quotations_QuotationId",
                schema: "quo",
                table: "QuotationFiles",
                column: "QuotationId",
                principalSchema: "quo",
                principalTable: "Quotations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_QuotationHistories_Quotations_QuotationId",
                schema: "quo",
                table: "QuotationHistories",
                column: "QuotationId",
                principalSchema: "quo",
                principalTable: "Quotations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_QuotationItems_Quotations_QuotationId",
                schema: "quo",
                table: "QuotationItems",
                column: "QuotationId",
                principalSchema: "quo",
                principalTable: "Quotations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_QuotationTemplateVersions_QuotationTemplates_TemplateId",
                schema: "quo",
                table: "QuotationTemplateVersions",
                column: "TemplateId",
                principalSchema: "quo",
                principalTable: "QuotationTemplates",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RsvpEntries_CustomizationVersions_CustomizationVersionId",
                table: "RsvpEntries",
                column: "CustomizationVersionId",
                principalTable: "CustomizationVersions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Templates_Categories_CategoryId",
                table: "Templates",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_UserCustomizations_CustomizationVersions_PublishedVersionId",
                table: "UserCustomizations",
                column: "PublishedVersionId",
                principalTable: "CustomizationVersions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
