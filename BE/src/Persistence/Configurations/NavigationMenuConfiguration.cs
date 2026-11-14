namespace OnePortal.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnePortal.Domain.Entities;
using OnePortal.Persistence.Constants;

public sealed class NavigationMenuConfiguration : IEntityTypeConfiguration<NavigationMenu>
{
    public void Configure(EntityTypeBuilder<NavigationMenu> builder)
    {
        builder.ToTable(TableNames.NavigationMenus);

        builder.HasKey(m => m.Id);

        builder.Property(m => m.Title)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(m => m.Url)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(m => m.Target)
            .HasMaxLength(50)
            .HasDefaultValue("_self")
            .IsRequired();

        builder.Property(m => m.Badge)
            .HasMaxLength(50);

        builder.Property(m => m.BadgeColor)
            .HasMaxLength(50);

        builder.Property(m => m.Icon)
            .HasMaxLength(100);

        builder.Property(m => m.OrderIndex)
            .IsRequired();

        builder.Property(m => m.IsActive)
            .IsRequired();

        builder.Property(m => m.IsDeleted)
            .IsRequired();

        builder.Property(m => m.DeletedAtUtc);
        builder.Property(m => m.CreatedAtUtc).IsRequired();
        builder.Property(m => m.ModifiedAtUtc);

        builder.HasOne(m => m.Parent)
            .WithMany(m => m.SubMenus)
            .HasForeignKey(m => m.ParentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Ignore(m => m.DomainEvents);

        builder.HasQueryFilter(m => !m.IsDeleted);
    }
}
