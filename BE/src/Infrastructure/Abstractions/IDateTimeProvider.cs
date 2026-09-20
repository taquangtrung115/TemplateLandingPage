namespace TemplateLandingPage.Infrastructure.Abstractions;

public interface IDateTimeProvider
{
    DateTime UtcNow { get; }
}
