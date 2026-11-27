namespace OnePortal.Persistence.Repositories.PhotoPrint;

using System.Globalization;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using OnePortal.Contract.Services.V1.PhotoPrint.Products;
using OnePortal.Contract.Services.V1.PhotoPrint.Demos;
using OnePortal.Contract.Abstractions.Shared;
using OnePortal.Domain.Entities.PhotoPrint;

public sealed partial class PhotoPrintStore
{
    #region Catalog queries
    public async Task<Result<object>> GetCategoriesAsync(bool includeInactive, CancellationToken cancellationToken)
    {
        if (includeInactive && _actor.Role != "Admin") return Forbidden();
        var rows = await _database.PhotoCategories.AsNoTracking()
            .Where(item => !item.IsDeleted && (includeInactive || item.IsActive)).OrderBy(item => item.SortOrder).ThenBy(item => item.Name)
            .ToListAsync(cancellationToken);
        return Success(rows.Select(CategoryView).ToArray());
    }

    public async Task<Result<object>> SearchProductsAsync(PhotoCatalogFilter filter, CancellationToken cancellationToken)
    {
        if (filter.IncludeInactive && _actor.Role != "Admin") return Forbidden();
        var rows = from product in _database.PhotoProducts.AsNoTracking()
                   join category in _database.PhotoCategories.AsNoTracking() on product.CategoryId equals category.Id
                   where !product.IsDeleted && !category.IsDeleted && (filter.IncludeInactive || (product.IsActive && category.IsActive))
                   select new { product, category };
        if (Trim(filter.CategorySlug) is { } categorySlug) rows = rows.Where(row => row.category.Slug == categorySlug);
        if (filter.Featured) rows = rows.Where(row => row.product.IsFeatured);
        if (Trim(filter.Usage) is { } usage)
        {
            if (!UsageTypes.Contains(usage)) return Invalid("Mục đích sử dụng không hợp lệ.");
            var usageToken = Serialize(new[] { usage });
            rows = rows.Where(row => EF.Functions.JsonContains(row.product.UsageTypesJson, usageToken));
        }
        if (Trim(filter.Search) is { Length: <= 150 } term)
        {
            var search = term.ToLowerInvariant();
            var match = Regex.Match(search, @"^(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)(?:\s*cm)?$");
            if (match.Success && decimal.TryParse(match.Groups[1].Value.Replace(',', '.'), CultureInfo.InvariantCulture, out var width)
                && decimal.TryParse(match.Groups[2].Value.Replace(',', '.'), CultureInfo.InvariantCulture, out var height))
            {
                var normal = Serialize(new[] { new { widthCm = width, heightCm = height } });
                var rotated = Serialize(new[] { new { widthCm = height, heightCm = width } });
                rows = rows.Where(row => EF.Functions.JsonContains(row.product.PrintSizesJson, normal)
                    || EF.Functions.JsonContains(row.product.PrintSizesJson, rotated));
            }
            else rows = rows.Where(row => row.product.Name.ToLower().Contains(search) || (row.product.ShortDescription ?? "").ToLower().Contains(search));
        }

        var (page, pageSize) = Paging(filter.Page, filter.PageSize);
        var totalCount = await rows.CountAsync(cancellationToken);
        var sorted = filter.Sort switch
        {
            "priceAsc" => rows.OrderBy(row => row.product.BasePrice),
            "priceDesc" => rows.OrderByDescending(row => row.product.BasePrice),
            "fastest" => rows.OrderBy(row => row.product.ProductionHours ?? int.MaxValue),
            _ => rows.OrderByDescending(row => row.product.IsFeatured).ThenByDescending(row => row.product.CreatedAtUtc),
        };
        var entries = await sorted.ThenBy(row => row.product.Name).ThenBy(row => row.product.Id)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
        return Success(new { items = entries.Select(row => ProductView(row.product, row.category)).ToArray(), totalCount, page, pageSize });
    }

    public async Task<Result<object>> GetProductAsync(string slug, CancellationToken cancellationToken)
    {
        var entry = await (from product in _database.PhotoProducts.AsNoTracking()
                           join category in _database.PhotoCategories.AsNoTracking() on product.CategoryId equals category.Id
                           where product.Slug == slug && product.IsActive && !product.IsDeleted && category.IsActive && !category.IsDeleted
                           select new { product, category }).SingleOrDefaultAsync(cancellationToken);
        return entry is null ? Missing("Không tìm thấy sản phẩm.") : Success(ProductView(entry.product, entry.category));
    }

