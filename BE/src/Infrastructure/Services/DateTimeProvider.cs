namespace OnePortal.Infrastructure.Services;

using OnePortal.Infrastructure.Abstractions;

public sealed class DateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}
