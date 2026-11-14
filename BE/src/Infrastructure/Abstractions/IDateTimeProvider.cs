namespace OnePortal.Infrastructure.Abstractions;

public interface IDateTimeProvider
{
    DateTime UtcNow { get; }
}
