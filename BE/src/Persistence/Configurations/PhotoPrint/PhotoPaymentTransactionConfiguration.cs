namespace OnePortal.Persistence.Configurations.PhotoPrint;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OnePortal.Domain.Entities.PhotoPrint;

public sealed class PhotoPaymentTransactionConfiguration : IEntityTypeConfiguration<PhotoPaymentTransaction>
{
    public void Configure(EntityTypeBuilder<PhotoPaymentTransaction> builder)
    {
        builder.ToTable("PaymentTransactions", "photo");
        builder.HasOne(entity => entity.Order).WithMany().HasForeignKey(entity => entity.OrderId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(entity => new { entity.TenantId, entity.TransactionCode }).IsUnique();
        builder.HasIndex(entity => new { entity.TenantId, entity.OrderId }).IsUnique().HasFilter("\"Status\" <> 'Rejected'");
        builder.HasIndex(entity => new { entity.TenantId, entity.Status, entity.CreatedAtUtc });
        builder.Property(entity => entity.Revision).IsConcurrencyToken();
        builder.Property(entity => entity.Status).HasMaxLength(20);
        builder.Property(entity => entity.OrderCode).HasMaxLength(40);
        builder.Property(entity => entity.TransactionCode).HasMaxLength(32);
        builder.Property(entity => entity.BankCode).HasMaxLength(8);
        builder.Property(entity => entity.BankName).HasMaxLength(100);
        builder.Property(entity => entity.BankAccountNumber).HasMaxLength(19);
        builder.Property(entity => entity.TransferMemo).HasMaxLength(25);
        builder.Property(entity => entity.CustomerPhone).HasMaxLength(30);
        builder.Property(entity => entity.Note).HasMaxLength(500);
        builder.Property(entity => entity.StaffNote).HasMaxLength(500);
    }
}
