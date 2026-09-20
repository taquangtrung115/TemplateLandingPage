namespace TemplateLandingPage.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Persistence.Constants;

public sealed class TemplateConfiguration : IEntityTypeConfiguration<Template>
{
    public void Configure(EntityTypeBuilder<Template> builder)
    {
        builder.ToTable(TableNames.Templates);

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(t => t.Slug)
            .HasMaxLength(200)
            .IsRequired();

        builder.HasIndex(t => t.Slug)
            .IsUnique();

        builder.Property(t => t.Description)
            .HasMaxLength(1000);

        builder.Property(t => t.Category)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(t => t.ThumbnailUrl)
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(t => t.PreviewUrl)
            .HasMaxLength(1000);

        builder.Property(t => t.DefaultConfigJson)
            .IsRequired();

        builder.Property(t => t.IsActive)
            .IsRequired();

        builder.Property(t => t.IsDeleted)
            .IsRequired();

        builder.Property(t => t.DeletedAtUtc);
        builder.Property(t => t.CreatedAtUtc).IsRequired();
        builder.Property(t => t.ModifiedAtUtc);

        builder.Ignore(t => t.DomainEvents);

        builder.HasQueryFilter(t => !t.IsDeleted);
    }
}
