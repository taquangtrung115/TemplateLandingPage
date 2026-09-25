namespace TemplateLandingPage.Application.UseCases.V1.Customizations.Helpers;

using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using TemplateLandingPage.Application.Common.Validation;
using TemplateLandingPage.Contract.Abstractions.Shared;
using TemplateLandingPage.Contract.Services.V1.Customizations;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.ReadModels;
using TemplateLandingPage.Domain.Repositories;

internal static class CustomizationRules
{
    public static bool CanAccess(UserCustomization site, Guid? userId, string? role) =>
        userId.HasValue && userId != Guid.Empty && (role == "Admin" || (site.UserId.HasValue && site.UserId == userId));

    public static bool CanAccess(CustomizationAccess site, Guid? userId, string? role) =>
        userId.HasValue && userId != Guid.Empty && (role == "Admin" || (site.UserId.HasValue && site.UserId == userId));

    public static bool IsValidConfig(string? config) => LandingPageConfigRules.IsValid(config);

    public static bool IsValidSlug(string? slug) => !string.IsNullOrWhiteSpace(slug) &&
        slug.Trim().Length <= 200 && Regex.IsMatch(slug.Trim().ToLowerInvariant(), "^[a-z0-9]+(?:-[a-z0-9]+)*$");

    public static bool IsValidDraft(string? title, string? slug, string? config) =>
        !string.IsNullOrWhiteSpace(title) && title.Trim().Length <= 200 && IsValidSlug(slug) && IsValidConfig(config);

    public static string Hash(string title, string slug, string config) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(new[] { title.Trim(), slug.Trim().ToLowerInvariant(), config }))));

    public static async Task<Error?> ReserveSlugAsync(ICustomizationRepository repository, Guid siteId, string slug, CancellationToken ct)
    {
        var owner = await repository.FindSlugOwnerAsync(slug, ct);
        if (owner.HasValue && owner != siteId) return CustomizationErrors.DuplicateSlug;
        if (!owner.HasValue) repository.AddAlias(CustomizationSlugAlias.Create(siteId, slug));
        return null;
    }

    public static CustomizationSummaryResponse Summary(CustomizationSummary item) => new(item.Id, item.UserId,
        item.TemplateId, item.TemplateName, item.Title, item.Slug, item.Revision, item.LastVersionNumber,
        item.PublishedVersionId, item.CreatedAtUtc);

    public static string VersionUrl(string slug, int number) => $"/p/{Uri.EscapeDataString(slug)}/v/{number}";
}
