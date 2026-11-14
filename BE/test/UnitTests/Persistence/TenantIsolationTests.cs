namespace OnePortal.UnitTests.Persistence;

using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using OnePortal.Application.Services.Tenancy;
using OnePortal.Domain.Abstractions;
using OnePortal.Domain.Entities;
using OnePortal.Domain.Entities.Tenancy;
using OnePortal.Persistence;
using Xunit;

public sealed class TenantIsolationTests
{
    #region Isolation and model contracts
    [Fact]
    public async Task SharedModel_UsesEachContextsTenant_AndPreservesSoftDelete()
    {
        var options = Options(); var tenantA = Guid.NewGuid(); var tenantB = Guid.NewGuid();
        await using var a = new ApplicationDbContext(options, TenantContext.For(tenantA, "landing"));
        await using var b = new ApplicationDbContext(options, TenantContext.For(tenantB, "landing"));
        var productA = Product.Create("A", null, 1); var productB = Product.Create("B", null, 2);
        a.Products.Add(productA); await a.SaveChangesAsync();
        b.Products.Add(productB); await b.SaveChangesAsync();
        (await a.Products.Select(product => product.Name).ToArrayAsync()).Should().Equal("A");
        (await b.Products.Select(product => product.Name).ToArrayAsync()).Should().Equal("B");
        await using var unresolved = new ApplicationDbContext(options);
        (await unresolved.Products.CountAsync()).Should().Be(0);
        productA.IsDeleted = true; await a.SaveChangesAsync();
        (await a.Products.CountAsync()).Should().Be(0);
        (await a.Products.IgnoreQueryFilters().CountAsync(product => product.TenantId == tenantA)).Should().Be(1);
    }

    [Fact]
    public async Task AsyncAndSyncWrites_RequireTenantContext()
    {
        await using var context = new ApplicationDbContext(Options());
        context.Products.Add(Product.Create("No scope", null, 1));
        Action sync = () => context.SaveChanges();
        Func<Task> asyncWrite = () => context.SaveChangesAsync();
        sync.Should().Throw<InvalidOperationException>();
        await asyncWrite.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task AttachingAnotherTenantsEntity_AndWrongApplicationWrites_AreRejected()
    {
        var options = Options(); var aId = Guid.NewGuid();
        var product = Product.Create("Tenant A", null, 1);
        await using (var a = new ApplicationDbContext(options, TenantContext.For(aId, "landing")))
        { a.Products.Add(product); await a.SaveChangesAsync(); }
        await using var b = new ApplicationDbContext(options, TenantContext.For(Guid.NewGuid(), "landing"));
        b.Products.Update(product);
        await ((Func<Task>)(() => b.SaveChangesAsync())).Should().ThrowAsync<InvalidOperationException>();
        await using var quoting = new ApplicationDbContext(options, TenantContext.For(aId, "quoting"));
        quoting.Products.Add(Product.Create("Wrong module", null, 1));
        await ((Func<Task>)(() => quoting.SaveChangesAsync())).Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public void TenantOwnership_AndRequestContext_AreImmutable()
    {
        var id = Guid.NewGuid(); var product = Product.Create("Product", null, 1); product.AssignTenant(id);
        ((Action)(() => product.AssignTenant(Guid.NewGuid()))).Should().Throw<InvalidOperationException>();
        ((Action)(() => product.AssignTenant(Guid.Empty))).Should().Throw<ArgumentException>();
        var scope = TenantContext.For(id, "landing");
        ((Action)(() => scope.Initialize(Guid.NewGuid(), "landing"))).Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void EveryBusinessEntity_HasMandatoryTenantFilter_ConcurrencyAndCompositeReferences()
    {
        using var context = new ApplicationDbContext(Options());
        var global = new[] { typeof(User), typeof(Tenant), typeof(PlatformApplication), typeof(SystemSeedHistory) };
        foreach (var entity in context.Model.GetEntityTypes().Where(entity => !entity.IsOwned()))
        {
            if (global.Contains(entity.ClrType)) { typeof(ITenantEntity).IsAssignableFrom(entity.ClrType).Should().BeFalse(); continue; }
            typeof(ITenantEntity).IsAssignableFrom(entity.ClrType).Should().BeTrue(entity.ClrType.Name);
            var tenant = entity.FindProperty("TenantId")!;
            tenant.IsNullable.Should().BeFalse(); tenant.IsConcurrencyToken.Should().BeTrue();
            entity.GetQueryFilter().Should().NotBeNull();
            entity.GetIndexes().Where(index => index.IsUnique).All(index => index.Properties.Any(property => property.Name == "TenantId")).Should().BeTrue();
            foreach (var reference in entity.GetForeignKeys().Where(reference => typeof(ITenantEntity).IsAssignableFrom(reference.PrincipalEntityType.ClrType)))
            {
                reference.Properties.Should().Contain(property => property.Name == "TenantId");
                reference.PrincipalKey.Properties.Should().Contain(property => property.Name == "TenantId");
            }
        }
    }

    [Fact]
    public async Task GlobalIdentity_IsSharedWithoutInventingATenantId()
    {
        var options = Options(); var user = User.Create("global@test.local", "hash", "Global");
        await using var root = new ApplicationDbContext(options); root.Users.Add(user); await root.SaveChangesAsync();
        await using var tenant = new ApplicationDbContext(options, TenantContext.For(Guid.NewGuid(), "quoting"));
        (await tenant.Users.SingleAsync()).Id.Should().Be(user.Id);
        root.Model.FindEntityType(typeof(User))!.FindProperty("TenantId").Should().BeNull();
    }

    [Fact]
    public async Task MembershipAndSeedMetadata_AreScopedToTheApplication_AndCannotBeWrittenFromAnotherApp()
    {
        var options = Options(); var id = Guid.NewGuid(); var userId = Guid.NewGuid();
        await using var landing = new ApplicationDbContext(options, TenantContext.For(id, "landing"));
        landing.TenantMemberships.Add(TenantMembership.Create(id, userId, "landing", "Admin"));
        landing.TenantSeedHistory.Add(TenantSeedHistory.Complete(id, "landing", "foundation", 1));
        await landing.SaveChangesAsync();
        await using var quoting = new ApplicationDbContext(options, TenantContext.For(id, "quoting"));
        (await quoting.TenantMemberships.CountAsync()).Should().Be(0);
        (await quoting.TenantSeedHistory.CountAsync()).Should().Be(0);
        quoting.TenantApplications.Add(TenantApplication.Create(id, "landing"));
        await ((Func<Task>)(() => quoting.SaveChangesAsync())).Should().ThrowAsync<InvalidOperationException>();
    }

    private static DbContextOptions<ApplicationDbContext> Options() => new DbContextOptionsBuilder<ApplicationDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
    #endregion
}
