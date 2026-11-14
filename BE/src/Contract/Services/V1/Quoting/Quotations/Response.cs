namespace OnePortal.Contract.Services.V1.Quoting.Quotations;

public record QuotationResponse(
    Guid Id,
    string QuotationNumber,
    Guid? CustomerId,
    string CustomerName,
    string? CustomerPhone,
    string Status,
    DateTime IssueDate,
    DateTime? ValidUntil,
    decimal SubTotal,
    decimal DiscountAmount,
    decimal TaxAmount,
    decimal TotalAmount,
    DateTime CreatedAtUtc, bool ShowGrandTotal = true);

public record QuotationDetailResponse(
    Guid Id,
    string QuotationNumber,
    Guid? CustomerId,
    string CustomerName,
    string? CustomerContactPerson,
    string? CustomerPhone,
    string? CustomerEmail,
    string? CustomerAddress,
    string? CustomerTaxCode,
    Guid TemplateId,
    int TemplateVersion,
    string Status,
    DateTime IssueDate,
    DateTime? ValidUntil,
    decimal SubTotal,
    decimal DiscountPercent,
    decimal DiscountAmount,
    decimal TaxPercent,
    decimal TaxAmount,
    decimal TotalAmount,
    string? Notes,
    Guid CreatedByUserId,
    DateTime CreatedAtUtc,
    DateTime? ModifiedAtUtc,
    List<QuotationItemResponse> Items,
    List<QuotationHistoryResponse> Histories,
    List<QuotationFileResponse> Files,
    bool ShowDiscount = true,
    bool ShowQuantity = true,
    bool ShowSubTotal = true,
    bool ShowGrandTotal = true);

public record QuotationItemResponse(
    Guid Id,
    Guid? ProductId,
    string? ProductCode,
    string ProductName,
    string? Description,
    string Unit,
    string? ImageUrl,
    string? ItemGroup,
    decimal Quantity,
    decimal UnitPrice,
    decimal DiscountPercent,
    decimal DiscountAmount,
    decimal TotalAmount,
    string? Notes,
    int SortOrder, int GroupSortOrder = 0);

public record QuotationHistoryResponse(
    Guid Id,
    string Action,
    string Description,
    string? SnapshotData,
    Guid CreatedByUserId,
    DateTime CreatedAtUtc);

public record QuotationFileResponse(
    Guid Id,
    Guid QuotationId,
    string FileName,
    string FileType,
    string FileUrl,
    long FileSize,
    string StorageProvider,
    DateTime CreatedAtUtc);

public record QuotationPreviewResponse(
    Guid QuotationId,
    string QuotationNumber,
    string HtmlContent);
