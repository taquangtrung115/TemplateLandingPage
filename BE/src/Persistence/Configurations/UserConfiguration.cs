namespace TemplateLandingPage.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Persistence.Constants;

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

        builder.Property(u => u.IsActive)
            .IsRequired();

        builder.Property(u => u.IsDeleted)
            .IsRequired();

        builder.Property(u => u.DeletedAtUtc);
        builder.Property(u => u.CreatedAtUtc).IsRequired();
        builder.Property(u => u.ModifiedAtUtc);

        builder.Ignore(u => u.DomainEvents);

        builder.HasQueryFilter(u => !u.IsDeleted);
    }
}
