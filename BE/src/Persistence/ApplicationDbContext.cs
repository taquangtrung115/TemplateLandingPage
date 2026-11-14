namespace OnePortal.Persistence;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System.Linq.Expressions;
using OnePortal.Application.Abstractions;
using OnePortal.Domain.Abstractions;
using OnePortal.Domain.Entities.Tenancy;
using Microsoft.EntityFrameworkCore.Infrastructure;
using OnePortal.Domain.Abstractions.Repositories;
using OnePortal.Domain.Entities;
using OnePortal.Domain.Entities.Quoting;

public sealed class ApplicationDbContext : DbContext, IUnitOfWork
{
    private readonly ITenantContext? _tenantContext;
    public Guid CurrentTenantId => _tenantContext?.TenantId ?? Guid.Empty;
    public string CurrentAppKey => _tenantContext?.AppKey ?? string.Empty;
    public DbContextOptions<ApplicationDbContext> GetOptions() => (DbContextOptions<ApplicationDbContext>)this.GetService<IDbContextOptions>();

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ITenantContext? tenantContext = null)
        : base(options)
    {
        _tenantContext = tenantContext;
    }

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<PlatformApplication> Applications => Set<PlatformApplication>();
    public DbSet<TenantApplication> TenantApplications => Set<TenantApplication>();
    public DbSet<TenantMembership> TenantMemberships => Set<TenantMembership>();
    public DbSet<SystemSeedHistory> SystemSeedHistory => Set<SystemSeedHistory>();
    public DbSet<TenantSeedHistory> TenantSeedHistory => Set<TenantSeedHistory>();

    public DbSet<Product> Products => Set<Product>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<NavigationMenu> NavigationMenus => Set<NavigationMenu>();
    public DbSet<Template> Templates => Set<Template>();
    public DbSet<UserCustomization> UserCustomizations => Set<UserCustomization>();
    public DbSet<CustomizationVersion> CustomizationVersions => Set<CustomizationVersion>();
    public DbSet<CustomizationSlugAlias> CustomizationSlugAliases => Set<CustomizationSlugAlias>();
    public DbSet<RsvpEntry> RsvpEntries => Set<RsvpEntry>();
    public DbSet<GuestbookEntry> GuestbookEntries => Set<GuestbookEntry>();

    // Quoting Module
    public DbSet<QuotingProductGroup> QuotingProductGroups => Set<QuotingProductGroup>();
    public DbSet<QuotingProduct> QuotingProducts => Set<QuotingProduct>();
    public DbSet<QuotingCustomer> QuotingCustomers => Set<QuotingCustomer>();
    public DbSet<QuotationTemplate> QuotationTemplates => Set<QuotationTemplate>();
    public DbSet<QuotationTemplateVersion> QuotationTemplateVersions => Set<QuotationTemplateVersion>();
    public DbSet<Quotation> Quotations => Set<Quotation>();
    public DbSet<QuotationItem> QuotationItems => Set<QuotationItem>();
    public DbSet<QuotationHistory> QuotationHistories => Set<QuotationHistory>();
    public DbSet<QuotationFile> QuotationFiles => Set<QuotationFile>();
    public DbSet<QuotingSupportRequest> QuotingSupportRequests => Set<QuotingSupportRequest>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasSequence<long>("QuotationNumbers", "quo");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        ConfigureTenantModel(modelBuilder);
        base.OnModelCreating(modelBuilder);
    }

    #region Tenant model and write protection
    private void ConfigureTenantModel(ModelBuilder modelBuilder)
    {
        var entities = modelBuilder.Model.GetEntityTypes().Where(type => typeof(ITenantEntity).IsAssignableFrom(type.ClrType)).ToList();
        foreach (var entity in entities)
        {
            var builder = modelBuilder.Entity(entity.ClrType);
            builder.Property<Guid>(nameof(ITenantEntity.TenantId)).IsRequired().IsConcurrencyToken();
            builder.HasOne(typeof(Tenant)).WithMany().HasForeignKey(nameof(ITenantEntity.TenantId)).OnDelete(DeleteBehavior.Restrict);
            builder.HasAlternateKey(nameof(ITenantEntity.TenantId), "Id");
            foreach (var index in entity.GetIndexes().Where(index => index.IsUnique && !index.Properties.Any(property => property.Name == "TenantId")).ToList())
            {
                var properties = index.Properties.Select(property => property.Name).ToArray();
                var filter = index.GetFilter();
                entity.RemoveIndex(index);
                builder.HasIndex(new[] { "TenantId" }.Concat(properties).ToArray()).IsUnique().HasFilter(filter);
            }

            var parameter = Expression.Parameter(entity.ClrType, "entity");
            Expression body = Expression.Equal(Expression.Property(parameter, "TenantId"), Expression.Property(Expression.Constant(this), nameof(CurrentTenantId)));
            var appKey = ApplicationFor(entity.ClrType);
            if (appKey is not null)
                body = Expression.AndAlso(body, Expression.Equal(Expression.Property(Expression.Constant(this), nameof(CurrentAppKey)), Expression.Constant(appKey)));
            if (appKey is null && entity.FindProperty("AppKey") is not null)
                body = Expression.AndAlso(body, Expression.Equal(Expression.Property(parameter, "AppKey"), Expression.Property(Expression.Constant(this), nameof(CurrentAppKey))));
            var existing = entity.GetQueryFilter();
            if (existing is not null)
                body = Expression.AndAlso(body, new ReplaceParameter(existing.Parameters[0], parameter).Visit(existing.Body)!);
            builder.HasQueryFilter(Expression.Lambda(body, parameter));
        }

        foreach (var entity in entities)
        foreach (var foreignKey in entity.GetForeignKeys().Where(foreignKey => typeof(ITenantEntity).IsAssignableFrom(foreignKey.PrincipalEntityType.ClrType)
            && !foreignKey.Properties.Any(property => property.Name == "TenantId")).ToList())
        {
            var principal = foreignKey.PrincipalEntityType.ClrType;
            var properties = new[] { "TenantId" }.Concat(foreignKey.Properties.Select(property => property.Name)).ToArray();
            var principalProperties = new[] { "TenantId" }.Concat(foreignKey.PrincipalKey.Properties.Select(property => property.Name)).ToArray();
            var navigation = foreignKey.DependentToPrincipal?.Name;
            var inverse = foreignKey.PrincipalToDependent?.Name;
            var behavior = foreignKey.DeleteBehavior;
            var unique = foreignKey.IsUnique;
            entity.RemoveForeignKey(foreignKey);
            if (unique)
                modelBuilder.Entity(entity.ClrType).HasOne(principal, navigation).WithOne(inverse)
                    .HasForeignKey(entity.ClrType, properties).HasPrincipalKey(principal, principalProperties).OnDelete(behavior);
            else
                modelBuilder.Entity(entity.ClrType).HasOne(principal, navigation).WithMany(inverse)
                    .HasForeignKey(properties).HasPrincipalKey(principalProperties).OnDelete(behavior);
        }
    }

    public static string? ApplicationFor(Type type) => type.Namespace?.Contains(".Entities.Tenancy", StringComparison.Ordinal) == true ? null
        : type.Namespace?.Contains(".Quoting", StringComparison.Ordinal) == true ? "quoting" : "landing";

    private void EnsureTenantWrites()
    {
        foreach (var entry in ChangeTracker.Entries<ITenantEntity>().Where(entry => entry.State is EntityState.Added or EntityState.Modified or EntityState.Deleted))
        {
            if (CurrentTenantId == Guid.Empty) throw new InvalidOperationException("A resolved tenant context is required for business writes.");
            var appKey = ApplicationFor(entry.Entity.GetType());
            if (appKey is not null && appKey != CurrentAppKey) throw new InvalidOperationException("The entity belongs to another application.");
            if (entry.State == EntityState.Added) entry.Entity.AssignTenant(CurrentTenantId);
            if (entry.Entity.TenantId != CurrentTenantId || (entry.State != EntityState.Added && entry.Property("TenantId").OriginalValue is Guid original && original != CurrentTenantId))
                throw new InvalidOperationException("Cross-tenant writes are forbidden.");
            if (appKey is null && entry.Metadata.FindProperty("AppKey") is not null && entry.Property("AppKey").CurrentValue as string != CurrentAppKey)
                throw new InvalidOperationException("The platform record belongs to another application.");
        }
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        EnsureTenantWrites(); return base.SaveChanges(acceptAllChangesOnSuccess);
    }
    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
    {
        EnsureTenantWrites(); return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    private sealed class ReplaceParameter(ParameterExpression source, ParameterExpression target) : ExpressionVisitor
    {
        protected override Expression VisitParameter(ParameterExpression node) => node == source ? target : base.VisitParameter(node);
    }
    #endregion

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        configurationBuilder.Properties<DateTime>()
            .HaveConversion<UtcDateTimeConverter>();
        configurationBuilder.Properties<DateTime?>()
            .HaveConversion<UtcNullableDateTimeConverter>();
        base.ConfigureConventions(configurationBuilder);
    }
}

internal sealed class UtcDateTimeConverter : ValueConverter<DateTime, DateTime>
{
    public UtcDateTimeConverter()
        : base(
            d => d.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(d, DateTimeKind.Utc) : d.ToUniversalTime(),
            d => DateTime.SpecifyKind(d, DateTimeKind.Utc))
    {
    }
}

internal sealed class UtcNullableDateTimeConverter : ValueConverter<DateTime?, DateTime?>
{
    public UtcNullableDateTimeConverter()
        : base(
            d => !d.HasValue ? d : (d.Value.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(d.Value, DateTimeKind.Utc) : d.Value.ToUniversalTime()),
            d => !d.HasValue ? d : DateTime.SpecifyKind(d.Value, DateTimeKind.Utc))
    {
    }
}
