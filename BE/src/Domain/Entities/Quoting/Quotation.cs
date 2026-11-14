namespace OnePortal.Domain.Entities.Quoting;

using OnePortal.Domain.Abstractions;

public sealed class Quotation : AggregateRoot<Guid>, IAuditableEntity, ISoftDelete
{
    private readonly List<QuotationItem> _items = new();
    private readonly List<QuotationHistory> _histories = new();
    private readonly List<QuotationFile> _files = new();

    public string QuotationNumber { get; private set; } = string.Empty;
    public Guid? CustomerId { get; private set; }
    public string CustomerName { get; private set; } = string.Empty;
    public string? CustomerContactPerson { get; private set; }
    public string? CustomerPhone { get; private set; }
    public string? CustomerEmail { get; private set; }
    public string? CustomerAddress { get; private set; }
    public string? CustomerTaxCode { get; private set; }

    public Guid TemplateId { get; private set; }
    public int TemplateVersion { get; private set; }

    public string Status { get; private set; } = "Draft";
    public DateTime IssueDate { get; private set; }
    public DateTime? ValidUntil { get; private set; }

    public decimal SubTotal { get; private set; }
    public decimal DiscountPercent { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public decimal TaxPercent { get; private set; }
    public decimal TaxAmount { get; private set; }
    public decimal TotalAmount { get; private set; }

    public string? Notes { get; private set; }
    public bool ShowDiscount { get; private set; } = true;
    public bool ShowQuantity { get; private set; } = true;
    public bool ShowSubTotal { get; private set; } = true;
    public bool ShowGrandTotal { get; private set; } = true;

    public Guid CreatedByUserId { get; private set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? ModifiedAtUtc { get; set; }

    public IReadOnlyCollection<QuotationItem> Items => _items.AsReadOnly();
    public IReadOnlyCollection<QuotationHistory> Histories => _histories.AsReadOnly();
    public IReadOnlyCollection<QuotationFile> Files => _files.AsReadOnly();

    private Quotation()
    {
    }

    private Quotation(
        Guid id,
        string quotationNumber,
        Guid? customerId,
        string customerName,
        string? customerContactPerson,
        string? customerPhone,
        string? customerEmail,
        string? customerAddress,
        string? customerTaxCode,
        Guid templateId,
        int templateVersion,
        DateTime issueDate,
        DateTime? validUntil,
        decimal discountPercent,
        decimal taxPercent,
        string? notes,
        Guid createdByUserId)
    {
        Id = id;
        QuotationNumber = quotationNumber;
        CustomerId = customerId;
        CustomerName = customerName;
        CustomerContactPerson = customerContactPerson;
        CustomerPhone = customerPhone;
        CustomerEmail = customerEmail;
        CustomerAddress = customerAddress;
        CustomerTaxCode = customerTaxCode;
        TemplateId = templateId;
        TemplateVersion = templateVersion;
        Status = "Draft";
        IssueDate = issueDate;
        ValidUntil = validUntil;
        DiscountPercent = discountPercent;
        TaxPercent = taxPercent;
        Notes = notes;
        CreatedByUserId = createdByUserId;
        IsDeleted = false;
        DeletedAtUtc = null;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public static Quotation Create(
        string quotationNumber,
        Guid? customerId,
        string? customerName,
        string? customerContactPerson,
        string? customerPhone,
        string? customerEmail,
        string? customerAddress,
        string? customerTaxCode,
        Guid templateId,
        int templateVersion,
        DateTime issueDate,
        DateTime? validUntil,
        decimal discountPercent,
        decimal taxPercent,
        string? notes,
        Guid createdByUserId)
    {
        if (string.IsNullOrWhiteSpace(quotationNumber))
        {
            throw new ArgumentException("Quotation number cannot be empty.", nameof(quotationNumber));
        }

        var resolvedCustomerName = string.IsNullOrWhiteSpace(customerName)
            ? (customerId == null ? "QUÝ KHÁCH HÀNG" : throw new ArgumentException("Customer name cannot be empty.", nameof(customerName)))
            : customerName.Trim();

        if (discountPercent < 0 || discountPercent > 100)
        {
            throw new ArgumentException("Discount percent must be between 0 and 100.", nameof(discountPercent));
        }

        if (taxPercent < 0 || taxPercent > 100)
        {
            throw new ArgumentException("Tax percent must be between 0 and 100.", nameof(taxPercent));
        }

        var quotation = new Quotation(
            Guid.NewGuid(),
            quotationNumber.Trim(),
            customerId,
            resolvedCustomerName,
            customerContactPerson?.Trim(),
            customerPhone?.Trim(),
            customerEmail?.Trim(),
            customerAddress?.Trim(),
            customerTaxCode?.Trim(),
            templateId,
            templateVersion,
            issueDate,
            validUntil,
            discountPercent,
            taxPercent,
            notes?.Trim(),
            createdByUserId);

        quotation.AddHistory("Created", $"Báo giá {quotationNumber} được tạo ở trạng thái Bản nháp", null, createdByUserId);
        return quotation;
    }

    public void UpdateDetails(
        Guid? customerId,
        string? customerName,
        string? customerContactPerson,
        string? customerPhone,
        string? customerEmail,
        string? customerAddress,
        string? customerTaxCode,
        DateTime issueDate,
        DateTime? validUntil,
        decimal discountPercent,
        decimal taxPercent,
        string? notes,
        Guid updatedByUserId)
    {
        if (Status != "Draft")
        {
            throw new InvalidOperationException($"Chỉ có thể cập nhật báo giá khi ở trạng thái Draft. Trạng thái hiện tại: {Status}");
        }

        var resolvedCustomerName = string.IsNullOrWhiteSpace(customerName)
            ? (customerId == null ? "QUÝ KHÁCH HÀNG" : throw new ArgumentException("Customer name cannot be empty.", nameof(customerName)))
            : customerName.Trim();

        if (discountPercent < 0 || discountPercent > 100)
        {
            throw new ArgumentException("Discount percent must be between 0 and 100.", nameof(discountPercent));
        }

        if (taxPercent < 0 || taxPercent > 100)
        {
            throw new ArgumentException("Tax percent must be between 0 and 100.", nameof(taxPercent));
        }

        CustomerId = customerId;
        CustomerName = resolvedCustomerName;
        CustomerContactPerson = customerContactPerson?.Trim();
        CustomerPhone = customerPhone?.Trim();
        CustomerEmail = customerEmail?.Trim();
        CustomerAddress = customerAddress?.Trim();
        CustomerTaxCode = customerTaxCode?.Trim();
        IssueDate = issueDate;
        ValidUntil = validUntil;
        DiscountPercent = discountPercent;
        TaxPercent = taxPercent;
        Notes = notes?.Trim();
        ModifiedAtUtc = DateTime.UtcNow;

        RecalculateTotals();
        AddHistory("Updated", "Cập nhật thông tin chi tiết báo giá", null, updatedByUserId);
    }

    public void SetItems(IEnumerable<QuotationItem> items, Guid updatedByUserId)
    {
        if (Status != "Draft")
        {
            throw new InvalidOperationException($"Chỉ có thể cập nhật danh sách sản phẩm khi báo giá ở trạng thái Draft. Trạng thái hiện tại: {Status}");
        }

        _items.Clear();
        _items.AddRange(items);
        RecalculateTotals();
        ModifiedAtUtc = DateTime.UtcNow;
        AddHistory("ItemsUpdated", $"Cập nhật danh sách sản phẩm ({_items.Count} mục)", null, updatedByUserId);
    }

    public Quotation CreateExportSnapshot(decimal taxPercent)
    {
        if (taxPercent < 0 || taxPercent > 100 || decimal.Round(taxPercent, 2) != taxPercent)
            throw new ArgumentOutOfRangeException(nameof(taxPercent));

        // Only scalar totals change; the shared item collection is read-only during rendering.
        var snapshot = (Quotation)MemberwiseClone();
        snapshot.TaxPercent = taxPercent;
        snapshot.RecalculateTotals();
        return snapshot;
    }

    public void SetDisplayOptions(bool showDiscount, bool showQuantity, bool showSubTotal, bool showGrandTotal)
    {
        ShowDiscount = showDiscount;
        ShowQuantity = showQuantity;
        ShowSubTotal = showSubTotal;
        ShowGrandTotal = showGrandTotal;
    }

    public void RecalculateTotals()
    {
        SubTotal = Math.Round(_items.Sum(i => i.TotalAmount), 2, MidpointRounding.AwayFromZero);
        DiscountAmount = Math.Round(SubTotal * (DiscountPercent / 100m), 2, MidpointRounding.AwayFromZero);
        var taxable = Math.Max(0, SubTotal - DiscountAmount);
        TaxAmount = Math.Round(taxable * (TaxPercent / 100m), 2, MidpointRounding.AwayFromZero);
        TotalAmount = Math.Max(0, taxable + TaxAmount);
    }

    public void ChangeStatus(string newStatus, Guid userId, string? reason)
    {
        if (string.IsNullOrWhiteSpace(newStatus))
        {
            throw new ArgumentException("Status cannot be empty.", nameof(newStatus));
        }

        var allowedStatuses = new[] { "Draft", "Sent", "Approved", "Rejected", "Cancelled" };
        var normalizedStatus = allowedStatuses.FirstOrDefault(status => status.Equals(newStatus.Trim(), StringComparison.OrdinalIgnoreCase));
        if (normalizedStatus is null)
        {
            throw new ArgumentException($"Invalid quotation status: {newStatus}. Allowed: {string.Join(", ", allowedStatuses)}");
        }

        var oldStatus = Status;
        if (oldStatus == normalizedStatus) return;
        Status = normalizedStatus;
        ModifiedAtUtc = DateTime.UtcNow;

        var desc = $"Chuyển trạng thái từ {oldStatus} sang {normalizedStatus}" +
                   (!string.IsNullOrWhiteSpace(reason) ? $". Lý do: {reason.Trim()}" : "");
        AddHistory("StatusChanged", desc, null, userId);
    }

    public void AddHistory(string action, string description, string? snapshotJson, Guid userId)
    {
        _histories.Add(QuotationHistory.Create(Id, action, description, snapshotJson, userId));
    }

    public void AddExportedFile(string fileName, string fileType, string fileUrl, long fileSize, string storageProvider, Guid userId)
    {
        var file = QuotationFile.Create(Id, fileName, fileType, fileUrl, fileSize, storageProvider, userId);
        _files.Add(file);
        AddHistory("FileExported", $"Xuất file báo giá {fileName} ({fileType.ToUpperInvariant()}) qua {storageProvider}", null, userId);
    }

    public void Delete()
    {
        IsDeleted = true;
        DeletedAtUtc = DateTime.UtcNow;
    }
}
