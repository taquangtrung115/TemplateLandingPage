namespace TemplateLandingPage.Persistence;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Entities.Quoting;

public sealed class ApplicationDbContext : DbContext, IUnitOfWork
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

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

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
        base.OnConfiguring(optionsBuilder);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasSequence<long>("QuotationNumbers", "quo");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }

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
