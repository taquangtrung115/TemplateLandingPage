namespace TemplateLandingPage.Domain.Entities;

using TemplateLandingPage.Domain.Abstractions;

public sealed class CustomizationSlugAlias : Entity<Guid>
{
    public Guid CustomizationId { get; private set; }
    public string Slug { get; private set; } = string.Empty;
    public DateTime CreatedAtUtc { get; private set; }

    private CustomizationSlugAlias() { }

    public static CustomizationSlugAlias Create(Guid customizationId, string slug) => new()
    {
        Id = Guid.NewGuid(), CustomizationId = customizationId,
        Slug = slug.Trim().ToLowerInvariant(), CreatedAtUtc = DateTime.UtcNow
    };
}
