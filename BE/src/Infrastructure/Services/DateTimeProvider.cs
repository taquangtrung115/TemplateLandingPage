namespace TemplateLandingPage.Infrastructure.Services;

using TemplateLandingPage.Infrastructure.Abstractions;

public sealed class DateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}
