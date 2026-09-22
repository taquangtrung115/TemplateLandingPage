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

        // Assert - 2. Categories (19 categories)
        var categories = await _dbContext.Categories.ToListAsync();
        categories.Should().HaveCount(19);
        categories.Select(c => c.Slug).Should().BeEquivalentTo(new[]
        {
            "wedding", "engagement", "birthday", "anniversary", "baby-shower",
            "conference", "app-showcase", "medical", "saas",
            "restaurant", "fitness", "housewarming", "education", "real-estate", "art-craft",
            "spa-beauty", "podcast-music", "tech-startup", "photography"
        });
        categories.Select(c => c.Slug).Should().OnlyHaveUniqueItems();

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

        // Assert - 4. Templates (23 templates: Diverse Formats & Categories)
        var templates = await _dbContext.Templates.ToListAsync();
        templates.Should().HaveCount(23);
        templates.Select(t => t.Slug).Should().BeEquivalentTo(new[]
        {
            "elegance-blossom",
            "golden-glamour",
            "sweet-romance",
            "eternal-love",
            "pastel-dream-baby",
            "silver-jubilee",
            "traditional-grace",
            "ai-summit-pro",
            "drift-planner-app",
            "smilecraft-dental",
            "cloudflow-saas",
            "laura-bistro-gourmet",
            "apex-titanium-fitness",
            "warm-nest-housewarming",
            "azure-breeze-beach-wedding",
            "genai-prompt-masterclass",
            "horizon-luxury-villas",
            "academic-glory-graduation",
            "terra-soul-art-exhibition",
            "aura-wellness-spa",
            "sonic-wave-podcast",
            "nexus-ai-startup",
            "lumina-photography-studio"
        });
        templates.Select(t => t.Slug).Should().OnlyHaveUniqueItems();
        templates.All(t => !string.IsNullOrWhiteSpace(t.DefaultConfigJson)).Should().BeTrue();
        templates.All(t => !string.IsNullOrWhiteSpace(t.ThumbnailUrl)).Should().BeTrue();
        templates.All(t => !string.IsNullOrWhiteSpace(t.PreviewUrl)).Should().BeTrue();
        templates.All(t => !string.IsNullOrWhiteSpace(t.LongPreviewUrl)).Should().BeTrue();
        templates.All(t => t.CategoryId.HasValue).Should().BeTrue();
        templates.All(t => categories.Any(c => c.Id == t.CategoryId!.Value)).Should().BeTrue();

        // Assert - 5. UserCustomizations (6 customizations)
        var customizations = await _dbContext.UserCustomizations.ToListAsync();
        customizations.Should().HaveCount(6);
        customizations.Select(c => c.Slug).Should().BeEquivalentTo(new[]
        {
            "minh-linh-wedding",
            "be-bap-1-tuoi",
            "hoang-nam-30th",
            "huy-phuong-silver-jubilee",
            "global-ai-summit-2026",
            "drift-workspace-adhd"
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

        var firstCategories = await _dbContext.Categories.OrderBy(c => c.Slug).Select(c => new { c.Id, c.Slug }).ToListAsync();
        var firstTemplates = await _dbContext.Templates.OrderBy(t => t.Slug).Select(t => new { t.Id, t.Slug }).ToListAsync();

        // Act - Run 2nd time immediately
        var act2 = () => DataSeeder.SeedAsync(_dbContext, _passwordHasherMock.Object);
        await act2.Should().NotThrowAsync();

        // Act - Run 3rd time immediately
        var act3 = () => DataSeeder.SeedAsync(_dbContext, _passwordHasherMock.Object);
        await act3.Should().NotThrowAsync();

        // Assert - Counts should remain unchanged (no duplicate records)
        (await _dbContext.Users.CountAsync()).Should().Be(3);
        (await _dbContext.Categories.CountAsync()).Should().Be(19);
        (await _dbContext.NavigationMenus.CountAsync()).Should().Be(10);
        (await _dbContext.Templates.CountAsync()).Should().Be(23);
        (await _dbContext.UserCustomizations.CountAsync()).Should().Be(6);
        (await _dbContext.RsvpEntries.CountAsync()).Should().Be(6);
        (await _dbContext.GuestbookEntries.CountAsync()).Should().Be(7);
        (await _dbContext.Products.CountAsync()).Should().Be(4);

        // Assert - Entity IDs must remain identical after multiple runs (not recreated or shifted)
        var finalCategories = await _dbContext.Categories.OrderBy(c => c.Slug).Select(c => new { c.Id, c.Slug }).ToListAsync();
        var finalTemplates = await _dbContext.Templates.OrderBy(t => t.Slug).Select(t => new { t.Id, t.Slug }).ToListAsync();

        finalCategories.Should().BeEquivalentTo(firstCategories);
        finalTemplates.Should().BeEquivalentTo(firstTemplates);
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
        var categories = await _dbContext.Categories.ToListAsync();
        categories.Should().HaveCount(19);

        var templates = await _dbContext.Templates.ToListAsync();
        templates.Should().HaveCount(23);

        var customizations = await _dbContext.UserCustomizations.ToListAsync();
        customizations.Should().HaveCount(6);

        var products = await _dbContext.Products.ToListAsync();
        products.Should().HaveCount(4);
    }

    [Fact]
    public async Task SeedAsync_Should_SupplementNewCategoriesAndTemplates_WhenLegacy9CategoriesAnd11TemplatesAlreadyExist()
    {
        // Arrange - Pre-populate with legacy 9 categories and 11 templates (simulating current Supabase production db)
        var legacyCategories = new[]
        {
            Category.Create("Thiệp Cưới", "wedding", "Desc", "Heart", 1),
            Category.Create("Lễ Đính Hôn", "engagement", "Desc", "Ring", 2),
            Category.Create("Sinh Nhật", "birthday", "Desc", "Cake", 3),
            Category.Create("Kỷ Niệm Ngày Cưới", "anniversary", "Desc", "Sparkles", 4),
            Category.Create("Thôi Nôi & Đầy Tháng", "baby-shower", "Desc", "Baby", 5),
            Category.Create("Hội Nghị & Sự Kiện", "conference", "Desc", "Mic", 6),
            Category.Create("Ứng Dụng & Năng Suất", "app-showcase", "Desc", "Layers", 7),
            Category.Create("Y Tế & Nha Khoa", "medical", "Desc", "Stethoscope", 8),
            Category.Create("Nền Tảng SaaS", "saas", "Desc", "Cpu", 9)
        };
        _dbContext.Categories.AddRange(legacyCategories);
        await _dbContext.SaveChangesAsync();

        var legacyTemplates = new[]
        {
            Template.Create("Elegance Blossom", "elegance-blossom", "Desc", legacyCategories[0].Id, "Wedding", "thumb", "/preview", "long", "Premium", null, null, "{}"),
            Template.Create("Golden Glamour", "golden-glamour", "Desc", legacyCategories[2].Id, "Birthday", "thumb", "/preview", "long", "Hot", null, null, "{}"),
            Template.Create("Sweet Romance", "sweet-romance", "Desc", legacyCategories[0].Id, "Wedding", "thumb", "/preview", "long", "Basic", null, null, "{}"),
            Template.Create("Eternal Love", "eternal-love", "Desc", legacyCategories[0].Id, "Wedding", "thumb", "/preview", "long", "Free", null, null, "{}"),
            Template.Create("Pastel Dream Baby", "pastel-dream-baby", "Desc", legacyCategories[4].Id, "BabyShower", "thumb", "/preview", "long", "New", null, null, "{}"),
            Template.Create("Silver Jubilee", "silver-jubilee", "Desc", legacyCategories[3].Id, "Anniversary", "thumb", "/preview", "long", "Premium", null, null, "{}"),
            Template.Create("Traditional Grace", "traditional-grace", "Desc", legacyCategories[1].Id, "Engagement", "thumb", "/preview", "long", "New", null, null, "{}"),
            Template.Create("Virtual AI Summit 2026", "ai-summit-pro", "Desc", legacyCategories[5].Id, "Conference", "thumb", "/preview", "long", "Premium", null, null, "{}"),
            Template.Create("Drift ADHD Planner", "drift-planner-app", "Desc", legacyCategories[6].Id, "AppShowcase", "thumb", "/preview", "long", "Hot", null, null, "{}"),
            Template.Create("SmileCraft Dental Clinic", "smilecraft-dental", "Desc", legacyCategories[7].Id, "Medical", "thumb", "/preview", "long", "Premium", null, null, "{}"),
            Template.Create("CloudFlow Modern SaaS", "cloudflow-saas", "Desc", legacyCategories[8].Id, "SaaS", "thumb", "/preview", "long", "New", null, null, "{}")
        };
        _dbContext.Templates.AddRange(legacyTemplates);
        await _dbContext.SaveChangesAsync();

        (await _dbContext.Categories.CountAsync()).Should().Be(9);
        (await _dbContext.Templates.CountAsync()).Should().Be(11);

        // Act - Run Seeder on database that already has legacy 9 categories and 11 templates
        await DataSeeder.SeedAsync(_dbContext, _passwordHasherMock.Object);

        // Assert - Categories should now be 19 (10 new categories added)
        var categories = await _dbContext.Categories.ToListAsync();
        categories.Should().HaveCount(19);
        categories.Select(c => c.Slug).Should().Contain(new[]
        {
            "restaurant", "fitness", "housewarming", "education", "real-estate", "art-craft",
            "spa-beauty", "podcast-music", "tech-startup", "photography"
        });

        // Assert - Templates should now be 23 (12 new templates added)
        var templates = await _dbContext.Templates.ToListAsync();
        templates.Should().HaveCount(23);
        templates.Select(t => t.Slug).Should().Contain(new[]
        {
            "laura-bistro-gourmet",
            "apex-titanium-fitness",
            "warm-nest-housewarming",
            "azure-breeze-beach-wedding",
            "genai-prompt-masterclass",
            "horizon-luxury-villas",
            "academic-glory-graduation",
            "terra-soul-art-exhibition",
            "aura-wellness-spa",
            "sonic-wave-podcast",
            "nexus-ai-startup",
            "lumina-photography-studio"
        });

        // Verify ALL newly added templates are mapped to correct category IDs
        var expectedCategoryMappings = new Dictionary<string, string>
        {
            { "laura-bistro-gourmet", "restaurant" },
            { "apex-titanium-fitness", "fitness" },
            { "warm-nest-housewarming", "housewarming" },
            { "azure-breeze-beach-wedding", "wedding" },
            { "genai-prompt-masterclass", "education" },
            { "horizon-luxury-villas", "real-estate" },
            { "academic-glory-graduation", "education" },
            { "terra-soul-art-exhibition", "art-craft" },
            { "aura-wellness-spa", "spa-beauty" },
            { "sonic-wave-podcast", "podcast-music" },
            { "nexus-ai-startup", "tech-startup" },
            { "lumina-photography-studio", "photography" }
        };

        foreach (var (templateSlug, categorySlug) in expectedCategoryMappings)
        {
            var tmpl = templates.Single(t => t.Slug == templateSlug);
            var expectedCat = categories.Single(c => c.Slug == categorySlug);
            tmpl.CategoryId.Should().Be(expectedCat.Id, $"Template '{templateSlug}' must link to Category '{categorySlug}'");
        }

        // Verify that 11 legacy templates retained their original CategoryId and were untouched
        foreach (var legacyTmpl in legacyTemplates)
        {
            var found = templates.Single(t => t.Slug == legacyTmpl.Slug);
            found.CategoryId.Should().Be(legacyTmpl.CategoryId, $"Legacy template '{legacyTmpl.Slug}' CategoryId must remain unchanged");
        }

        // Act - Run second time to verify full idempotency with legacy baseline
        var actSecondRun = () => DataSeeder.SeedAsync(_dbContext, _passwordHasherMock.Object);
        await actSecondRun.Should().NotThrowAsync();

        (await _dbContext.Categories.CountAsync()).Should().Be(19);
        (await _dbContext.Templates.CountAsync()).Should().Be(23);
    }

    [Fact]
    public async Task SeedAsync_Should_GenerateValidJson_ForTemplatesAndCustomizations()
    {
        // Act
        await DataSeeder.SeedAsync(_dbContext, _passwordHasherMock.Object);

        // Assert Templates JSON (All 23 templates)
        var templates = await _dbContext.Templates.ToListAsync();
        templates.Should().HaveCount(23);
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
            root.TryGetProperty("eventDetails", out var eventDetails).Should().BeTrue();
            eventDetails.TryGetProperty("ceremonyName", out var ceremonyName).Should().BeTrue();
            ceremonyName.GetString().Should().NotBeNullOrWhiteSpace();
        }
    }

    [Fact]
    public async Task SeedAsync_Should_ContainSpecificProperties_ForDiverseTemplates()
    {
        // Act
        await DataSeeder.SeedAsync(_dbContext, _passwordHasherMock.Object);

        // Assert Summit template
        var summit = await _dbContext.Templates.FirstAsync(t => t.Slug == "ai-summit-pro");
        using (var doc = JsonDocument.Parse(summit.DefaultConfigJson))
        {
            doc.RootElement.TryGetProperty("speakers", out var speakers).Should().BeTrue();
            speakers.GetArrayLength().Should().BeGreaterThan(0);
            doc.RootElement.TryGetProperty("pricingTickets", out var tickets).Should().BeTrue();
            tickets.GetArrayLength().Should().BeGreaterThan(0);
        }

        // Assert Drift Planner template
        var drift = await _dbContext.Templates.FirstAsync(t => t.Slug == "drift-planner-app");
        using (var doc = JsonDocument.Parse(drift.DefaultConfigJson))
        {
            doc.RootElement.TryGetProperty("featureCardsGrid", out var features).Should().BeTrue();
            features.GetArrayLength().Should().BeGreaterThan(0);
            doc.RootElement.GetProperty("hero").TryGetProperty("videoUrl", out _).Should().BeTrue();
        }

        // Assert Dental Clinic template
        var dental = await _dbContext.Templates.FirstAsync(t => t.Slug == "smilecraft-dental");
        using (var doc = JsonDocument.Parse(dental.DefaultConfigJson))
        {
            doc.RootElement.TryGetProperty("servicesGrid", out var services).Should().BeTrue();
            services.GetArrayLength().Should().Be(4);
            doc.RootElement.TryGetProperty("treatmentProcess", out var process).Should().BeTrue();
            process.GetArrayLength().Should().Be(4);
        }

        // Assert SaaS template
        var saas = await _dbContext.Templates.FirstAsync(t => t.Slug == "cloudflow-saas");
        using (var doc = JsonDocument.Parse(saas.DefaultConfigJson))
        {
            doc.RootElement.TryGetProperty("featureCardsGrid", out var features).Should().BeTrue();
            features.GetArrayLength().Should().Be(6);
            doc.RootElement.TryGetProperty("pricingPackages", out var packages).Should().BeTrue();
            packages.GetArrayLength().Should().BeGreaterThan(0);
        }

        // Assert 1: L'Aura Fine Dining & Bistro
        var bistro = await _dbContext.Templates.FirstAsync(t => t.Slug == "laura-bistro-gourmet");
        using (var doc = JsonDocument.Parse(bistro.DefaultConfigJson))
        {
            doc.RootElement.GetProperty("format").GetString().Should().Be("restaurant");
            doc.RootElement.TryGetProperty("servicesGrid", out var dishes).Should().BeTrue();
            dishes.GetArrayLength().Should().Be(4);
            doc.RootElement.TryGetProperty("treatmentProcess", out var courses).Should().BeTrue();
            courses.GetArrayLength().Should().Be(4);
            doc.RootElement.GetProperty("booking").GetProperty("enabled").GetBoolean().Should().BeTrue();
            doc.RootElement.GetProperty("booking").GetProperty("title").GetString().Should().Contain("VIP Reserve");
            doc.RootElement.TryGetProperty("timeline", out var timeline).Should().BeTrue();
            timeline.GetArrayLength().Should().Be(4);
            doc.RootElement.TryGetProperty("gallery", out var gallery).Should().BeTrue();
            gallery.GetArrayLength().Should().Be(4);
            doc.RootElement.GetProperty("rsvp").GetProperty("enabled").GetBoolean().Should().BeTrue();
        }

        // Assert 2: Apex Titanium Fitness Club
        var fitness = await _dbContext.Templates.FirstAsync(t => t.Slug == "apex-titanium-fitness");
        using (var doc = JsonDocument.Parse(fitness.DefaultConfigJson))
        {
            doc.RootElement.GetProperty("format").GetString().Should().Be("fitness");
            doc.RootElement.TryGetProperty("featureCardsGrid", out var features).Should().BeTrue();
            features.GetArrayLength().Should().Be(4);
            doc.RootElement.TryGetProperty("metrics", out var metrics).Should().BeTrue();
            metrics.GetArrayLength().Should().Be(4);
            doc.RootElement.TryGetProperty("pricingPackages", out var pkgs).Should().BeTrue();
            pkgs.GetArrayLength().Should().Be(3);
            doc.RootElement.GetProperty("eventDetails").GetProperty("ceremonyName").GetString().Should().Contain("Apex Titanium");
            doc.RootElement.GetProperty("rsvp").GetProperty("enabled").GetBoolean().Should().BeTrue();
        }

        // Assert 3: Warm Nest Modern Villa (Tân gia)
        var warmNest = await _dbContext.Templates.FirstAsync(t => t.Slug == "warm-nest-housewarming");
        using (var doc = JsonDocument.Parse(warmNest.DefaultConfigJson))
        {
            doc.RootElement.GetProperty("theme").GetProperty("particlesEffect").GetString().Should().Be("confetti");
            doc.RootElement.GetProperty("coupleOrCelebrant").GetProperty("person1").GetProperty("name").GetString().Should().Contain("Tuấn");
            doc.RootElement.TryGetProperty("timeline", out var timeline).Should().BeTrue();
            timeline.GetArrayLength().Should().Be(4);
            doc.RootElement.TryGetProperty("gallery", out var gallery).Should().BeTrue();
            gallery.GetArrayLength().Should().Be(4);
            doc.RootElement.GetProperty("extraSections").EnumerateArray()
                .Should().Contain(s => s.GetProperty("type").GetString() == "giftQr");
            doc.RootElement.GetProperty("wishes").GetProperty("enabled").GetBoolean().Should().BeTrue();
            doc.RootElement.GetProperty("rsvp").GetProperty("enabled").GetBoolean().Should().BeTrue();
        }

        // Assert 4: Azure Breeze Beach Wedding
        var beachWedding = await _dbContext.Templates.FirstAsync(t => t.Slug == "azure-breeze-beach-wedding");
        using (var doc = JsonDocument.Parse(beachWedding.DefaultConfigJson))
        {
            doc.RootElement.GetProperty("theme").GetProperty("primaryColor").GetString().Should().Be("#0284c7");
            doc.RootElement.GetProperty("theme").GetProperty("particlesEffect").GetString().Should().Be("petals");
            doc.RootElement.GetProperty("coupleOrCelebrant").GetProperty("type").GetString().Should().Be("wedding");
            doc.RootElement.TryGetProperty("timeline", out var timeline).Should().BeTrue();
            timeline.GetArrayLength().Should().Be(4);
            doc.RootElement.TryGetProperty("gallery", out var gallery).Should().BeTrue();
            gallery.GetArrayLength().Should().Be(4);
            doc.RootElement.GetProperty("extraSections").EnumerateArray()
                .Should().Contain(s => s.GetProperty("type").GetString() == "qa");
            doc.RootElement.GetProperty("rsvp").GetProperty("enabled").GetBoolean().Should().BeTrue();
            doc.RootElement.GetProperty("wishes").GetProperty("enabled").GetBoolean().Should().BeTrue();
        }

        // Assert 5: GenAI & Prompt Masterclass
        var genAi = await _dbContext.Templates.FirstAsync(t => t.Slug == "genai-prompt-masterclass");
        using (var doc = JsonDocument.Parse(genAi.DefaultConfigJson))
        {
            doc.RootElement.GetProperty("format").GetString().Should().Be("summit");
            doc.RootElement.TryGetProperty("speakers", out var speakers).Should().BeTrue();
            speakers.GetArrayLength().Should().Be(2);
            doc.RootElement.TryGetProperty("pricingTickets", out var tickets).Should().BeTrue();
            tickets.GetArrayLength().Should().Be(2);
            doc.RootElement.TryGetProperty("timeline", out var timeline).Should().BeTrue();
            timeline.GetArrayLength().Should().Be(4);
            doc.RootElement.GetProperty("extraSections").EnumerateArray()
                .Should().Contain(s => s.GetProperty("type").GetString() == "qa");
            doc.RootElement.GetProperty("rsvp").GetProperty("enabled").GetBoolean().Should().BeTrue();
        }

        // Assert 6: The Horizon Luxury Villas
        var horizon = await _dbContext.Templates.FirstAsync(t => t.Slug == "horizon-luxury-villas");
        using (var doc = JsonDocument.Parse(horizon.DefaultConfigJson))
        {
            doc.RootElement.GetProperty("format").GetString().Should().Be("app-showcase");
            doc.RootElement.TryGetProperty("featureCardsGrid", out var features).Should().BeTrue();
            features.GetArrayLength().Should().Be(4);
            doc.RootElement.TryGetProperty("metrics", out var metrics).Should().BeTrue();
            metrics.GetArrayLength().Should().Be(4);
            doc.RootElement.TryGetProperty("gallery", out var gallery).Should().BeTrue();
            gallery.GetArrayLength().Should().Be(4);
            doc.RootElement.GetProperty("eventDetails").GetProperty("venueName").GetString().Should().Contain("The Horizon");
            doc.RootElement.GetProperty("rsvp").GetProperty("enabled").GetBoolean().Should().BeTrue();
        }

        // Assert 7: Academic Glory Graduation
        var graduation = await _dbContext.Templates.FirstAsync(t => t.Slug == "academic-glory-graduation");
        using (var doc = JsonDocument.Parse(graduation.DefaultConfigJson))
        {
            doc.RootElement.GetProperty("format").GetString().Should().Be("graduation");
            doc.RootElement.GetProperty("coupleOrCelebrant").GetProperty("person1").GetProperty("name").GetString()
                .Should().Be("Hoàng Minh Triết");
            doc.RootElement.TryGetProperty("timeline", out var timeline).Should().BeTrue();
            timeline.GetArrayLength().Should().Be(4);
            doc.RootElement.TryGetProperty("gallery", out var gallery).Should().BeTrue();
            gallery.GetArrayLength().Should().Be(4);
            doc.RootElement.GetProperty("wishes").GetProperty("enabled").GetBoolean().Should().BeTrue();
            doc.RootElement.GetProperty("rsvp").GetProperty("enabled").GetBoolean().Should().BeTrue();
        }

        // Assert 8: Terra & Soul Ceramic Exhibition
        var ceramic = await _dbContext.Templates.FirstAsync(t => t.Slug == "terra-soul-art-exhibition");
        using (var doc = JsonDocument.Parse(ceramic.DefaultConfigJson))
        {
            doc.RootElement.GetProperty("format").GetString().Should().Be("art-craft");
            doc.RootElement.GetProperty("theme").GetProperty("primaryColor").GetString().Should().Be("#92400e");
            doc.RootElement.GetProperty("coupleOrCelebrant").GetProperty("person1").GetProperty("name").GetString()
                .Should().Contain("An Nhiên");
            doc.RootElement.TryGetProperty("timeline", out var timeline).Should().BeTrue();
            timeline.GetArrayLength().Should().Be(4);
            doc.RootElement.TryGetProperty("gallery", out var gallery).Should().BeTrue();
            gallery.GetArrayLength().Should().Be(4);
            doc.RootElement.GetProperty("extraSections").EnumerateArray()
                .Should().Contain(s => s.GetProperty("type").GetString() == "qa");
            doc.RootElement.GetProperty("wishes").GetProperty("enabled").GetBoolean().Should().BeTrue();
            doc.RootElement.GetProperty("rsvp").GetProperty("enabled").GetBoolean().Should().BeTrue();
        }

        // Assert 9: Aura Wellness & Luxury Spa
        var spa = await _dbContext.Templates.FirstAsync(t => t.Slug == "aura-wellness-spa");
        using (var doc = JsonDocument.Parse(spa.DefaultConfigJson))
        {
            doc.RootElement.GetProperty("format").GetString().Should().Be("spa-beauty");
            doc.RootElement.GetProperty("theme").GetProperty("primaryColor").GetString().Should().Be("#059669");
            doc.RootElement.TryGetProperty("servicesGrid", out var services).Should().BeTrue();
            services.GetArrayLength().Should().Be(4);
            doc.RootElement.TryGetProperty("hierarchicalCards", out var hCards).Should().BeTrue();
            hCards.GetArrayLength().Should().BeGreaterThan(0);
            doc.RootElement.TryGetProperty("gallery", out var gallery).Should().BeTrue();
            gallery.GetArrayLength().Should().BeGreaterThan(0);
            doc.RootElement.GetProperty("rsvp").GetProperty("enabled").GetBoolean().Should().BeTrue();
        }

        // Assert 10: Sonic Wave Podcast & Music
        var podcast = await _dbContext.Templates.FirstAsync(t => t.Slug == "sonic-wave-podcast");
        using (var doc = JsonDocument.Parse(podcast.DefaultConfigJson))
        {
            doc.RootElement.GetProperty("format").GetString().Should().Be("podcast-music");
            doc.RootElement.GetProperty("theme").GetProperty("primaryColor").GetString().Should().Be("#8b5cf6");
            doc.RootElement.TryGetProperty("featureCardsGrid", out var episodes).Should().BeTrue();
            episodes.GetArrayLength().Should().Be(3);
            doc.RootElement.TryGetProperty("hierarchicalCards", out var tracklist).Should().BeTrue();
            tracklist.GetArrayLength().Should().BeGreaterThan(0);
            doc.RootElement.TryGetProperty("gallery", out var gallery).Should().BeTrue();
            gallery.GetArrayLength().Should().BeGreaterThan(0);
            doc.RootElement.GetProperty("rsvp").GetProperty("enabled").GetBoolean().Should().BeTrue();
        }

        // Assert 11: Nexus AI Cloud & NextGen Startup
        var startup = await _dbContext.Templates.FirstAsync(t => t.Slug == "nexus-ai-startup");
        using (var doc = JsonDocument.Parse(startup.DefaultConfigJson))
        {
            doc.RootElement.GetProperty("format").GetString().Should().Be("tech-startup");
            doc.RootElement.GetProperty("theme").GetProperty("primaryColor").GetString().Should().Be("#00f0ff");
            doc.RootElement.TryGetProperty("featureCardsGrid", out var features).Should().BeTrue();
            features.GetArrayLength().Should().Be(3);
            doc.RootElement.TryGetProperty("hierarchicalCards", out var roadmap).Should().BeTrue();
            roadmap.GetArrayLength().Should().BeGreaterThan(0);
            doc.RootElement.TryGetProperty("metrics", out var metrics).Should().BeTrue();
            metrics.GetArrayLength().Should().Be(3);
            doc.RootElement.GetProperty("rsvp").GetProperty("enabled").GetBoolean().Should().BeTrue();
        }

        // Assert 12: Lumina Fine Art Photography & Studio
        var photography = await _dbContext.Templates.FirstAsync(t => t.Slug == "lumina-photography-studio");
        using (var doc = JsonDocument.Parse(photography.DefaultConfigJson))
        {
            doc.RootElement.GetProperty("format").GetString().Should().Be("photography");
            doc.RootElement.GetProperty("theme").GetProperty("primaryColor").GetString().Should().Be("#d4af37");
            doc.RootElement.TryGetProperty("servicesGrid", out var services).Should().BeTrue();
            services.GetArrayLength().Should().Be(4);
            doc.RootElement.TryGetProperty("hierarchicalCards", out var process).Should().BeTrue();
            process.GetArrayLength().Should().BeGreaterThan(0);
            doc.RootElement.TryGetProperty("gallery", out var gallery).Should().BeTrue();
            gallery.GetArrayLength().Should().BeGreaterThan(0);
            doc.RootElement.GetProperty("rsvp").GetProperty("enabled").GetBoolean().Should().BeTrue();
        }
    }


    [Fact]
    public async Task SeedAsync_Should_EnsureAllTemplateArrayPropertiesAreNeverNull_AcrossAll23Templates()
    {
        // Act
        await DataSeeder.SeedAsync(_dbContext, _passwordHasherMock.Object);

        // Assert - Verify that in all 23 templates, common array fields are never null (preventing frontend .map() crashes)
        var templates = await _dbContext.Templates.ToListAsync();
        templates.Should().HaveCount(23);

        var arrayPropertyNames = new[]
        {
            "timeline", "gallery", "servicesGrid", "treatmentProcess",
            "featureCardsGrid", "speakers", "pricingTickets", "pricingPackages",
            "metrics", "extraSections"
        };

        foreach (var tmpl in templates)
        {
            using var doc = JsonDocument.Parse(tmpl.DefaultConfigJson);
            var root = doc.RootElement;

            foreach (var propName in arrayPropertyNames)
            {
                if (root.TryGetProperty(propName, out var propValue))
                {
                    propValue.ValueKind.Should().Be(
                        JsonValueKind.Array,
                        $"Property '{propName}' in template '{tmpl.Slug}' must be a JSON array (never null or non-array)");
                }
            }
        }
    }

    [Fact]
    public async Task SeedAsync_OnInMemoryDatabase_ShouldSafelyUseEnsureCreated_BecauseIsRelationalIsFalse()
    {
        // 1. Verify InMemory provider returns false for IsRelational
        _dbContext.Database.IsRelational().Should().BeFalse();

        // 2. Demonstrate that calling MigrateAsync directly on InMemory throws InvalidOperationException
        var directMigrateAct = () => _dbContext.Database.MigrateAsync();
        await directMigrateAct.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Relational-specific methods can only be used when the context is using a relational database provider*");

        // 3. Confirm that DataSeeder's IsRelational check prevents this failure and seeds successfully
        var seedAct = () => DataSeeder.SeedAsync(_dbContext, _passwordHasherMock.Object);
        await seedAct.Should().NotThrowAsync();
    }

    [Fact]
    public async Task SeedAsync_Should_ThrowException_WhenContextIsNull()
    {
        // Act
        var act = () => DataSeeder.SeedAsync(null!, _passwordHasherMock.Object);

        // Assert
        await act.Should().ThrowAsync<NullReferenceException>();
    }

    [Fact]
    public async Task SeedAsync_Should_ThrowException_WhenPasswordHasherIsNull()
    {
        // Act - Seeder tries to use password hasher to hash user passwords when users table is empty
        var act = () => DataSeeder.SeedAsync(_dbContext, null!);

        // Assert
        await act.Should().ThrowAsync<NullReferenceException>();
    }

    [Fact]
    public async Task SeedAsync_Should_ThrowException_WhenDbContextIsDisposed()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: $"DisposedSeederDb_{Guid.NewGuid()}")
            .Options;

        var disposedContext = new ApplicationDbContext(options);
        disposedContext.Dispose();

        // Act
        var act = () => DataSeeder.SeedAsync(disposedContext, _passwordHasherMock.Object);

        // Assert
        await act.Should().ThrowAsync<ObjectDisposedException>();
    }
}
