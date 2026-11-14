namespace OnePortal.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnePortal.Domain.Entities;

public sealed class CustomizationVersionConfiguration : IEntityTypeConfiguration<CustomizationVersion>
{
    public void Configure(EntityTypeBuilder<CustomizationVersion> builder)
    {
        builder.ToTable("CustomizationVersions");
        builder.HasKey(v => v.Id);
        builder.Property(v => v.Title).HasMaxLength(200).IsRequired();
        builder.Property(v => v.ConfigJson).IsRequired();
        builder.Property(v => v.RequestHash).HasMaxLength(64).IsRequired();
        builder.HasIndex(v => new { v.CustomizationId, v.VersionNumber }).IsUnique();
        builder.HasIndex(v => new { v.CustomizationId, v.RequestId }).IsUnique();
        builder.HasOne<UserCustomization>().WithMany().HasForeignKey(v => v.CustomizationId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
