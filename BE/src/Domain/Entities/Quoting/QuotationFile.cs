namespace OnePortal.Domain.Entities.Quoting;

using OnePortal.Domain.Abstractions;

public sealed class QuotationFile : TenantEntity<Guid>
{
    public Guid QuotationId { get; private set; }
    public string FileName { get; private set; } = string.Empty;
    public string FileType { get; private set; } = "pdf";
    public string FileUrl { get; private set; } = string.Empty;
    public long FileSize { get; private set; }
    public string StorageProvider { get; private set; } = "Supabase";
    public DateTime CreatedAtUtc { get; private set; }
    public Guid CreatedByUserId { get; private set; }

    private QuotationFile()
    {
    }

    private QuotationFile(
        Guid id,
        Guid quotationId,
        string fileName,
        string fileType,
        string fileUrl,
        long fileSize,
        string storageProvider,
        Guid createdByUserId)
    {
        Id = id;
        QuotationId = quotationId;
        FileName = fileName;
        FileType = fileType.ToLowerInvariant();
        FileUrl = fileUrl;
        FileSize = fileSize;
        StorageProvider = storageProvider;
        CreatedAtUtc = DateTime.UtcNow;
        CreatedByUserId = createdByUserId;
    }

    public static QuotationFile Create(
        Guid quotationId,
        string fileName,
        string fileType,
        string fileUrl,
        long fileSize,
        string storageProvider,
        Guid createdByUserId)
    {
        return new QuotationFile(
            Guid.NewGuid(),
            quotationId,
            fileName,
            fileType,
            fileUrl,
            fileSize,
            storageProvider,
            createdByUserId);
    }
}
