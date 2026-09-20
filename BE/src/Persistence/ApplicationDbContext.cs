namespace TemplateLandingPage.Persistence;

using Microsoft.EntityFrameworkCore;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;

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
    public DbSet<RsvpEntry> RsvpEntries => Set<RsvpEntry>();
    public DbSet<GuestbookEntry> GuestbookEntries => Set<GuestbookEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
