namespace TemplateLandingPage.Persistence.Configurations.Quoting;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TemplateLandingPage.Domain.Entities.Quoting;
using TemplateLandingPage.Persistence.Constants;

public sealed class QuotationTemplateConfiguration : IEntityTypeConfiguration<QuotationTemplate>
{
    public void Configure(EntityTypeBuilder<QuotationTemplate> builder)
    {
        builder.ToTable(TableNames.QuotationTemplates, TableNames.QuotingSchema);

        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).ValueGeneratedNever();

        builder.Property(t => t.Code)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(t => t.Code)
            .IsUnique();

        builder.Property(t => t.Name)
            .HasMaxLength(250)
            .IsRequired();

        builder.Property(t => t.Description)
            .HasMaxLength(1000);

        builder.Property(t => t.CurrentVersion)
            .IsRequired();

        builder.Property(t => t.IsSystem)
            .IsRequired();

        builder.Property(t => t.IsActive)
            .IsRequired();

        builder.Property(t => t.IsDeleted)
            .IsRequired();

        builder.Property(t => t.DeletedAtUtc);
        builder.Property(t => t.CreatedAtUtc).IsRequired();
        builder.Property(t => t.ModifiedAtUtc);

        builder.HasMany(t => t.Versions)
            .WithOne()
            .HasForeignKey(v => v.TemplateId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Ignore(t => t.DomainEvents);
        builder.HasQueryFilter(t => !t.IsDeleted);
    }
}
