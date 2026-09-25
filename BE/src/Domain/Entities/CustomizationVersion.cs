namespace TemplateLandingPage.Domain.Entities;

using TemplateLandingPage.Domain.Abstractions;

public sealed class CustomizationVersion : Entity<Guid>
{
    public Guid CustomizationId { get; private set; }
    public int VersionNumber { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string ConfigJson { get; private set; } = string.Empty;
    public DateTime CreatedAtUtc { get; private set; }
    public bool IsPublic { get; private set; }
    public DateTime? PublishedAtUtc { get; private set; }
    public Guid RequestId { get; private set; }
    public string RequestHash { get; private set; } = string.Empty;
    public int SourceRevision { get; private set; }

    private CustomizationVersion() { }

    public static CustomizationVersion Create(UserCustomization customization, Guid requestId, string requestHash) => new()
    {
        Id = Guid.NewGuid(), CustomizationId = customization.Id,
        VersionNumber = customization.AllocateVersionNumber(), Title = customization.Title,
        ConfigJson = customization.ConfigJson, CreatedAtUtc = DateTime.UtcNow,
        RequestId = requestId, RequestHash = requestHash, SourceRevision = customization.Revision
    };

    public void Publish()
    {
        IsPublic = true;
        PublishedAtUtc ??= DateTime.UtcNow;
    }

    public void Unpublish() => IsPublic = false;
}