    public async Task<Result<object>> GetDemosAsync(string? model3DType, string? search, bool includeInactive, int page, int pageSize, CancellationToken cancellationToken)
    {
        if (includeInactive && _actor.Role != "Admin") return Forbidden();
        var demos = _database.PhotoDemos.AsNoTracking().Where(item => !item.IsDeleted && (includeInactive || item.IsActive));
        if (Trim(model3DType) is { } model) demos = demos.Where(item => item.Model3DType == model);
        if (Trim(search) is { Length: <= 150 } term)
        {
            var keyword = term.ToLowerInvariant();
            demos = demos.Where(item => item.Title.ToLower().Contains(keyword) || (item.Description ?? "").ToLower().Contains(keyword));
        }
        (page, pageSize) = Paging(page, pageSize);
        var totalCount = await demos.CountAsync(cancellationToken);
        var selected = await (from demo in demos
                              join product in _database.PhotoProducts.AsNoTracking().Where(item => !item.IsDeleted && (includeInactive || item.IsActive))
                                  on demo.LinkedProductId equals (Guid?)product.Id into matching
                              from item in matching.DefaultIfEmpty()
                              orderby demo.IsFeatured descending, demo.CreatedAtUtc descending, demo.Id
                              select new
                              {
                                  demo.Id, demo.LinkedProductId, linkedProductSlug = item == null ? null : item.Slug,
                                  demo.Title, demo.StyleCategory, demo.Description, demo.PreviewImageUrl, demo.TextureImageUrl,
                                  demo.Model3DType, demo.WidthCm, demo.HeightCm, demo.FrameColor, demo.HasMatboard, demo.IsFeatured, demo.IsActive,
                              }).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
        return Success(new { items = selected, totalCount, page, pageSize });
    }
    #endregion

    #region Catalog commands
    public async Task<Result<object>> SaveCategoryAsync(Guid? id, PhotoCategoryInput input, CancellationToken cancellationToken)
    {
        if (_actor.Role != "Admin") return Forbidden();
        if (!Required(input.Name, 150) || !IsSlug(input.Slug) || !Fits(input.Description, 1200) || !Fits(input.IconName, 60) || !Asset(input.ImageUrl))
            return Invalid("Kiểm tra tên, slug và ảnh của nhóm.");
        var row = id.HasValue ? await _database.PhotoCategories.SingleOrDefaultAsync(item => item.Id == id && !item.IsDeleted, cancellationToken) : new PhotoCategory();
        if (row is null) return Missing();
        if (!id.HasValue) _database.PhotoCategories.Add(row);
        row.Name = input.Name.Trim();
        row.Slug = input.Slug;
        row.Description = Trim(input.Description);
        row.IconName = Trim(input.IconName);
        row.ImageUrl = Trim(input.ImageUrl);
        row.IsActive = input.IsActive;
        row.SortOrder = input.SortOrder;
        return await SaveAsync(() => CategoryView(row), cancellationToken);
    }

    public async Task<Result<object>> DeleteCategoryAsync(Guid id, CancellationToken cancellationToken)
    {
        if (_actor.Role != "Admin") return Forbidden();
        var category = await _database.PhotoCategories.SingleOrDefaultAsync(item => item.Id == id && !item.IsDeleted, cancellationToken);
        if (category is null) return Missing();
        if (await _database.PhotoProducts.AnyAsync(item => item.CategoryId == id && !item.IsDeleted, cancellationToken))
            return Conflict("Chuyển các sản phẩm sang nhóm khác trước khi xóa nhóm.");
        category.IsDeleted = true;
        category.IsActive = false;
        return await SaveAsync(() => new { id }, cancellationToken);
    }

