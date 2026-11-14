namespace OnePortal.Persistence.Configurations.Quoting;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnePortal.Domain.Entities.Quoting;
using OnePortal.Persistence.Constants;

public sealed class QuotingCustomerConfiguration : IEntityTypeConfiguration<QuotingCustomer>
{
    public void Configure(EntityTypeBuilder<QuotingCustomer> builder)
    {
        builder.ToTable(TableNames.QuotingCustomers, TableNames.QuotingSchema);

        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).ValueGeneratedNever();

        builder.Property(c => c.Name)
            .HasMaxLength(250)
            .IsRequired();

        builder.Property(c => c.ContactPerson)
            .HasMaxLength(150);

        builder.Property(c => c.Phone)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(c => c.Email)
            .HasMaxLength(150);

        builder.Property(c => c.Address)
            .HasMaxLength(500);

        builder.Property(c => c.TaxCode)
            .HasMaxLength(50);

        builder.Property(c => c.Notes)
            .HasMaxLength(1000);

        builder.Property(c => c.IsActive)
            .IsRequired();

        builder.Property(c => c.IsDeleted)
            .IsRequired();

        builder.Property(c => c.DeletedAtUtc);
        builder.Property(c => c.CreatedAtUtc).IsRequired();
        builder.Property(c => c.ModifiedAtUtc);

        builder.Ignore(c => c.DomainEvents);
        builder.HasQueryFilter(c => !c.IsDeleted);
    }
}
