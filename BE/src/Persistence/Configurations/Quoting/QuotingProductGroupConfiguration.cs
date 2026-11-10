namespace TemplateLandingPage.Persistence.Configurations.Quoting;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TemplateLandingPage.Domain.Entities.Quoting;

public sealed class QuotingProductGroupConfiguration : IEntityTypeConfiguration<QuotingProductGroup>
{
    public void Configure(EntityTypeBuilder<QuotingProductGroup> builder)
    {
        builder.ToTable("ProductGroups", "quo");
        builder.HasKey(group => group.Id);
        builder.Property(group => group.Id).ValueGeneratedNever();
        builder.Property(group => group.Code).HasMaxLength(50).IsRequired();
        builder.HasIndex(group => group.Code).IsUnique();
        builder.Property(group => group.Name).HasMaxLength(100).IsRequired();
        builder.Property(group => group.Description).HasMaxLength(1000);
        builder.HasIndex(group => new { group.SortOrder, group.Code });
        builder.Ignore(group => group.DomainEvents);
        builder.HasQueryFilter(group => !group.IsDeleted);
    }
}