    public async Task<Result<object>> SaveProductAsync(Guid? id, PhotoProductInput input, CancellationToken cancellationToken)
    {
        if (_actor.Role != "Admin") return Forbidden();
        if (!ValidProduct(input)) return Invalid("Kiểm tra cỡ, bề mặt, khung và bảng giá sản phẩm.");
        var category = await _database.PhotoCategories.AsNoTracking().SingleOrDefaultAsync(item => item.Id == input.CategoryId && !item.IsDeleted, cancellationToken);
        if (category is null) return Invalid("Nhóm sản phẩm không hợp lệ.");
        var row = id.HasValue ? await _database.PhotoProducts.SingleOrDefaultAsync(item => item.Id == id && !item.IsDeleted, cancellationToken) : new PhotoProduct();
        if (row is null) return Missing();
        var now = DateTime.UtcNow;
        if (!id.HasValue)
        {
            row.CreatedAtUtc = now;
            _database.PhotoProducts.Add(row);
        }

        row.CategoryId = category.Id;
        row.Code = input.Code.Trim().ToUpperInvariant();
        row.Name = input.Name.Trim();
        row.Slug = input.Slug;
        row.ShortDescription = Trim(input.ShortDescription);
        row.Description = Trim(input.Description);
        row.ThumbnailUrl = Trim(input.ThumbnailUrl);
        row.GalleryJson = Serialize(input.Gallery ?? []);
        row.PricingMode = input.PricingMode;
        row.BasePrice = input.BasePrice;
        row.MinBillableAreaSqm = input.MinBillableAreaSqm;
        row.SupportsBatchUpload = input.SupportsBatchUpload;
        row.MaxPhotosPerBatch = input.MaxPhotosPerBatch;
        row.ProductionTimeLabel = Trim(input.ProductionTimeLabel);
        row.ProductionHours = input.ProductionHours;
        row.RushSurchargePercent = input.RushSurchargePercent;
        row.PrintSizesJson = Serialize(input.PrintSizes ?? []);
        row.PaperOrSurfaceOptionsJson = Serialize(input.PaperOrSurfaceOptions ?? []);
        row.FinishingOptionsJson = Serialize(input.FinishingOptions ?? []);
        row.DiscountTiersJson = Serialize(input.DiscountTiers ?? []);
        row.UsageTypesJson = Serialize(input.UsageTypes ?? []);
        row.DefaultModel3DType = input.DefaultModel3DType;
        row.IsFeatured = input.IsFeatured;
        row.IsActive = input.IsActive;
        row.ModifiedAtUtc = now;
        return await SaveAsync(() => ProductView(row, category), cancellationToken);
    }

    public async Task<Result<object>> DeleteProductAsync(Guid id, CancellationToken cancellationToken)
    {
        if (_actor.Role != "Admin") return Forbidden();
        var row = await _database.PhotoProducts.SingleOrDefaultAsync(item => item.Id == id && !item.IsDeleted, cancellationToken);
        if (row is null) return Missing();
        row.IsActive = false;
        row.IsDeleted = true;
        row.ModifiedAtUtc = DateTime.UtcNow;
        return await SaveAsync(() => new { id }, cancellationToken);
    }

    public async Task<Result<object>> SaveDemoAsync(Guid? id, PhotoDemoInput input, CancellationToken cancellationToken)
    {
        if (_actor.Role != "Admin") return Forbidden();
        if (!Required(input.Title, 150) || !Models.Contains(input.Model3DType) || !IsSize(input.WidthCm, input.HeightCm)
            || !Fits(input.Description, 1500) || !Fits(input.StyleCategory, 70) || !Asset(input.PreviewImageUrl) || !Asset(input.TextureImageUrl)
            || (input.FrameColor is not null && !FrameColors.Contains(input.FrameColor))) return Invalid("Kiểm tra mô tả, ảnh và quy cách bản mẫu.");
        if (input.LinkedProductId.HasValue && !await _database.PhotoProducts.AnyAsync(item => item.Id == input.LinkedProductId && !item.IsDeleted, cancellationToken))
            return Invalid("Sản phẩm liên kết không hợp lệ.");
        var row = id.HasValue ? await _database.PhotoDemos.SingleOrDefaultAsync(item => item.Id == id && !item.IsDeleted, cancellationToken) : new PhotoDemo();
        if (row is null) return Missing();
        if (!id.HasValue)
        {
            row.CreatedAtUtc = DateTime.UtcNow;
            _database.PhotoDemos.Add(row);
        }
        row.LinkedProductId = input.LinkedProductId;
        row.Title = input.Title.Trim();
        row.StyleCategory = Trim(input.StyleCategory);
        row.Description = Trim(input.Description);
        row.PreviewImageUrl = Trim(input.PreviewImageUrl);
        row.TextureImageUrl = Trim(input.TextureImageUrl);
        row.Model3DType = input.Model3DType;
        row.WidthCm = input.WidthCm;
        row.HeightCm = input.HeightCm;
        row.FrameColor = input.FrameColor;
        row.HasMatboard = input.HasMatboard;
        row.IsFeatured = input.IsFeatured;
        row.IsActive = input.IsActive;
        return await SaveAsync(() => new { row.Id }, cancellationToken);
    }

