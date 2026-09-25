using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateLandingPage.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class VersionedPublishing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ClientDraftId",
                table: "UserCustomizations",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastSaveRequestHash",
                table: "UserCustomizations",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "LastSaveRequestId",
                table: "UserCustomizations",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LastSaveRevision",
                table: "UserCustomizations",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LastVersionNumber",
                table: "UserCustomizations",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "PublishedVersionId",
                table: "UserCustomizations",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Revision",
                table: "UserCustomizations",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.AddColumn<Guid>(
                name: "CustomizationVersionId",
                table: "RsvpEntries",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CustomizationVersionId",
                table: "GuestbookEntries",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CustomizationSlugAliases",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomizationId = table.Column<Guid>(type: "uuid", nullable: false),
                    Slug = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomizationSlugAliases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomizationSlugAliases_UserCustomizations_CustomizationId",
                        column: x => x.CustomizationId,
                        principalTable: "UserCustomizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CustomizationVersions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomizationId = table.Column<Guid>(type: "uuid", nullable: false),
                    VersionNumber = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ConfigJson = table.Column<string>(type: "text", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false),
                    PublishedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RequestId = table.Column<Guid>(type: "uuid", nullable: false),
                    RequestHash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    SourceRevision = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomizationVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomizationVersions_UserCustomizations_CustomizationId",
                        column: x => x.CustomizationId,
                        principalTable: "UserCustomizations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserCustomizations_PublishedVersionId",
                table: "UserCustomizations",
                column: "PublishedVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCustomizations_UserId_ClientDraftId",
                table: "UserCustomizations",
                columns: new[] { "UserId", "ClientDraftId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RsvpEntries_CustomizationVersionId_CreatedAtUtc",
                table: "RsvpEntries",
                columns: new[] { "CustomizationVersionId", "CreatedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_GuestbookEntries_CustomizationVersionId_CreatedAtUtc",
                table: "GuestbookEntries",
                columns: new[] { "CustomizationVersionId", "CreatedAtUtc" });

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
                name: "IX_CustomizationVersions_CustomizationId_RequestId",
                table: "CustomizationVersions",
                columns: new[] { "CustomizationId", "RequestId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CustomizationVersions_CustomizationId_VersionNumber",
                table: "CustomizationVersions",
                columns: new[] { "CustomizationId", "VersionNumber" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_GuestbookEntries_CustomizationVersions_CustomizationVersion~",
                table: "GuestbookEntries",
                column: "CustomizationVersionId",
                principalTable: "CustomizationVersions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RsvpEntries_CustomizationVersions_CustomizationVersionId",
                table: "RsvpEntries",
                column: "CustomizationVersionId",
                principalTable: "CustomizationVersions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserCustomizations_CustomizationVersions_PublishedVersionId",
                table: "UserCustomizations",
                column: "PublishedVersionId",
                principalTable: "CustomizationVersions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            // Preserve all legacy content, including deleted pages and orphaned responses.
            // Aliases stay reserved permanently; normalization collisions abort the transaction.
            migrationBuilder.Sql("""
                INSERT INTO "CustomizationVersions"
                    ("Id", "CustomizationId", "VersionNumber", "Title", "ConfigJson", "CreatedAtUtc",
                     "IsPublic", "PublishedAtUtc", "RequestId", "RequestHash", "SourceRevision")
                SELECT gen_random_uuid(), "Id", 1, "Title", "ConfigJson", "CreatedAtUtc",
                       "IsPublished" AND NOT "IsDeleted",
                       CASE WHEN "IsPublished" AND NOT "IsDeleted" THEN "CreatedAtUtc" ELSE NULL END,
                       gen_random_uuid(), 'legacy-migration', 1
                FROM "UserCustomizations";

                INSERT INTO "CustomizationSlugAliases" ("Id", "CustomizationId", "Slug", "CreatedAtUtc")
                SELECT gen_random_uuid(), "Id", lower(btrim("Slug")), "CreatedAtUtc"
                FROM "UserCustomizations";

                UPDATE "UserCustomizations" AS site SET "LastVersionNumber" = 1,
                    "PublishedVersionId" = CASE WHEN version."IsPublic" THEN version."Id" ELSE NULL END,
                    "IsPublished" = version."IsPublic"
                FROM "CustomizationVersions" AS version WHERE version."CustomizationId" = site."Id";

                UPDATE "RsvpEntries" AS response SET "CustomizationVersionId" = version."Id"
                FROM "CustomizationVersions" AS version WHERE response."CustomizationId" = version."CustomizationId";

                UPDATE "GuestbookEntries" AS response SET "CustomizationVersionId" = version."Id"
                FROM "CustomizationVersions" AS version WHERE response."CustomizationId" = version."CustomizationId";
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GuestbookEntries_CustomizationVersions_CustomizationVersion~",
                table: "GuestbookEntries");

            migrationBuilder.DropForeignKey(
                name: "FK_RsvpEntries_CustomizationVersions_CustomizationVersionId",
                table: "RsvpEntries");

            migrationBuilder.DropForeignKey(
                name: "FK_UserCustomizations_CustomizationVersions_PublishedVersionId",
                table: "UserCustomizations");

            migrationBuilder.DropTable(
                name: "CustomizationSlugAliases");

            migrationBuilder.DropTable(
                name: "CustomizationVersions");

            migrationBuilder.DropIndex(
                name: "IX_UserCustomizations_PublishedVersionId",
                table: "UserCustomizations");

            migrationBuilder.DropIndex(
                name: "IX_UserCustomizations_UserId_ClientDraftId",
                table: "UserCustomizations");

            migrationBuilder.DropIndex(
                name: "IX_RsvpEntries_CustomizationVersionId_CreatedAtUtc",
                table: "RsvpEntries");

            migrationBuilder.DropIndex(
                name: "IX_GuestbookEntries_CustomizationVersionId_CreatedAtUtc",
                table: "GuestbookEntries");

            migrationBuilder.DropColumn(
                name: "ClientDraftId",
                table: "UserCustomizations");

            migrationBuilder.DropColumn(
                name: "LastSaveRequestHash",
                table: "UserCustomizations");

            migrationBuilder.DropColumn(
                name: "LastSaveRequestId",
                table: "UserCustomizations");

            migrationBuilder.DropColumn(
                name: "LastSaveRevision",
                table: "UserCustomizations");

            migrationBuilder.DropColumn(
                name: "LastVersionNumber",
                table: "UserCustomizations");

            migrationBuilder.DropColumn(
                name: "PublishedVersionId",
                table: "UserCustomizations");

            migrationBuilder.DropColumn(
                name: "Revision",
                table: "UserCustomizations");

            migrationBuilder.DropColumn(
                name: "CustomizationVersionId",
                table: "RsvpEntries");

            migrationBuilder.DropColumn(
                name: "CustomizationVersionId",
                table: "GuestbookEntries");
        }
    }
}
