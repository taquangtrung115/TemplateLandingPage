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

        builder.Property(t => t.CategoryId);

        builder.Property(t => t.Category)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(t => t.ThumbnailUrl)
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(t => t.PreviewUrl)
            .HasMaxLength(1000);

        builder.Property(t => t.LongPreviewUrl)
            .HasMaxLength(1000);

        builder.Property(t => t.Badge)
            .HasMaxLength(50);

        builder.Property(t => t.AudioUrl)
            .HasMaxLength(1000);

        builder.Property(t => t.MusicTitle)
            .HasMaxLength(200);

        builder.Property(t => t.DefaultConfigJson)
            .IsRequired();

        builder.Property(t => t.IsActive)
            .IsRequired();

        builder.Property(t => t.IsCommunity)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(t => t.AuthorName)
            .HasMaxLength(150);

        builder.Property(t => t.CreatedByUserId);

        builder.Property(t => t.IsDeleted)
            .IsRequired();

        builder.Property(t => t.DeletedAtUtc);
        builder.Property(t => t.CreatedAtUtc).IsRequired();
        builder.Property(t => t.ModifiedAtUtc);

        builder.HasOne(t => t.CategoryRef)
            .WithMany(c => c.Templates)
            .HasForeignKey(t => t.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Ignore(t => t.DomainEvents);

        builder.HasQueryFilter(t => !t.IsDeleted);
    }
}
