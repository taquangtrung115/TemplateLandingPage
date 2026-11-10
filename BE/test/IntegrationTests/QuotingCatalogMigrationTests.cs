namespace TemplateLandingPage.IntegrationTests;

using System.Text;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql;
using TemplateLandingPage.Domain.Entities.Quoting;
using TemplateLandingPage.Persistence;
using TemplateLandingPage.Persistence.Data;
using Xunit;

[Collection(PostgresApiCollection.Name)]
public sealed class QuotingCatalogMigrationTests(PostgresApiFixture fixture)
{
    #region Migration scenarios
    [Fact]
    public Task DatabaseUpdate_OnEmptyDatabase_SeedsBothGroupsAndAllElevenProducts() => WithDatabaseAsync(async db =>
    {
        await db.Database.MigrateAsync();
        var groups = await db.QuotingProductGroups.AsNoTracking().ToListAsync();
        groups.Should().HaveCount(2);
        groups.Single(group => group.Code == "COMBO").SortOrder.Should().Be(1);
        groups.Single(group => group.Code == "XIEN-QUE").SortOrder.Should().Be(2);

        var products = await db.QuotingProducts.AsNoTracking().Include(product => product.Group).ToListAsync();
        products.Should().HaveCount(11);
        products.Count(product => product.Group!.Code == "COMBO").Should().Be(6);
        products.Count(product => product.Group!.Code == "XIEN-QUE").Should().Be(5);
        foreach (var product in products)
        {
            product.IsActive.Should().BeTrue();
            product.Category.Should().Be(product.Group!.Name);
            product.ImageUrl.Should().Be($"/api/v1/quoting/product-images/{product.Code}.png");
        }
        products.Single(product => product.Code == "XQ-04").Price.Should().Be(40000m);
        products.Single(product => product.Code == "XQ-05").Price.Should().Be(50000m);

        // Running development seed after migration must not create a second catalog.
        await QuotingSeeder.SeedAsync(db);
        (await db.QuotingProducts.CountAsync()).Should().Be(11);
        (await db.QuotingProductGroups.CountAsync()).Should().Be(2);
    });

    [Fact]
    public Task DatabaseUpdate_FromLegacySchema_PreservesEditsDeletesAndNameDuplicates() => WithDatabaseAsync(async db =>
    {
        var migrator = db.GetService<IMigrator>();
        await migrator.MigrateAsync("20261108133804_AddQuotingSupportWorkflow");
        var alternateName = " \t" + "surimi  hải sản bao ngon".Normalize(NormalizationForm.FormD) + "  \n";
        var image = "/api/v1/quoting/product-images/uploads/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.png";
        await db.Database.ExecuteSqlInterpolatedAsync($"""
            INSERT INTO quo."Products" ("Id", "Code", "Name", "Description", "Unit", "Price", "ImageUrl", "Category", "IsActive", "IsDeleted", "CreatedAtUtc") VALUES
                ({Guid.NewGuid()}, 'CB-01', 'Combo đã chỉnh', 'Mô tả riêng', 'Phần', 21000.50, {image}, NULL, TRUE, FALSE, CURRENT_TIMESTAMP),
                ({Guid.NewGuid()}, 'LEGACY-CB2', {alternateName}, NULL, 'GÓI', 19000, NULL, 'A/ DÒNG COMBO', TRUE, FALSE, CURRENT_TIMESTAMP),
                ({Guid.NewGuid()}, 'CB-03', 'Đã xóa', NULL, 'GÓI', 22000, NULL, 'A/ DÒNG COMBO', TRUE, TRUE, CURRENT_TIMESTAMP),
                ({Guid.NewGuid()}, 'XQ-01', 'Tạm ngưng riêng', NULL, '10 QUE/GÓI', 26000, NULL, 'B/ DÒNG SẢN PHẨM XIÊN QUE', FALSE, FALSE, CURRENT_TIMESTAMP),
                ({Guid.NewGuid()}, 'OWN-01', 'Sản phẩm tự tạo', NULL, 'Hộp', 99000, NULL, 'Nhóm riêng', TRUE, FALSE, CURRENT_TIMESTAMP);
            """);

        await migrator.MigrateAsync();
        var products = await db.QuotingProducts.IgnoreQueryFilters().AsNoTracking().Include(product => product.Group).ToListAsync();
        products.Should().HaveCount(12);
        products.Should().NotContain(product => product.Code == "CB-02");
        products.Single(product => product.Code == "LEGACY-CB2").Name.Should().Be(alternateName);
        var edited = products.Single(product => product.Code == "CB-01");
        edited.Price.Should().Be(21000.50m);
        edited.Unit.Should().Be("Phần");
        edited.Description.Should().Be("Mô tả riêng");
        edited.ImageUrl.Should().Be(image);
        edited.Category.Should().BeNull();
        edited.Group!.Code.Should().Be("COMBO");
        products.Single(product => product.Code == "CB-03").IsDeleted.Should().BeTrue();
        products.Single(product => product.Code == "XQ-01").IsActive.Should().BeFalse();
        products.Single(product => product.Code == "OWN-01").Group!.Name.Should().Be("Nhóm riêng");
        await QuotingSeeder.SeedAsync(db);
        (await db.QuotingProducts.IgnoreQueryFilters().CountAsync()).Should().Be(12);
    });

