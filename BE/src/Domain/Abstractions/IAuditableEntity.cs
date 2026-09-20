namespace TemplateLandingPage.Domain.Abstractions;

public interface IAuditableEntity
{
    DateTime CreatedAtUtc { get; set; }
    DateTime? ModifiedAtUtc { get; set; }
}
