namespace TemplateLandingPage.UnitTests.Persistence;

using System.Text.Json;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Persistence;
using TemplateLandingPage.Persistence.Data;
using Xunit;

public class DataSeederTests : IDisposable
{
    private readonly ApplicationDbContext _dbContext;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;

    public DataSeederTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: $"SeederTestDb_{Guid.NewGuid()}")
            .Options;

        _dbContext = new ApplicationDbContext(options);

        _passwordHasherMock = new Mock<IPasswordHasher>();
        _passwordHasherMock
            .Setup(h => h.HashPassword(It.IsAny<string>()))
            .Returns<string>(password => $"hashed_{password}");
    }

    public void Dispose()
    {
        _dbContext.Database.EnsureDeleted();
        _dbContext.Dispose();
    }

    [Fact]
    public async Task SeedAsync_Should_PopulateAll8Tables_WhenDatabaseIsEmpty()
    {
        // Act
        await DataSeeder.SeedAsync(_dbContext, _passwordHasherMock.Object);

        // Assert - 1. Users (3 users seeded)
        var users = await _dbContext.Users.ToListAsync();
        users.Should().HaveCount(3);
        users.Should().Contain(u => u.Email == "admin@template.com" && u.Role == "Admin");
        users.Should().Contain(u => u.Email == "user@template.com" && u.Role == "User");
        users.Should().Contain(u => u.Email == "minhlinh@template.com" && u.Role == "User");
        users.All(u => u.PasswordHash.StartsWith("hashed_")).Should().BeTrue();

        // Assert - 2. Categories (5 categories)
        var categories = await _dbContext.Categories.ToListAsync();
        categories.Should().HaveCount(5);
        categories.Select(c => c.Slug).Should().BeEquivalentTo(new[]
        {
            "wedding", "engagement", "birthday", "anniversary", "baby-shower"
        });

        // Assert - 3. NavigationMenus (5 root + 5 submenus = 10 total)
        var menus = await _dbContext.NavigationMenus.ToListAsync();
        menus.Should().HaveCount(10);
        var rootMenus = menus.Where(m => m.ParentId == null).ToList();
        rootMenus.Should().HaveCount(5);
        var templatesMenu = rootMenus.Single(m => m.Url == "/templates");

        var subMenus = menus.Where(m => m.ParentId == templatesMenu.Id).ToList();
        subMenus.Should().HaveCount(5);
        subMenus.Select(s => s.Url).Should().Contain(new[]
        {
            "/templates?category=wedding",
            "/templates?category=engagement",
            "/templates?category=birthday",
            "/templates?category=anniversary",
            "/templates?category=baby-shower"
        });

        // Assert - 4. Templates (7 templates)
        var templates = await _dbContext.Templates.ToListAsync();
        templates.Should().HaveCount(7);
        templates.Select(t => t.Slug).Should().BeEquivalentTo(new[]
        {
            "elegance-blossom",
            "golden-glamour",
            "sweet-romance",
            "eternal-love",
            "pastel-dream-baby",
            "silver-jubilee",
            "traditional-grace"
        });
        templates.All(t => !string.IsNullOrWhiteSpace(t.DefaultConfigJson)).Should().BeTrue();
        templates.All(t => !string.IsNullOrWhiteSpace(t.ThumbnailUrl)).Should().BeTrue();

        // Assert - 5. UserCustomizations (4 customizations)
        var customizations = await _dbContext.UserCustomizations.ToListAsync();
        customizations.Should().HaveCount(4);
        customizations.Select(c => c.Slug).Should().BeEquivalentTo(new[]
        {
            "minh-linh-wedding",
            "be-bap-1-tuoi",
            "hoang-nam-30th",
            "huy-phuong-silver-jubilee"
        });
        customizations.All(c => c.IsPublished).Should().BeTrue();
        customizations.All(c => c.UserId.HasValue).Should().BeTrue();
        customizations.All(c => c.TemplateId != Guid.Empty).Should().BeTrue();

        // Assert - 6. RsvpEntries (6 entries total: 4 for minh-linh, 2 for hoang-nam)
        var rsvps = await _dbContext.RsvpEntries.ToListAsync();
        rsvps.Should().HaveCount(6);
        rsvps.Should().Contain(r => r.GuestName == "Trần Anh Tuấn" && r.AttendingStatus == "attending");
        rsvps.Should().Contain(r => r.GuestName == "Lê Quốc Bảo" && r.AttendingStatus == "declined");
        rsvps.Should().Contain(r => r.GuestName == "Đỗ Thành Đạt" && r.AttendingStatus == "attending");
        rsvps.All(r => r.CustomizationId.HasValue).Should().BeTrue();

        // Assert - 7. GuestbookEntries (7 entries total)
        var guestbookEntries = await _dbContext.GuestbookEntries.ToListAsync();
        guestbookEntries.Should().HaveCount(7);
        guestbookEntries.Should().Contain(g => g.SenderName == "Gia đình Bác Hai");
        guestbookEntries.Should().Contain(g => g.SenderName == "Dì Út");
        guestbookEntries.Should().Contain(g => g.SenderName == "Anh Em Phòng Kỹ Thuật");
        guestbookEntries.All(g => g.CustomizationId.HasValue).Should().BeTrue();

        // Assert - 8. Products (4 pricing plans)
        var products = await _dbContext.Products.ToListAsync();
        products.Should().HaveCount(4);
        products.Should().Contain(p => p.Name == "Gói Tiêu Chuẩn (Standard)" && p.Price == 199000m);
        products.Should().Contain(p => p.Name == "Gói Cao Cấp (Premium VIP)" && p.Price == 399000m);
        products.Should().Contain(p => p.Name == "Gói Đa Sự Kiện (Combo Wedding)" && p.Price == 599000m);
        products.Should().Contain(p => p.Name == "Gói Thiết Kế Riêng (Bespoke)" && p.Price == 899000m);
        products.All(p => p.IsActive).Should().BeTrue();
    }

    [Fact]
    public async Task SeedAsync_Should_BeIdempotent_WhenExecutedMultipleTimes()
    {
        // Act - Run 1st time
        await DataSeeder.SeedAsync(_dbContext, _passwordHasherMock.Object);

        // Act - Run 2nd time immediately
        var act = () => DataSeeder.SeedAsync(_dbContext, _passwordHasherMock.Object);

        // Assert - Should not throw any exception
        await act.Should().NotThrowAsync();

        // Assert - Counts should remain unchanged (no duplicate records)
        (await _dbContext.Users.CountAsync()).Should().Be(3);
        (await _dbContext.Categories.CountAsync()).Should().Be(5);
        (await _dbContext.NavigationMenus.CountAsync()).Should().Be(10);
        (await _dbContext.Templates.CountAsync()).Should().Be(7);
        (await _dbContext.UserCustomizations.CountAsync()).Should().Be(4);
        (await _dbContext.RsvpEntries.CountAsync()).Should().Be(6);
        (await _dbContext.GuestbookEntries.CountAsync()).Should().Be(7);
        (await _dbContext.Products.CountAsync()).Should().Be(4);
    }

    [Fact]
    public async Task SeedAsync_Should_HandlePartialPreExistingData_WithoutCrashing()
    {
        // Arrange - Pre-seed only categories and users
        var existingUser = User.Create("admin@template.com", "existing_hash", "Admin Existing", "Admin");
        _dbContext.Users.Add(existingUser);

        var existingCat = Category.Create("Thiệp Cưới", "wedding", "Existing desc", "Heart", 1);
        _dbContext.Categories.Add(existingCat);

        await _dbContext.SaveChangesAsync();

        // Act - Run Seeder
        await DataSeeder.SeedAsync(_dbContext, _passwordHasherMock.Object);

        // Assert - Seeder should safely reuse existing records and proceed with remaining tables
        var templates = await _dbContext.Templates.ToListAsync();
        templates.Should().HaveCount(7);

        var customizations = await _dbContext.UserCustomizations.ToListAsync();
        customizations.Should().HaveCount(4);

        var products = await _dbContext.Products.ToListAsync();
        products.Should().HaveCount(4);
    }

    [Fact]
    public async Task SeedAsync_Should_GenerateValidJson_ForTemplatesAndCustomizations()
    {
        // Act
        await DataSeeder.SeedAsync(_dbContext, _passwordHasherMock.Object);

        // Assert Templates JSON
        var templates = await _dbContext.Templates.ToListAsync();
        foreach (var t in templates)
        {
            var parseAction = () => JsonDocument.Parse(t.DefaultConfigJson);
            parseAction.Should().NotThrow($"Template '{t.Slug}' must contain valid JSON");
        }

        // Assert Customizations JSON
        var customizations = await _dbContext.UserCustomizations.ToListAsync();
        foreach (var c in customizations)
        {
            var parseAction = () => JsonDocument.Parse(c.ConfigJson);
            parseAction.Should().NotThrow($"Customization '{c.Slug}' must contain valid JSON");

            using var doc = JsonDocument.Parse(c.ConfigJson);
            var root = doc.RootElement;
            root.TryGetProperty("theme", out _).Should().BeTrue();
            root.TryGetProperty("hero", out _).Should().BeTrue();
            root.TryGetProperty("eventDetails", out _).Should().BeTrue();
        }
    }
}
