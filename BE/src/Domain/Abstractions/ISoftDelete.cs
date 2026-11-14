namespace OnePortal.Domain.Abstractions;

public interface ISoftDelete
{
    bool IsDeleted { get; set; }
    DateTime? DeletedAtUtc { get; set; }
}
