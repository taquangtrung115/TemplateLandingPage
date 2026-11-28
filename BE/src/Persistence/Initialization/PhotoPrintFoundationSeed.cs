namespace OnePortal.Persistence.Initialization;

using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using OnePortal.Domain.Entities.PhotoPrint;

public sealed class PhotoPrintFoundationSeed : ITenantSeedStep
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public string AppKey => "photoprint";
    public string Key => "foundation";
    public int Version => 2;

    public async Task ApplyAsync(ApplicationDbContext context, string tenantName, CancellationToken cancellationToken)
    {
        if (!await context.PhotoContactConfigs.AnyAsync(cancellationToken))
            context.PhotoContactConfigs.Add(new PhotoContactConfig { BrandName = tenantName });

        if (await context.PhotoCategories.AnyAsync(cancellationToken))
        {
            if (!await context.PhotoProducts.AnyAsync(product => product.Slug == "in-mau-photo-a4" || product.Code == "IN-MAU-PHOTO-A4", cancellationToken))
            {
                var category = await context.PhotoCategories.SingleOrDefaultAsync(item => item.Slug == "photocopy", cancellationToken);
                if (category is null)
                {
                    category = PhotocopyCategory();
                    context.PhotoCategories.Add(category);
                }
                context.PhotoProducts.Add(PhotocopyProduct(category, DateTime.UtcNow));
            }
            return;
        }

        var categories = new[]
        {
            Category("anh-le", "In ảnh lụa", "Ảnh lụa 4R, in lẻ hoặc gói 10 tấm.", "prints", 2),
            Category("polaroid", "Polaroid & Ép Plastic", "Ảnh viền trắng, ép Plastic để giữ ảnh sạch và khô.", "polaroid", 3),
            Category("trang-guong", "Ép gỗ & Tráng gương", "Ảnh dày, phủ bóng và hoàn thiện cạnh.", "crystal", 5),
            Category("khung-canvas", "Canvas & Khung ảnh", "Ảnh treo tường hoặc để bàn.", "frame", 6),
            Category("photobook", "Photobook & Album", "Album mở phẳng cho ảnh cưới và chuyến đi.", "book", 7),
            Category("anh-the", "Ảnh thẻ & Visa", "Ảnh 3×4, 4×6, visa và hộ chiếu. Có thể gửi file qua Zalo.", "id", 1),
            PhotocopyCategory(),
        };
        var now = DateTime.UtcNow;
        var products = new[]
        {
            Product(categories[0], "in-anh-10x15", "In ảnh lụa 4R", 3000, "framed_photo", now, [(10,15,3000), (13,18,4300), (15,21,6500)], true),
            Product(categories[0], "in-anh-a4", "In ảnh khổ lớn", 18000, "framed_photo", now, [(20,30,18000), (30,45,29000), (40,60,49000), (60,90,99000)], true),
            Product(categories[1], "anh-polaroid", "Polaroid ép Plastic", 45000, "polaroid_card", now, [(8,10,45000), (6,18,50000), (10,12,55000)], true),
            Product(categories[2], "anh-trang-guong", "Ảnh HD tráng gương", 240000, "crystal_mirror", now, [(40,60,240000), (30,45,185000), (60,90,410000)]),
            Product(categories[3], "tranh-canvas", "Tranh canvas căng khung", 580000, "canvas_wrap", now, [(30,45,null), (40,60,null), (60,90,null)]),
            Product(categories[3], "khung-anh-go-soi", "Khung ảnh gỗ sồi", 139000, "framed_photo", now, [(20,30,139000), (30,40,189000), (40,60,269000)]),
            Product(categories[4], "photobook-mo-phang", "Photobook mở phẳng", 390000, "photobook_open", now, [(40,24,390000), (48,30,520000)]),
            Product(categories[5], "anh-the", "Ảnh thẻ lấy liền", 25000, "framed_photo", now, [(3,4,25000), (4,6,25000), (5,5,30000)], true),
            PhotocopyProduct(categories[6], now),
        };
        context.PhotoCategories.AddRange(categories);
        context.PhotoProducts.AddRange(products);
        context.PhotoDemos.AddRange(
            Demo(products[5], "Khung gỗ sồi cho góc nhà", 30, 40, now),
            Demo(products[3], "Kỷ niệm dưới lớp pha lê", 40, 60, now),
            Demo(products[4], "Canvas treo tường", 40, 60, now),
            Demo(products[2], "Ảnh viền trắng từ một chuyến đi", 8, 10, now),
            Demo(products[6], "Album ảnh mở phẳng", 40, 24, now));
    }

    private static PhotoCategory PhotocopyCategory() => Category("photocopy", "In màu & Photocopy",
        "In màu laser, photocopy A4, scan PDF, đóng cuốn và ép dẻo.", "prints", 4);

    private static PhotoProduct PhotocopyProduct(PhotoCategory category, DateTime now) =>
        Product(category, "in-mau-photo-a4", "In màu & Photocopy A4", 20000, "framed_photo", now, [(21, 29.7m, 20000)], true);

    private static PhotoCategory Category(string slug, string name, string description, string image, int sortOrder) => new()
    {
        Slug = slug, Name = name, Description = description, SortOrder = sortOrder,
        ImageUrl = $"/assets/photo-{image}.webp", IsActive = true,
    };

    private static PhotoProduct Product(PhotoCategory category, string slug, string title, decimal price, string model, DateTime now,
        (decimal Width, decimal Height, decimal? Price)[] sizes, bool fast = false)
    {
        var surface = model switch
        {
            "crystal_mirror" => "Pha lê 5 mm", "canvas_wrap" => "Vải canvas", "photobook_open" => "Giấy album lụa",
            _ => slug switch
            {
                "in-anh-10x15" => "Giấy ảnh lụa Fujicolor",
                "anh-polaroid" => "Giấy ảnh ép Plastic",
                "in-mau-photo-a4" => "Giấy in laser A4",
                _ => "Giấy Fujifilm bóng",
            },
        };
        var unit = model == "canvas_wrap" ? "PerSqm" : "PerUnit";
        return new PhotoProduct
        {
            CategoryId = category.Id, Code = slug.ToUpperInvariant(), Name = title, Slug = slug, ShortDescription = category.Description,
            Description = "Kiểm tra cỡ, bề mặt và vùng cắt trên từng ảnh trước khi gửi in.",
            ThumbnailUrl = category.ImageUrl, GalleryJson = Serialize(new[] { category.ImageUrl, "/assets/photo-hero.webp" }),
            PricingMode = model == "canvas_wrap" ? "PerSqm" : "PerPrintSizeTier",
            BasePrice = price, MinBillableAreaSqm = model == "canvas_wrap" ? 0.2m : 0, DefaultModel3DType = model,
            ProductionTimeLabel = slug is "anh-the" or "in-mau-photo-a4" ? "Lấy liền 15p" : fast ? "Trong ngày" : "Đặt trước 1–2 ngày",
            ProductionHours = slug is "anh-the" or "in-mau-photo-a4" ? 1 : fast ? 12 : 36,
            RushSurchargePercent = fast ? 25 : 0, SupportsBatchUpload = true, MaxPhotosPerBatch = 50,
            IsFeatured = slug is "anh-the" or "in-anh-10x15" or "anh-polaroid" or "in-mau-photo-a4", IsActive = true, CreatedAtUtc = now, ModifiedAtUtc = now,
            PrintSizesJson = Serialize(sizes.Select(size => new { label = FormattableString.Invariant($"{size.Width} × {size.Height} cm"), widthCm = size.Width, heightCm = size.Height, priceDeltaOrBase = size.Price })),
            PaperOrSurfaceOptionsJson = Serialize(new[] { new { name = surface, finishType = model, pricePerUnitOrSqm = 0, pricingUnit = unit },
                new { name = fast ? "Giấy lụa mờ" : "Bề mặt phủ bảo vệ", finishType = model, pricePerUnitOrSqm = fast ? 800 : 15000, pricingUnit = unit } }),
            FinishingOptionsJson = slug == "in-mau-photo-a4"
                ? Serialize(new[] { new { name = "Scan PDF", price = 3000, mode = "PerUnit" },
                    new { name = "Đóng cuốn lò xo", price = 15000, mode = "PerUnit" }, new { name = "Ép dẻo", price = 10000, mode = "PerUnit" } })
                : Serialize(new[] { new { name = fast ? "Bo tròn bốn góc" : "Hộp quà tặng", price = fast ? 500 : 30000, mode = "PerUnit" } }),
            DiscountTiersJson = fast ? Serialize(new[] { new { minQty = 20, discountPercent = 10 }, new { minQty = 50, discountPercent = 15 } }) : "[]",
            UsageTypesJson = Serialize(slug is "anh-the" or "in-mau-photo-a4" ? new[] { "events" } : category.SortOrder <= 3 ? ["memories", "gifts"] : ["decor", "gifts"]),
        };
    }

    private static PhotoDemo Demo(PhotoProduct product, string title, decimal width, decimal height, DateTime now) => new()
    {
        Title = title, LinkedProductId = product.Id, Description = product.ShortDescription, WidthCm = width, HeightCm = height,
        Model3DType = product.DefaultModel3DType, StyleCategory = product.DefaultModel3DType, FrameColor = "oak",
        HasMatboard = product.DefaultModel3DType == "framed_photo", IsActive = true, PreviewImageUrl = product.ThumbnailUrl,
        TextureImageUrl = "/assets/photo-texture.webp", CreatedAtUtc = now,
    };

    private static string Serialize<T>(T value) => JsonSerializer.Serialize(value, Json);
}
