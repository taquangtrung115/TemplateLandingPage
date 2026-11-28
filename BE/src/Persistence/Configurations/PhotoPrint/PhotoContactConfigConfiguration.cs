namespace OnePortal.Persistence.Configurations.PhotoPrint;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnePortal.Domain.Entities.PhotoPrint;

public sealed class PhotoContactConfigConfiguration : IEntityTypeConfiguration<PhotoContactConfig>
{
    public void Configure(EntityTypeBuilder<PhotoContactConfig> builder)
    {
        builder.ToTable("ContactConfigs", "photo");
        builder.HasIndex(entity => entity.TenantId).IsUnique();
        builder.Property(entity => entity.BankCode).HasMaxLength(8);
        builder.Property(entity => entity.BankName).HasMaxLength(100);
        builder.Property(entity => entity.BankAccountNumber).HasMaxLength(19);
        builder.Property(entity => entity.BankAccountName).HasMaxLength(120);
        builder.Property(entity => entity.BankBranch).HasMaxLength(150);
    }
}
