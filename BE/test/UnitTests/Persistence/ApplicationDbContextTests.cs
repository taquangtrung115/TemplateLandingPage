namespace TemplateLandingPage.UnitTests.Persistence;

using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Persistence;
using Xunit;

public class ApplicationDbContextTests : IDisposable
{
    private readonly ApplicationDbContext _inMemoryContext;

    public ApplicationDbContextTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: $"AppDbContextTestDb_{Guid.NewGuid()}")
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
    public void ConfigureConventions_Should_RegisterValueConverter_ForAllDateTimeProperties()
    {
        // Arrange & Act
        var entityTypes = _inMemoryContext.Model.GetEntityTypes();

        // Assert - Verify every DateTime property across all entities has a value converter
        var dateTimeProperties = entityTypes
            .SelectMany(e => e.GetProperties())
            .Where(p => p.ClrType == typeof(DateTime))
            .ToList();

        dateTimeProperties.Should().NotBeEmpty();

        foreach (var property in dateTimeProperties)
        {
            var converter = property.GetValueConverter();
            converter.Should().NotBeNull($"Property '{property.DeclaringType.ClrType.Name}.{property.Name}' must have a ValueConverter registered.");
            converter!.ModelClrType.Should().Be(typeof(DateTime));
            converter.ProviderClrType.Should().Be(typeof(DateTime));
        }
    }

    [Fact]
    public void ConfigureConventions_Should_RegisterValueConverter_ForAllNullableDateTimeProperties()
    {
        // Arrange & Act
        var entityTypes = _inMemoryContext.Model.GetEntityTypes();

        // Assert - Verify every DateTime? property across all entities has a value converter
        var nullableDateTimeProperties = entityTypes
            .SelectMany(e => e.GetProperties())
            .Where(p => p.ClrType == typeof(DateTime?))
            .ToList();

        nullableDateTimeProperties.Should().NotBeEmpty();

        foreach (var property in nullableDateTimeProperties)
        {
            var converter = property.GetValueConverter();
            converter.Should().NotBeNull($"Property '{property.DeclaringType.ClrType.Name}.{property.Name}' must have a ValueConverter registered.");
            converter!.ModelClrType.Should().Be(typeof(DateTime?));
            converter.ProviderClrType.Should().Be(typeof(DateTime?));
        }
    }

    [Fact]
    public void UtcDateTimeConverter_WhenConvertingUtcDateTime_ShouldRetainUtcKindAndValue()
    {
        // Arrange
        var userCreatedAtProp = _inMemoryContext.Model
            .FindEntityType(typeof(User))!
            .FindProperty(nameof(User.CreatedAtUtc))!;
        var converter = userCreatedAtProp.GetValueConverter()!;
        var utcNow = new DateTime(2026, 9, 21, 8, 30, 0, DateTimeKind.Utc);

        // Act
        var toProvider = (DateTime)converter.ConvertToProvider(utcNow)!;
        var fromProvider = (DateTime)converter.ConvertFromProvider(toProvider)!;

        // Assert
        toProvider.Kind.Should().Be(DateTimeKind.Utc);
        toProvider.Should().Be(utcNow);
        fromProvider.Kind.Should().Be(DateTimeKind.Utc);
        fromProvider.Should().Be(utcNow);
    }

    [Fact]
    public void UtcNullableDateTimeConverter_WhenConvertingUtcNullableDateTime_ShouldRetainUtcKindAndValue()
    {
        // Arrange
        var userModifiedAtProp = _inMemoryContext.Model
            .FindEntityType(typeof(User))!
            .FindProperty(nameof(User.ModifiedAtUtc))!;
        var converter = userModifiedAtProp.GetValueConverter()!;
        DateTime? utcNow = new DateTime(2026, 9, 21, 14, 0, 0, DateTimeKind.Utc);

        // Act
        var toProvider = (DateTime?)converter.ConvertToProvider(utcNow);
        var fromProvider = (DateTime?)converter.ConvertFromProvider(toProvider);

        // Assert
        toProvider.Should().NotBeNull();
        toProvider!.Value.Kind.Should().Be(DateTimeKind.Utc);
        toProvider.Value.Should().Be(utcNow.Value);
        fromProvider.Should().NotBeNull();
        fromProvider!.Value.Kind.Should().Be(DateTimeKind.Utc);
        fromProvider.Value.Should().Be(utcNow.Value);
    }

    [Fact]
    public async Task SaveChanges_WhenSavingEntityWithUtcDateTime_ShouldPersistAndQueryBackAsUtc()
    {
        // Arrange
        var utcTime = new DateTime(2026, 10, 15, 10, 30, 0, DateTimeKind.Utc);
        var user = User.Create("utcuser@template.com", "hashed_pwd", "UTC User", "User");
        user.CreatedAtUtc = utcTime;
        user.ModifiedAtUtc = utcTime.AddHours(2);

        _inMemoryContext.Users.Add(user);
        await _inMemoryContext.SaveChangesAsync();
        _inMemoryContext.ChangeTracker.Clear();

        // Act
        var queriedUser = await _inMemoryContext.Users.FirstAsync(u => u.Id == user.Id);

        // Assert
        queriedUser.CreatedAtUtc.Kind.Should().Be(DateTimeKind.Utc);
        queriedUser.CreatedAtUtc.Should().Be(utcTime);
        queriedUser.ModifiedAtUtc.Should().NotBeNull();
        queriedUser.ModifiedAtUtc!.Value.Kind.Should().Be(DateTimeKind.Utc);
        queriedUser.ModifiedAtUtc.Value.Should().Be(utcTime.AddHours(2));
    }

    [Fact]
    public void ApplicationDbContext_AllDbSets_ShouldBeAccessibleAndConfigured()
    {
        // Assert that all 8 DbSets are accessible and mapped to the model
        _inMemoryContext.Products.Should().NotBeNull();
        _inMemoryContext.Users.Should().NotBeNull();
        _inMemoryContext.Categories.Should().NotBeNull();
        _inMemoryContext.NavigationMenus.Should().NotBeNull();
        _inMemoryContext.Templates.Should().NotBeNull();
        _inMemoryContext.UserCustomizations.Should().NotBeNull();
        _inMemoryContext.RsvpEntries.Should().NotBeNull();
        _inMemoryContext.GuestbookEntries.Should().NotBeNull();

        _inMemoryContext.Model.FindEntityType(typeof(Product)).Should().NotBeNull();
        _inMemoryContext.Model.FindEntityType(typeof(User)).Should().NotBeNull();
        _inMemoryContext.Model.FindEntityType(typeof(Category)).Should().NotBeNull();
        _inMemoryContext.Model.FindEntityType(typeof(NavigationMenu)).Should().NotBeNull();
        _inMemoryContext.Model.FindEntityType(typeof(Template)).Should().NotBeNull();
        _inMemoryContext.Model.FindEntityType(typeof(UserCustomization)).Should().NotBeNull();
        _inMemoryContext.Model.FindEntityType(typeof(RsvpEntry)).Should().NotBeNull();
        _inMemoryContext.Model.FindEntityType(typeof(GuestbookEntry)).Should().NotBeNull();
    }

    #endregion

    #region 2. Edge Case Tests

    [Fact]
    public void UtcDateTimeConverter_WhenGivenDateTimeKindUnspecified_ShouldConvertToUtc()
    {
        // Arrange
        var userCreatedAtProp = _inMemoryContext.Model
            .FindEntityType(typeof(User))!
            .FindProperty(nameof(User.CreatedAtUtc))!;
        var converter = userCreatedAtProp.GetValueConverter()!;
        var unspecifiedDate = new DateTime(2026, 9, 21, 10, 15, 30, DateTimeKind.Unspecified);

        // Act
        var toProvider = (DateTime)converter.ConvertToProvider(unspecifiedDate)!;
        var fromProvider = (DateTime)converter.ConvertFromProvider(toProvider)!;

        // Assert - ToProvider specifies DateTimeKind.Utc without shifting time
        toProvider.Kind.Should().Be(DateTimeKind.Utc);
        toProvider.Year.Should().Be(2026);
        toProvider.Month.Should().Be(9);
        toProvider.Day.Should().Be(21);
        toProvider.Hour.Should().Be(10);
        toProvider.Minute.Should().Be(15);
        toProvider.Second.Should().Be(30);

        // Assert - FromProvider specifies DateTimeKind.Utc
        fromProvider.Kind.Should().Be(DateTimeKind.Utc);
        fromProvider.Should().Be(toProvider);
    }

    [Fact]
    public void UtcNullableDateTimeConverter_WhenGivenDateTimeKindUnspecified_ShouldConvertToUtc()
    {
        // Arrange
        var userModifiedAtProp = _inMemoryContext.Model
            .FindEntityType(typeof(User))!
            .FindProperty(nameof(User.ModifiedAtUtc))!;
        var converter = userModifiedAtProp.GetValueConverter()!;
        DateTime? unspecifiedDate = new DateTime(2026, 12, 25, 18, 0, 0, DateTimeKind.Unspecified);

        // Act
        var toProvider = (DateTime?)converter.ConvertToProvider(unspecifiedDate);
        var fromProvider = (DateTime?)converter.ConvertFromProvider(toProvider);

        // Assert
        toProvider.Should().NotBeNull();
        toProvider!.Value.Kind.Should().Be(DateTimeKind.Utc);
        toProvider.Value.Hour.Should().Be(18);

        fromProvider.Should().NotBeNull();
        fromProvider!.Value.Kind.Should().Be(DateTimeKind.Utc);
        fromProvider.Value.Should().Be(toProvider.Value);
    }

    [Fact]
    public void UtcDateTimeConverter_WhenGivenDateTimeKindLocal_ShouldConvertToUniversalTime()
    {
        // Arrange
        var userCreatedAtProp = _inMemoryContext.Model
            .FindEntityType(typeof(User))!
            .FindProperty(nameof(User.CreatedAtUtc))!;
        var converter = userCreatedAtProp.GetValueConverter()!;
        var localDate = new DateTime(2026, 9, 21, 10, 0, 0, DateTimeKind.Local);

        // Act
        var toProvider = (DateTime)converter.ConvertToProvider(localDate)!;

        // Assert - Local time is converted to UniversalTime
        toProvider.Kind.Should().Be(DateTimeKind.Utc);
        toProvider.Should().Be(localDate.ToUniversalTime());
    }

    [Fact]
    public void UtcNullableDateTimeConverter_WhenGivenDateTimeKindLocal_ShouldConvertToUniversalTime()
    {
        // Arrange
        var userModifiedAtProp = _inMemoryContext.Model
            .FindEntityType(typeof(User))!
            .FindProperty(nameof(User.ModifiedAtUtc))!;
        var converter = userModifiedAtProp.GetValueConverter()!;
        DateTime? localDate = new DateTime(2026, 9, 21, 10, 0, 0, DateTimeKind.Local);

        // Act
        var toProvider = (DateTime?)converter.ConvertToProvider(localDate);

        // Assert
        toProvider.Should().NotBeNull();
        toProvider!.Value.Kind.Should().Be(DateTimeKind.Utc);
        toProvider.Value.Should().Be(localDate.Value.ToUniversalTime());
    }

    [Fact]
    public void UtcNullableDateTimeConverter_WhenGivenNull_ShouldReturnNull()
    {
        // Arrange
        var userModifiedAtProp = _inMemoryContext.Model
            .FindEntityType(typeof(User))!
            .FindProperty(nameof(User.ModifiedAtUtc))!;
        var converter = userModifiedAtProp.GetValueConverter()!;

        // Act
        var toProvider = (DateTime?)converter.ConvertToProvider(null);
        var fromProvider = (DateTime?)converter.ConvertFromProvider(null);

        // Assert
        toProvider.Should().BeNull();
        fromProvider.Should().BeNull();
    }

    [Fact]
    public async Task SaveChanges_WhenSavingEntityWithUnspecifiedKind_ShouldPersistAndQueryBackAsUtc()
    {
        // Arrange
        var unspecifiedDate = new DateTime(2026, 5, 20, 14, 30, 0, DateTimeKind.Unspecified);
        var user = User.Create("unspecified@template.com", "hashed_pwd", "Unspecified User", "User");
        user.CreatedAtUtc = unspecifiedDate;

        _inMemoryContext.Users.Add(user);
        await _inMemoryContext.SaveChangesAsync();
        _inMemoryContext.ChangeTracker.Clear();

        // Act
        var queriedUser = await _inMemoryContext.Users.FirstAsync(u => u.Id == user.Id);

        // Assert - Retains date values but Kind becomes Utc
        queriedUser.CreatedAtUtc.Kind.Should().Be(DateTimeKind.Utc);
        queriedUser.CreatedAtUtc.Year.Should().Be(2026);
        queriedUser.CreatedAtUtc.Month.Should().Be(5);
        queriedUser.CreatedAtUtc.Day.Should().Be(20);
        queriedUser.CreatedAtUtc.Hour.Should().Be(14);
    }

    [Fact]
    public async Task SaveChanges_WhenSavingEntityWithNullNullableDateTime_ShouldPersistAndQueryBackAsNull()
    {
        // Arrange
        var user = User.Create("nullprop@template.com", "hashed_pwd", "Null Prop User", "User");
        user.ModifiedAtUtc = null;
        user.DeletedAtUtc = null;

        _inMemoryContext.Users.Add(user);
        await _inMemoryContext.SaveChangesAsync();
        _inMemoryContext.ChangeTracker.Clear();

        // Act
        var queriedUser = await _inMemoryContext.Users.FirstAsync(u => u.Id == user.Id);

        // Assert
        queriedUser.ModifiedAtUtc.Should().BeNull();
        queriedUser.DeletedAtUtc.Should().BeNull();
    }

    [Fact]
    public async Task SaveChanges_WhenUpdatingEntityWithUnspecifiedNullableDateTime_ShouldPersistAndQueryBackAsUtc()
    {
        // Arrange
        var user = User.Create("updatetest@template.com", "hashed_pwd", "Update User", "User");
        _inMemoryContext.Users.Add(user);
        await _inMemoryContext.SaveChangesAsync();

        // Act - Update with Unspecified DateTime
        var updateTime = new DateTime(2026, 8, 1, 9, 0, 0, DateTimeKind.Unspecified);
        user.ModifiedAtUtc = updateTime;
        await _inMemoryContext.SaveChangesAsync();
        _inMemoryContext.ChangeTracker.Clear();

        // Assert
        var queriedUser = await _inMemoryContext.Users.FirstAsync(u => u.Id == user.Id);
        queriedUser.ModifiedAtUtc.Should().NotBeNull();
        queriedUser.ModifiedAtUtc!.Value.Kind.Should().Be(DateTimeKind.Utc);
        queriedUser.ModifiedAtUtc.Value.Hour.Should().Be(9);
    }

    [Theory]
    [InlineData(2024, 2, 29, 23, 59, 59)] // Leap year
    [InlineData(2028, 2, 29, 12, 0, 0)]   // Future leap year
    [InlineData(2000, 1, 1, 0, 0, 0)]     // Century boundary
    public void UtcDateTimeConverter_WithBoundaryDates_ShouldConvertCorrectly(
        int year, int month, int day, int hour, int minute, int second)
    {
        // Arrange
        var userCreatedAtProp = _inMemoryContext.Model
            .FindEntityType(typeof(User))!
            .FindProperty(nameof(User.CreatedAtUtc))!;
        var converter = userCreatedAtProp.GetValueConverter()!;
        var boundaryDate = new DateTime(year, month, day, hour, minute, second, DateTimeKind.Unspecified);

        // Act
        var toProvider = (DateTime)converter.ConvertToProvider(boundaryDate)!;
        var fromProvider = (DateTime)converter.ConvertFromProvider(toProvider)!;

        // Assert
        toProvider.Kind.Should().Be(DateTimeKind.Utc);
        toProvider.Year.Should().Be(year);
        toProvider.Month.Should().Be(month);
        toProvider.Day.Should().Be(day);

        fromProvider.Kind.Should().Be(DateTimeKind.Utc);
        fromProvider.Should().Be(toProvider);
    }

    [Fact]
    public void Database_IsRelational_WhenUsingNpgsqlProvider_ShouldReturnTrue()
    {
        // Arrange
        var npgsqlOptions = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql("Host=localhost;Port=5432;Database=DummyRelationalTestDb;Username=postgres;Password=postgres;")
            .Options;

        using var npgsqlContext = new ApplicationDbContext(npgsqlOptions);

        // Act & Assert
        npgsqlContext.Database.IsRelational().Should().BeTrue();
        npgsqlContext.Database.ProviderName.Should().Be("Npgsql.EntityFrameworkCore.PostgreSQL");
    }

    [Fact]
    public void Database_IsRelational_WhenUsingInMemoryProvider_ShouldReturnFalse()
    {
        // Act & Assert
        _inMemoryContext.Database.IsRelational().Should().BeFalse();
        _inMemoryContext.Database.ProviderName.Should().Be("Microsoft.EntityFrameworkCore.InMemory");
    }

    #endregion

    #region 3. Failure Path Tests

    [Fact]
    public void ApplicationDbContext_WhenOptionsUnconfigured_ShouldThrowInvalidOperationExceptionOnDataAccess()
    {
        // Arrange: DbContext with empty unconfigured options
        var emptyOptions = new DbContextOptions<ApplicationDbContext>();
        using var unconfiguredContext = new ApplicationDbContext(emptyOptions);

        // Act
        var act = () => unconfiguredContext.Users.ToList();

        // Assert
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*No database provider has been configured for this DbContext*");
    }

    [Fact]
    public async Task ApplicationDbContext_WhenDisposed_ShouldThrowObjectDisposedException()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: $"DisposedTestDb_{Guid.NewGuid()}")
            .Options;

        var context = new ApplicationDbContext(options);
        context.Dispose();

        // Act
        var act = () => context.Users.ToListAsync();

        // Assert
        await act.Should().ThrowAsync<ObjectDisposedException>();
    }

    [Fact]
    public async Task ApplicationDbContext_WhenAddingDuplicateKeyEntity_ShouldThrowException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user1 = User.Create("dup1@template.com", "hash", "User 1", "User");
        var user2 = User.Create("dup2@template.com", "hash", "User 2", "User");

        // Reflectively set same Id to simulate PK collision
        typeof(User).BaseType!.BaseType!
            .GetProperty(nameof(User.Id))!
            .SetValue(user1, userId);
        typeof(User).BaseType!.BaseType!
            .GetProperty(nameof(User.Id))!
            .SetValue(user2, userId);

        _inMemoryContext.Users.Add(user1);
        await _inMemoryContext.SaveChangesAsync();

        // Act & Assert - IdentityMap throws InvalidOperationException when tracking duplicate key
        var act = () => _inMemoryContext.Users.Add(user2);
        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*cannot be tracked because another instance with the same key value*");
    }

    #endregion
}
