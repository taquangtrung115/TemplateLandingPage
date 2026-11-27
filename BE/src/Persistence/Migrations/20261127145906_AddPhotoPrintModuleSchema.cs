using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OnePortal.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPhotoPrintModuleSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "photo");

            migrationBuilder.CreateTable(
                name: "Categories",
                schema: "photo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Slug = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IconName = table.Column<string>(type: "text", nullable: true),
                    ImageUrl = table.Column<string>(type: "text", nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                    table.UniqueConstraint("AK_Categories_TenantId_Id", x => new { x.TenantId, x.Id });
                    table.ForeignKey(
                        name: "FK_Categories_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "platform",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ContactConfigs",
                schema: "photo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BrandName = table.Column<string>(type: "text", nullable: false),
                    Hotline = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: true),
                    Address = table.Column<string>(type: "text", nullable: true),
                    WorkingHours = table.Column<string>(type: "text", nullable: true),
                    MessengerEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    MessengerPageIdOrUsername = table.Column<string>(type: "text", nullable: true),
                    MessengerLinkOverride = table.Column<string>(type: "text", nullable: true),
                    MessengerPrefillText = table.Column<string>(type: "text", nullable: true),
                    MessengerQrImageUrl = table.Column<string>(type: "text", nullable: true),
                    FbCustomerChatEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    FbAppId = table.Column<string>(type: "text", nullable: true),
                    ZaloEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    ZaloAccountName = table.Column<string>(type: "text", nullable: true),
                    ZaloPhoneOrOaId = table.Column<string>(type: "text", nullable: true),
                    ZaloLinkOverride = table.Column<string>(type: "text", nullable: true),
                    ZaloPrefillText = table.Column<string>(type: "text", nullable: true),
                    ZaloQrImageUrl = table.Column<string>(type: "text", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContactConfigs", x => x.Id);
                    table.UniqueConstraint("AK_ContactConfigs_TenantId_Id", x => new { x.TenantId, x.Id });
                    table.ForeignKey(
                        name: "FK_ContactConfigs_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "platform",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Orders",
                schema: "photo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderCode = table.Column<string>(type: "text", nullable: false),
                    CustomerName = table.Column<string>(type: "text", nullable: false),
                    CustomerPhone = table.Column<string>(type: "text", nullable: false),
                    CustomerEmail = table.Column<string>(type: "text", nullable: true),
                    DeliveryAddress = table.Column<string>(type: "text", nullable: true),
                    DeliveryMethod = table.Column<string>(type: "text", nullable: false),
                    PaymentMethod = table.Column<string>(type: "text", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    SubTotal = table.Column<decimal>(type: "numeric", nullable: false),
                    DiscountTotal = table.Column<decimal>(type: "numeric", nullable: false),
                    GrandTotal = table.Column<decimal>(type: "numeric", nullable: false),
                    TotalPhotoCount = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    AdminNote = table.Column<string>(type: "text", nullable: true),
                    Revision = table.Column<int>(type: "integer", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.Id);
                    table.UniqueConstraint("AK_Orders_TenantId_Id", x => new { x.TenantId, x.Id });
                    table.ForeignKey(
                        name: "FK_Orders_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "platform",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SupportRequests",
                schema: "photo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TicketCode = table.Column<string>(type: "text", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    FullName = table.Column<string>(type: "text", nullable: false),
                    Phone = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: true),
                    Topic = table.Column<string>(type: "text", nullable: false),
                    Priority = table.Column<string>(type: "text", nullable: false),
                    OrderCode = table.Column<string>(type: "text", nullable: true),
                    AttachmentUrl = table.Column<string>(type: "text", nullable: true),
                    Message = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    AdminNote = table.Column<string>(type: "text", nullable: true),
                    Revision = table.Column<int>(type: "integer", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ResolvedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    ResolvedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SupportRequests", x => x.Id);
                    table.UniqueConstraint("AK_SupportRequests_TenantId_Id", x => new { x.TenantId, x.Id });
                    table.ForeignKey(
                        name: "FK_SupportRequests_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "platform",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Products",
                schema: "photo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Slug = table.Column<string>(type: "text", nullable: false),
                    ShortDescription = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    ThumbnailUrl = table.Column<string>(type: "text", nullable: true),
                    GalleryJson = table.Column<string>(type: "jsonb", nullable: false),
                    PricingMode = table.Column<string>(type: "text", nullable: false),
                    BasePrice = table.Column<decimal>(type: "numeric", nullable: false),
                    MinBillableAreaSqm = table.Column<decimal>(type: "numeric", nullable: false),
                    SupportsBatchUpload = table.Column<bool>(type: "boolean", nullable: false),
                    MaxPhotosPerBatch = table.Column<int>(type: "integer", nullable: false),
                    ProductionTimeLabel = table.Column<string>(type: "text", nullable: true),
                    ProductionHours = table.Column<int>(type: "integer", nullable: true),
                    RushSurchargePercent = table.Column<decimal>(type: "numeric", nullable: false),
                    PrintSizesJson = table.Column<string>(type: "jsonb", nullable: false),
                    PaperOrSurfaceOptionsJson = table.Column<string>(type: "jsonb", nullable: false),
                    FinishingOptionsJson = table.Column<string>(type: "jsonb", nullable: false),
                    DiscountTiersJson = table.Column<string>(type: "jsonb", nullable: false),
                    UsageTypesJson = table.Column<string>(type: "jsonb", nullable: false),
                    DefaultModel3DType = table.Column<string>(type: "text", nullable: false),
                    IsFeatured = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ModifiedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Products", x => x.Id);
                    table.UniqueConstraint("AK_Products_TenantId_Id", x => new { x.TenantId, x.Id });
                    table.ForeignKey(
                        name: "FK_Products_Categories_TenantId_CategoryId",
                        columns: x => new { x.TenantId, x.CategoryId },
                        principalSchema: "photo",
                        principalTable: "Categories",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Products_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "platform",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Demos",
                schema: "photo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LinkedProductId = table.Column<Guid>(type: "uuid", nullable: true),
                    Title = table.Column<string>(type: "text", nullable: false),
                    StyleCategory = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    PreviewImageUrl = table.Column<string>(type: "text", nullable: true),
                    TextureImageUrl = table.Column<string>(type: "text", nullable: true),
                    Model3DType = table.Column<string>(type: "text", nullable: false),
                    WidthCm = table.Column<decimal>(type: "numeric", nullable: false),
                    HeightCm = table.Column<decimal>(type: "numeric", nullable: false),
                    FrameColor = table.Column<string>(type: "text", nullable: true),
                    HasMatboard = table.Column<bool>(type: "boolean", nullable: false),
                    IsFeatured = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Demos", x => x.Id);
                    table.UniqueConstraint("AK_Demos_TenantId_Id", x => new { x.TenantId, x.Id });
                    table.ForeignKey(
                        name: "FK_Demos_Products_TenantId_LinkedProductId",
                        columns: x => new { x.TenantId, x.LinkedProductId },
                        principalSchema: "photo",
                        principalTable: "Products",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Demos_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "platform",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OrderItems",
                schema: "photo",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProductName = table.Column<string>(type: "text", nullable: false),
                    SizeLabel = table.Column<string>(type: "text", nullable: true),
                    WidthCm = table.Column<decimal>(type: "numeric", nullable: false),
                    HeightCm = table.Column<decimal>(type: "numeric", nullable: false),
                    SurfaceName = table.Column<string>(type: "text", nullable: true),
                    FinishingSummary = table.Column<string>(type: "text", nullable: true),
                    TurnaroundMode = table.Column<string>(type: "text", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric", nullable: false),
                    LineTotal = table.Column<decimal>(type: "numeric", nullable: false),
                    PhotoFilesJson = table.Column<string>(type: "jsonb", nullable: false),
                    SendAlbumLater = table.Column<bool>(type: "boolean", nullable: false),
                    AlbumUrl = table.Column<string>(type: "text", nullable: true),
                    ProductOptionsJson = table.Column<string>(type: "jsonb", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderItems", x => x.Id);
                    table.UniqueConstraint("AK_OrderItems_TenantId_Id", x => new { x.TenantId, x.Id });
                    table.ForeignKey(
                        name: "FK_OrderItems_Orders_TenantId_OrderId",
                        columns: x => new { x.TenantId, x.OrderId },
                        principalSchema: "photo",
                        principalTable: "Orders",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OrderItems_Products_TenantId_ProductId",
                        columns: x => new { x.TenantId, x.ProductId },
                        principalSchema: "photo",
                        principalTable: "Products",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OrderItems_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "platform",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Categories_TenantId_IsActive_IsDeleted_SortOrder",
                schema: "photo",
                table: "Categories",
                columns: new[] { "TenantId", "IsActive", "IsDeleted", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_PhotoCategories_TenantId_Slug",
                schema: "photo",
                table: "Categories",
                columns: new[] { "TenantId", "Slug" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ContactConfigs_TenantId",
                schema: "photo",
                table: "ContactConfigs",
                column: "TenantId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Demos_TenantId_LinkedProductId",
                schema: "photo",
                table: "Demos",
                columns: new[] { "TenantId", "LinkedProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_TenantId_OrderId",
                schema: "photo",
                table: "OrderItems",
                columns: new[] { "TenantId", "OrderId" });

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_TenantId_ProductId",
                schema: "photo",
                table: "OrderItems",
                columns: new[] { "TenantId", "ProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_Orders_TenantId_OrderCode",
                schema: "photo",
                table: "Orders",
                columns: new[] { "TenantId", "OrderCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_TenantId_Status_CreatedAtUtc",
                schema: "photo",
                table: "Orders",
                columns: new[] { "TenantId", "Status", "CreatedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_Products_TenantId_CategoryId",
                schema: "photo",
                table: "Products",
                columns: new[] { "TenantId", "CategoryId" });

            migrationBuilder.CreateIndex(
                name: "IX_PhotoProducts_TenantId_Code",
                schema: "photo",
                table: "Products",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Products_TenantId_IsActive_IsDeleted_IsFeatured",
                schema: "photo",
                table: "Products",
                columns: new[] { "TenantId", "IsActive", "IsDeleted", "IsFeatured" });

            migrationBuilder.CreateIndex(
                name: "IX_Products_TenantId_Slug",
                schema: "photo",
                table: "Products",
                columns: new[] { "TenantId", "Slug" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SupportRequests_TenantId_Status_CreatedAtUtc",
                schema: "photo",
                table: "SupportRequests",
                columns: new[] { "TenantId", "Status", "CreatedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_SupportRequests_TenantId_TicketCode",
                schema: "photo",
                table: "SupportRequests",
                columns: new[] { "TenantId", "TicketCode" },
                unique: true);

            migrationBuilder.Sql("""
                CREATE SEQUENCE photo."OrderNumbers" AS bigint;
                CREATE SEQUENCE photo."SupportNumbers" AS bigint;
                INSERT INTO platform."Applications" ("Id", "Name") VALUES ('photoprint', 'Photo Print');
                INSERT INTO platform."Tenants" ("Id", "Key", "Name", "IsActive", "CreatedAtUtc") VALUES
                    ('6ba7809b-1af1-42ad-80e7-a2da9d58c004', 'photoprint-default', 'Photo Print', TRUE, CURRENT_TIMESTAMP)
                    ON CONFLICT ("Id") DO NOTHING;
                INSERT INTO platform."TenantApplications" ("Id", "TenantId", "AppKey", "IsEnabled", "AllowSelfRegistration", "ProvisioningStatus", "SeedVersion") VALUES
                    ('6ba7809b-1af1-42ad-80e7-a2da9d58c014', '6ba7809b-1af1-42ad-80e7-a2da9d58c004', 'photoprint', TRUE, FALSE, 'Provisioning', 0);
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContactConfigs",
                schema: "photo");

            migrationBuilder.DropTable(
                name: "Demos",
                schema: "photo");

            migrationBuilder.DropTable(
                name: "OrderItems",
                schema: "photo");

            migrationBuilder.DropTable(
                name: "SupportRequests",
                schema: "photo");

            migrationBuilder.DropTable(
                name: "Orders",
                schema: "photo");

            migrationBuilder.DropTable(
                name: "Products",
                schema: "photo");

            migrationBuilder.DropTable(
                name: "Categories",
                schema: "photo");

            migrationBuilder.Sql("""
                DROP SEQUENCE photo."OrderNumbers";
                DROP SEQUENCE photo."SupportNumbers";
                DELETE FROM platform."TenantMemberships" WHERE "AppKey" = 'photoprint';
                DELETE FROM platform."TenantSeedHistory" WHERE "AppKey" = 'photoprint';
                DELETE FROM platform."TenantApplications" WHERE "AppKey" = 'photoprint';
                DELETE FROM platform."Applications" WHERE "Id" = 'photoprint';
                """);
        }
    }
}
