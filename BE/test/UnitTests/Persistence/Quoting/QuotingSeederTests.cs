namespace TemplateLandingPage.UnitTests.Persistence.Quoting;

using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using TemplateLandingPage.Domain.Entities.Quoting;
using TemplateLandingPage.Persistence;
using TemplateLandingPage.Persistence.Data;
using Xunit;

public class QuotingSeederTests : IDisposable
{
    private readonly ApplicationDbContext _dbContext;

    public QuotingSeederTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: $"SeederQuotingDb_{Guid.NewGuid()}")
            .Options;

        _dbContext = new ApplicationDbContext(options);
    }

    public void Dispose()
    {
        _dbContext.Database.EnsureDeleted();
        _dbContext.Dispose();
    }

    #region 1. Happy Paths (Đường chạy thuận lợi)

    [Fact]
    public async Task SeedAsync_WhenDatabaseIsEmpty_ShouldSeed11StandardProducts_AndSystemTemplate()
    {
        // Act
        await QuotingSeeder.SeedAsync(_dbContext);

        // Assert - 1. Hệ thống có đúng 11 sản phẩm chuẩn
        var products = await _dbContext.QuotingProducts.ToListAsync();
        products.Should().HaveCount(11);
        var groups = await _dbContext.QuotingProductGroups.OrderBy(group => group.SortOrder).ToListAsync();
        groups.Select(group => group.Code).Should().Equal("COMBO", "XIEN-QUE");
        groups.Select(group => group.SortOrder).Should().Equal(1, 2);
        products.Should().OnlyContain(product => product.GroupId.HasValue);

        // 2. 6 Sản phẩm dòng Combo có ĐVT "GÓI"
        var comboProducts = products.Where(p => p.Category == "A/ DÒNG COMBO").ToList();
        comboProducts.Should().HaveCount(6);
        comboProducts.All(p => p.Unit == "GÓI").Should().BeTrue();

        var cb01 = products.First(p => p.Code == "CB-01");
        cb01.Name.Should().Be("COMBO NGUYÊN BẢN BAO NGON");
        cb01.Price.Should().Be(18000m);
        cb01.Description.Should().Contain("Surimi Hải sản");

        var cb04 = products.First(p => p.Code == "CB-04");
        cb04.Name.Should().Be("SURIMI TÔM TÍCH + KHOAI TÂY");
        cb04.Price.Should().Be(31500m);

        // 3. 5 Sản phẩm dòng Xiên Que với ĐVT "10 QUE/GÓI" hoặc "10 CUỘN/GÓI"
        var xienQueProducts = products.Where(p => p.Category == "B/ DÒNG SẢN PHẨM XIÊN QUE").ToList();
        xienQueProducts.Should().HaveCount(5);

        var xq01 = products.First(p => p.Code == "XQ-01");
        xq01.Name.Should().Be("XIÊN QUE SURIMI HẢI SẢN");
        xq01.Unit.Should().Be("10 QUE/GÓI");
        xq01.Price.Should().Be(25000m);

        var xq03 = products.First(p => p.Code == "XQ-03");
        xq03.Name.Should().Be("XIÊN QUE SURIMI TÔM TÍCH");
        xq03.Unit.Should().Be("10 QUE/GÓI");
        xq03.Price.Should().Be(75000m);

        var xq04 = products.First(p => p.Code == "XQ-04");
        xq04.Name.Should().Be("SURIMI TÔM TƯƠI CUỘN RONG BIỂN");
        xq04.Unit.Should().Be("10 CUỘN/GÓI");
        xq04.Price.Should().Be(40000m);

        var xq05 = products.First(p => p.Code == "XQ-05");
        xq05.Name.Should().Be("SURIMI TÔM TÍCH CUỘN RONG BIỂN");
        xq05.Unit.Should().Be("10 CUỘN/GÓI");
        xq05.Price.Should().Be(50000m);

        // 4. Mẫu Template hệ thống chuẩn Chuỗi Ăn Vặt V1
        var template = await _dbContext.QuotationTemplates
            .Include(t => t.Versions)
            .FirstOrDefaultAsync(t => t.Code == "TPL-CHUOI-AN-VAT-V1");
        template.Should().NotBeNull();
        template!.IsSystem.Should().BeTrue();
        template.Versions.Should().HaveCount(1);
    }

    #endregion

    #region 2. Edge Cases (Tính bất biến Idempotent & Cập nhật dữ liệu cũ)

    [Fact]
    public async Task SeedAsync_WhenDefaultGroupWasCustomized_ShouldReuseItsIdentityAndConfiguration()
    {
        var combo = QuotingProductGroup.Create("COMBO", "Combo đã đổi tên", "Ghi chú riêng", 9, false);
        var product = QuotingProduct.Create("CB-01", "Combo giá riêng", null, "Hộp", 20000m, null, null);
        _dbContext.QuotingProductGroups.Add(combo);
        _dbContext.QuotingProducts.Add(product);
        await _dbContext.SaveChangesAsync();

        await QuotingSeeder.SeedAsync(_dbContext);

        (await _dbContext.QuotingProductGroups.CountAsync()).Should().Be(2);
        var saved = await _dbContext.QuotingProductGroups.SingleAsync(group => group.Code == "COMBO");
        saved.Id.Should().Be(combo.Id);
        saved.Name.Should().Be("Combo đã đổi tên");
        saved.Description.Should().Be("Ghi chú riêng");
        saved.SortOrder.Should().Be(9);
        saved.IsActive.Should().BeFalse();
        product.GroupId.Should().Be(combo.Id);
        product.Category.Should().BeNull();
        product.Price.Should().Be(20000m);
    }

    [Fact]
    public async Task SeedAsync_WhenExecutedMultipleTimes_ShouldBeIdempotentAndNotDuplicateData()
    {
        // Act - Chạy Seeder lần 1
        await QuotingSeeder.SeedAsync(_dbContext);

        // Act - Chạy Seeder lần 2
        await QuotingSeeder.SeedAsync(_dbContext);

        // Assert - Số lượng sản phẩm vẫn giữ nguyên 11, không bị double lên 22
        var productCount = await _dbContext.QuotingProducts.CountAsync();
        productCount.Should().Be(11);

        // Template vẫn chỉ có 1 bản ghi
        var templateCount = await _dbContext.QuotationTemplates.CountAsync();
        templateCount.Should().Be(1);
    }

    [Fact]
    public async Task SeedAsync_WhenProductAlreadyExists_ShouldPreserveUserChanges()
    {
        // Arrange - Giả lập DB đã có bản ghi cũ với ĐVT sai "Phần" và giá cũ 12000
        var outdatedProduct = QuotingProduct.Create(
            "CB-01",
            "Combo cũ",
            "Mô tả sơ sài",
            "Phần",
            12000m,
            "COMBO",
            null);
        _dbContext.QuotingProducts.Add(outdatedProduct);
        await _dbContext.SaveChangesAsync();

        // Act - Chạy seeder
        await QuotingSeeder.SeedAsync(_dbContext);

        // Assert - Sản phẩm CB-01 được cập nhật về đúng chuẩn mới
        var updated = await _dbContext.QuotingProducts.FirstAsync(p => p.Code == "CB-01");
        updated.Unit.Should().Be("Phần");
        updated.Price.Should().Be(12000m);
        updated.Name.Should().Be("Combo cũ");
        updated.Category.Should().BeNull();
        updated.GroupId.Should().Be((await _dbContext.QuotingProductGroups.SingleAsync(group => group.Code == "COMBO")).Id);

        // Tổng số sản phẩm sau khi bù đắp 10 sản phẩm còn lại vẫn là 11
        var totalCount = await _dbContext.QuotingProducts.CountAsync();
        totalCount.Should().Be(11);
    }

    #endregion

    #region 3. Negative / Failure Cases (Trường hợp xử lý DbContext bất thường)

    [Fact]
    public async Task SeedAsync_WhenDbContextIsDisposed_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: $"DisposedDb_{Guid.NewGuid()}")
            .Options;
        var disposedContext = new ApplicationDbContext(options);
        disposedContext.Dispose();

        // Act & Assert
        var act = async () => await QuotingSeeder.SeedAsync(disposedContext);
        await act.Should().ThrowAsync<Exception>();
    }

    #endregion
}