    [Fact]
    public Task DatabaseUpdate_AfterGroupSchemaWasApplied_PreservesGroupConfiguration() => WithDatabaseAsync(async db =>
    {
        var migrator = db.GetService<IMigrator>();
        await migrator.MigrateAsync("20261110092605_AddQuotingProductGroupsAndDisplayOptions");
        var combo = await db.QuotingProductGroups.SingleAsync(group => group.Code == "COMBO");
        combo.Update(combo.Code, "Combo theo cấu hình riêng", "Mô tả đã sửa", 9, false);
        await db.SaveChangesAsync();
        await migrator.MigrateAsync();
        db.ChangeTracker.Clear();
        var saved = await db.QuotingProductGroups.SingleAsync(group => group.Code == "COMBO");
        saved.Id.Should().Be(combo.Id);
        saved.Name.Should().Be("Combo theo cấu hình riêng");
        saved.Description.Should().Be("Mô tả đã sửa");
        saved.SortOrder.Should().Be(9);
        saved.IsActive.Should().BeFalse();
        var products = await db.QuotingProducts.AsNoTracking().Where(product => product.GroupId == saved.Id).ToListAsync();
        products.Should().HaveCount(6);
        products.Should().OnlyContain(product => product.Category == saved.Name);
    });

    [Fact]
    public Task DataMigration_Reapplied_DoesNotDuplicateOrResetTheCatalog() => WithDatabaseAsync(async db =>
    {
        await db.Database.MigrateAsync();
        var product = await db.QuotingProducts.SingleAsync(product => product.Code == "CB-04");
        product.Update(product.Code, "Tên riêng", "Mô tả riêng", "Hộp", 12345m,
            "/api/v1/quoting/product-images/uploads/bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.png", product.Category, false);
        var deleted = await db.QuotingProducts.SingleAsync(product => product.Code == "XQ-05");
        deleted.Delete();
        await db.SaveChangesAsync();
        var migrator = db.GetService<IMigrator>();
        await migrator.MigrateAsync("20261110092605_AddQuotingProductGroupsAndDisplayOptions");
        await migrator.MigrateAsync();
        db.ChangeTracker.Clear();
        (await db.QuotingProducts.IgnoreQueryFilters().CountAsync()).Should().Be(11);
        (await db.QuotingProductGroups.CountAsync()).Should().Be(2);
        var saved = await db.QuotingProducts.SingleAsync(product => product.Code == "CB-04");
        saved.Price.Should().Be(12345m);
        saved.Name.Should().Be("Tên riêng");
        saved.Unit.Should().Be("Hộp");
        saved.IsActive.Should().BeFalse();
        saved.ImageUrl.Should().Contain("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");
        (await db.QuotingProducts.IgnoreQueryFilters().SingleAsync(product => product.Code == "XQ-05")).IsDeleted.Should().BeTrue();
    });
    #endregion

    #region Isolated database
    private async Task WithDatabaseAsync(Func<ApplicationDbContext, Task> action)
    {
        var name = $"quoting_seed_test_{Guid.NewGuid():N}";
        var settings = new NpgsqlConnectionStringBuilder(fixture.ConnectionString) { Database = "postgres", Pooling = false };
        await using var admin = new NpgsqlConnection(settings.ConnectionString);
        await admin.OpenAsync();
        var identifier = new NpgsqlCommandBuilder().QuoteIdentifier(name);
        await using (var create = new NpgsqlCommand($"CREATE DATABASE {identifier}", admin)) await create.ExecuteNonQueryAsync();
        try
        {
            settings.Database = name;
            await using var db = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(settings.ConnectionString).Options);
            await action(db);
        }
        finally
        {
            await using var drop = new NpgsqlCommand($"DROP DATABASE {identifier} WITH (FORCE)", admin);
            await drop.ExecuteNonQueryAsync();
        }
    }
    #endregion
}
