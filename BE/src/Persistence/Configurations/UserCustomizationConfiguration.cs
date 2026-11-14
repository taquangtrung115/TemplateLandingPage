namespace OnePortal.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnePortal.Domain.Entities;
using OnePortal.Persistence.Constants;

public sealed class UserCustomizationConfiguration : IEntityTypeConfiguration<UserCustomization>
{
    public void Configure(EntityTypeBuilder<UserCustomization> builder)
    {
        builder.ToTable(TableNames.UserCustomizations);

        builder.HasKey(c => c.Id);

        builder.Property(c => c.UserId);
        builder.Property(c => c.Revision).IsConcurrencyToken().HasDefaultValue(1);
        builder.Property(c => c.LastSaveRequestHash).HasMaxLength(64);
        builder.HasIndex(c => new { c.UserId, c.ClientDraftId }).IsUnique();
        builder.HasOne<CustomizationVersion>().WithMany().HasForeignKey(c => c.PublishedVersionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(c => c.TemplateId)
            .IsRequired();

        builder.Property(c => c.Title)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(c => c.Slug)
            .HasMaxLength(200)
            .IsRequired();

        builder.HasIndex(c => c.Slug)
            .IsUnique();

        builder.Property(c => c.ConfigJson)
            .IsRequired();

        builder.Property(c => c.IsPublished)
            .IsRequired();

        builder.Property(c => c.IsDeleted)
            .IsRequired();

        builder.Property(c => c.DeletedAtUtc);
        builder.Property(c => c.CreatedAtUtc).IsRequired();
        builder.Property(c => c.ModifiedAtUtc);

        builder.Ignore(c => c.DomainEvents);

        builder.HasQueryFilter(c => !c.IsDeleted);
    }
}
