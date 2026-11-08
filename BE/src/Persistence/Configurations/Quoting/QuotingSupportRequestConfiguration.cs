namespace TemplateLandingPage.Persistence.Configurations.Quoting;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TemplateLandingPage.Domain.Entities.Quoting;
using TemplateLandingPage.Persistence.Constants;

public sealed class QuotingSupportRequestConfiguration : IEntityTypeConfiguration<QuotingSupportRequest>
{
    public void Configure(EntityTypeBuilder<QuotingSupportRequest> builder)
    {
        builder.ToTable(TableNames.QuotingSupportRequests, TableNames.QuotingSchema);
        builder.HasKey(request => request.Id);
        builder.Property(request => request.Id).ValueGeneratedNever();
        builder.Property(request => request.FullName).HasMaxLength(150).IsRequired();
        builder.Property(request => request.Email).HasMaxLength(150).IsRequired();
        builder.Property(request => request.Phone).HasMaxLength(50);
        builder.Property(request => request.Topic).HasMaxLength(100).IsRequired();
        builder.Property(request => request.Priority).HasMaxLength(20).IsRequired();
        builder.Property(request => request.Message).HasMaxLength(4000).IsRequired();
        builder.HasIndex(request => new { request.CreatedByUserId, request.CreatedAtUtc });
    }
}
