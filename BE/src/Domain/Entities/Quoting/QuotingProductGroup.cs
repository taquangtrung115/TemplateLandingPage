namespace TemplateLandingPage.Domain.Entities.Quoting;

using TemplateLandingPage.Domain.Abstractions;

public sealed class QuotingProductGroup : AggregateRoot<Guid>, IAuditableEntity, ISoftDelete
{
    #region Properties
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public int SortOrder { get; private set; }
    public bool IsActive { get; private set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? ModifiedAtUtc { get; set; }
    #endregion

    #region Commands
    private QuotingProductGroup() { }

    public static QuotingProductGroup Create(string code, string name, string? description, int sortOrder, bool isActive = true)
    {
        var group = new QuotingProductGroup { Id = Guid.NewGuid(), CreatedAtUtc = DateTime.UtcNow };
        group.Update(code, name, description, sortOrder, isActive);
        return group;
    }

    public void Update(string code, string name, string? description, int sortOrder, bool isActive)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(code);
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        ArgumentOutOfRangeException.ThrowIfNegative(sortOrder);
        Code = code.Trim().ToUpperInvariant();
        Name = name.Trim();
        Description = description?.Trim();
        SortOrder = sortOrder;
        IsActive = isActive;
        ModifiedAtUtc = DateTime.UtcNow;
    }

    public void Delete()
    {
        IsDeleted = true;
        DeletedAtUtc = DateTime.UtcNow;
    }
    #endregion
}