    public async Task<Result<object>> DeleteDemoAsync(Guid id, CancellationToken cancellationToken)
    {
        if (_actor.Role != "Admin") return Forbidden();
        var row = await _database.PhotoDemos.SingleOrDefaultAsync(item => item.Id == id && !item.IsDeleted, cancellationToken);
        if (row is null) return Missing();
        row.IsDeleted = true;
        row.IsActive = false;
        return await SaveAsync(() => new { id }, cancellationToken);
    }
    #endregion

    #region Catalog rules and views
    private static bool ValidProduct(PhotoProductInput input)
    {
        if (!Required(input.Name, 150) || !Required(input.Code, 72) || !IsSlug(input.Slug) || !Models.Contains(input.DefaultModel3DType)
            || !PricingModes.Contains(input.PricingMode) || !IsPrice(input.BasePrice) || input.MinBillableAreaSqm is < 0 or > 25
            || input.RushSurchargePercent is < 0 or > 100 || input.MaxPhotosPerBatch is < 1 or > 50
            || !Fits(input.ShortDescription, 300) || !Fits(input.Description, 3000) || !Fits(input.ProductionTimeLabel, 70)
            || input.ProductionHours is < 1 or > 10000 || !Asset(input.ThumbnailUrl)) return false;

        var sizes = input.PrintSizes ?? [];
        var surfaces = input.PaperOrSurfaceOptions ?? [];
        var finishing = input.FinishingOptions ?? [];
        var tiers = input.DiscountTiers ?? [];
        var gallery = input.Gallery ?? [];
        var usage = input.UsageTypes ?? [];
        if ((input.PricingMode == "PerPrintSizeTier" && sizes.Length == 0) || sizes.Length > 30 || surfaces.Length > 25 || finishing.Length > 25
            || tiers.Length > 20 || gallery.Length > 20 || usage.Length > 4) return false;
        return sizes.All(size => size is not null && Required(size.Label, 60) && IsSize(size.WidthCm, size.HeightCm) &&
                   (size.PriceDeltaOrBase is null || IsPrice(size.PriceDeltaOrBase.Value)))
            && sizes.Select(size => size.Label).Distinct().Count() == sizes.Length
            && surfaces.All(surface => surface is not null && Required(surface.Name, 90) && IsPrice(surface.PricePerUnitOrSqm) &&
                   Fits(surface.Description, 250) && Fits(surface.FinishType, 70) && Unit(surface.PricingUnit))
            && surfaces.Select(surface => surface.Name).Distinct().Count() == surfaces.Length
            && finishing.All(option => option is not null && Required(option.Name, 90) && IsPrice(option.Price) && ChargeUnits.Contains(option.Mode))
            && finishing.Select(option => option.Name).Distinct().Count() == finishing.Length
            && tiers.All(tier => tier is not null && tier.MinQty > 0 && tier.DiscountPercent is >= 0 and <= 100)
            && tiers.Select(tier => tier.MinQty).Distinct().Count() == tiers.Length && gallery.All(Asset) && usage.All(UsageTypes.Contains);
    }

    private static object CategoryView(PhotoCategory row) => new
    {
        row.Id, row.Name, row.Slug, row.Description, row.IconName, row.ImageUrl, row.SortOrder, row.IsActive,
    };

    private static object ProductView(PhotoProduct row, PhotoCategory category) => new
    {
        row.Id, row.CategoryId, categorySlug = category.Slug, categoryName = category.Name, row.Code, row.Name, row.Slug,
        row.ShortDescription, row.Description, row.ThumbnailUrl, row.GalleryJson, row.PricingMode, row.BasePrice, row.MinBillableAreaSqm,
        row.SupportsBatchUpload, row.MaxPhotosPerBatch, row.ProductionTimeLabel, row.ProductionHours, row.RushSurchargePercent, row.PrintSizesJson,
        row.PaperOrSurfaceOptionsJson, row.FinishingOptionsJson, row.DiscountTiersJson, row.UsageTypesJson,
        row.DefaultModel3DType, row.IsFeatured, row.IsActive,
    };
    #endregion
}
