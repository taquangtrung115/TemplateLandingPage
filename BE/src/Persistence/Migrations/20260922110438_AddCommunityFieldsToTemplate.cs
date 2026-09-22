using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TemplateLandingPage.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCommunityFieldsToTemplate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AuthorName",
                table: "Templates",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedByUserId",
                table: "Templates",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsCommunity",
                table: "Templates",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AuthorName",
                table: "Templates");

            migrationBuilder.DropColumn(
                name: "CreatedByUserId",
                table: "Templates");

            migrationBuilder.DropColumn(
                name: "IsCommunity",
                table: "Templates");
        }
    }
}
