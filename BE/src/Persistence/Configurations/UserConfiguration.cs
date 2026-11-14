namespace OnePortal.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnePortal.Domain.Entities;
using OnePortal.Persistence.Constants;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable(TableNames.Users);

        builder.HasKey(u => u.Id);

        builder.Property(u => u.Email)
            .HasMaxLength(255)
            .IsRequired();

        builder.HasIndex(u => u.Email)
            .IsUnique();

        builder.Property(u => u.PasswordHash)
            .IsRequired();

        builder.Property(u => u.FullName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(u => u.Role)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(u => u.AvatarUrl)
            .HasMaxLength(500)
            .IsRequired(false);

        builder.Property(u => u.Provider)
            .HasMaxLength(50)
            .IsRequired(false);

        builder.Property(u => u.IsActive)
            .IsRequired();

        builder.Property(u => u.IsDeleted)
            .IsRequired();

        builder.Property(u => u.DeletedAtUtc);
        builder.Property(u => u.CreatedAtUtc).IsRequired();
        builder.Property(u => u.ModifiedAtUtc);

        builder.HasQueryFilter(u => !u.IsDeleted);
    }
}
