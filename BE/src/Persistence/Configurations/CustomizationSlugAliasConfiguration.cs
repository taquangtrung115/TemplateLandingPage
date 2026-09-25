namespace TemplateLandingPage.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TemplateLandingPage.Domain.Entities;

public sealed class CustomizationSlugAliasConfiguration : IEntityTypeConfiguration<CustomizationSlugAlias>
{
    public void Configure(EntityTypeBuilder<CustomizationSlugAlias> builder)
    {
        builder.ToTable("CustomizationSlugAliases");
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Slug).HasMaxLength(200).IsRequired();
        builder.HasIndex(a => a.Slug).IsUnique();
        builder.HasOne<UserCustomization>().WithMany().HasForeignKey(a => a.CustomizationId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
