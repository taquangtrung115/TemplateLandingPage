namespace TemplateLandingPage.UnitTests.Persistence.Quoting;

using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using TemplateLandingPage.Domain.Entities.Quoting;
using TemplateLandingPage.Persistence;
using TemplateLandingPage.Persistence.Constants;
using Xunit;

public class QuotingPersistenceTests : IDisposable
{
    private readonly ApplicationDbContext _inMemoryContext;

    public QuotingPersistenceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: $"QuotingTestDb_{Guid.NewGuid()}")
            .Options;

        _inMemoryContext = new ApplicationDbContext(options);
    }

    public void Dispose()
    {
        _inMemoryContext.Database.EnsureDeleted();
        _inMemoryContext.Dispose();
    }

    #region 1. Happy Path Tests

    [Fact]
    public void Quoting_AllEightDbSets_ShouldBeAccessibleAndConfigured()
    {
        // Assert - All 8 DbSets exist and are accessible on ApplicationDbContext
        _inMemoryContext.QuotingProducts.Should().NotBeNull();
        _inMemoryContext.QuotingCustomers.Should().NotBeNull();
        _inMemoryContext.QuotationTemplates.Should().NotBeNull();
        _inMemoryContext.QuotationTemplateVersions.Should().NotBeNull();
        _inMemoryContext.Quotations.Should().NotBeNull();
        _inMemoryContext.QuotationItems.Should().NotBeNull();
        _inMemoryContext.QuotationHistories.Should().NotBeNull();
        _inMemoryContext.QuotationFiles.Should().NotBeNull();

        // Assert - Entity model mappings
        _inMemoryContext.Model.FindEntityType(typeof(QuotingProduct)).Should().NotBeNull();
        _inMemoryContext.Model.FindEntityType(typeof(QuotingCustomer)).Should().NotBeNull();
        _inMemoryContext.Model.FindEntityType(typeof(QuotationTemplate)).Should().NotBeNull();
        _inMemoryContext.Model.FindEntityType(typeof(QuotationTemplateVersion)).Should().NotBeNull();
        _inMemoryContext.Model.FindEntityType(typeof(Quotation)).Should().NotBeNull();
        _inMemoryContext.Model.FindEntityType(typeof(QuotationItem)).Should().NotBeNull();
        _inMemoryContext.Model.FindEntityType(typeof(QuotationHistory)).Should().NotBeNull();
        _inMemoryContext.Model.FindEntityType(typeof(QuotationFile)).Should().NotBeNull();
    }

    [Fact]
    public void Quoting_AllEightEntities_ShouldMapToQuoSchema()
    {
        // Assert - Relational schema name is "quo"
        var quotingEntityTypes = new[]
        {
            typeof(QuotingProduct),
            typeof(QuotingCustomer),
            typeof(QuotationTemplate),
            typeof(QuotationTemplateVersion),
            typeof(Quotation),
            typeof(QuotationItem),
            typeof(QuotationHistory),
            typeof(QuotationFile)
        };

        foreach (var type in quotingEntityTypes)
        {
            var entityType = _inMemoryContext.Model.FindEntityType(type);
            entityType.Should().NotBeNull();
            entityType!.GetSchema().Should().Be(TableNames.QuotingSchema, $"Entity '{type.Name}' must belong to schema '{TableNames.QuotingSchema}'");
        }
    }

    [Fact]
    public async Task Quotation_CanBeSavedAndRetrieved_WithItemsHistoriesAndFiles()
    {
        // Arrange
        var quotation = Quotation.Create(
            "BG-202611-PERSIST-01",
            Guid.NewGuid(),
            "Công ty Kiểm Thử",
            "Anh Persist",
            "0909000111",
            "persist@test.com",
            "Địa chỉ persist",
            "0319111222",
            Guid.NewGuid(),
            1,
            DateTime.UtcNow,
            DateTime.UtcNow.AddDays(30),
            discountPercent: 10,
            taxPercent: 8,
            notes: "Kiểm thử lưu trữ",
            Guid.NewGuid());

        var items = new List<QuotationItem>
        {
            QuotationItem.Create(quotation.Id, null, "SKU-P1", "Sản phẩm 1", null, "Phần", null, "Nhóm A", 5, 20000, 0, null, 1)
        };
        quotation.SetItems(items, Guid.NewGuid());
        quotation.AddExportedFile("test.pdf", "pdf", "https://url.test/test.pdf", 5000, "Local", Guid.NewGuid());

        // Act
        _inMemoryContext.Quotations.Add(quotation);
        await _inMemoryContext.SaveChangesAsync();
        _inMemoryContext.ChangeTracker.Clear();

        var retrieved = await _inMemoryContext.Quotations
            .Include(q => q.Items)
            .Include(q => q.Histories)
            .Include(q => q.Files)
            .FirstOrDefaultAsync(q => q.Id == quotation.Id);

        // Assert
        retrieved.Should().NotBeNull();
        retrieved!.QuotationNumber.Should().Be("BG-202611-PERSIST-01");
        retrieved.CustomerName.Should().Be("Công ty Kiểm Thử");
        retrieved.Items.Should().HaveCount(1);
        retrieved.Histories.Should().NotBeEmpty();
        retrieved.Files.Should().HaveCount(1);
        retrieved.SubTotal.Should().Be(100000m);
        retrieved.DiscountAmount.Should().Be(10000m);
        retrieved.TaxAmount.Should().Be(7200m);
        retrieved.TotalAmount.Should().Be(97200m);
    }

    #endregion

    #region 2. Edge Case Tests

    [Fact]
    public async Task SoftDelete_ShouldFilterOutDeletedQuotationsAndProducts_ByDefault()
    {
        // Arrange
        var product = QuotingProduct.Create("SKU-SOFT", "SP Soft Delete", null, "Cái", 5000, null, null);
        product.Delete();

        _inMemoryContext.QuotingProducts.Add(product);
        await _inMemoryContext.SaveChangesAsync();
        _inMemoryContext.ChangeTracker.Clear();

        // Act & Assert - Standard query filters out deleted
        var activeProducts = await _inMemoryContext.QuotingProducts.ToListAsync();
        activeProducts.Should().NotContain(p => p.Id == product.Id);

        // Act & Assert - IgnoreQueryFilters includes deleted
        var allProducts = await _inMemoryContext.QuotingProducts.IgnoreQueryFilters().ToListAsync();
        allProducts.Should().Contain(p => p.Id == product.Id && p.IsDeleted);
    }

    #endregion

    #region 3. Failure Path Tests

    [Fact]
    public async Task ApplicationDbContext_WhenAddingDuplicateQuotationId_ShouldThrowException()
    {
        // Arrange
        var qId = Guid.NewGuid();
        var q1 = Quotation.Create("BG-DUP-01", Guid.NewGuid(), "Khách 1", null, "0900000000", null, null, null, Guid.NewGuid(), 1, DateTime.UtcNow, null, 0, 0, null, Guid.NewGuid());
        var q2 = Quotation.Create("BG-DUP-02", Guid.NewGuid(), "Khách 2", null, "0900000000", null, null, null, Guid.NewGuid(), 1, DateTime.UtcNow, null, 0, 0, null, Guid.NewGuid());

        typeof(Quotation).BaseType!.BaseType!
            .GetProperty(nameof(Quotation.Id))!
            .SetValue(q1, qId);
        typeof(Quotation).BaseType!.BaseType!
            .GetProperty(nameof(Quotation.Id))!
            .SetValue(q2, qId);

        _inMemoryContext.Quotations.Add(q1);
        await _inMemoryContext.SaveChangesAsync();

        // Act & Assert - Duplicate key tracking
        var act = () => _inMemoryContext.Quotations.Add(q2);
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*cannot be tracked because another instance with the same key value*");
    }

    #endregion
}
