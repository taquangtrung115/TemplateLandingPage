namespace TemplateLandingPage.Persistence.Data;

using Microsoft.EntityFrameworkCore;
using TemplateLandingPage.Domain.Entities;

internal static class DemoVersionInitializer
{
    public static async Task InitializeAsync(ApplicationDbContext context)
    {
        var sites = await context.UserCustomizations.Where(site => site.LastVersionNumber == 0).ToListAsync();
        if (sites.Count == 0) return;
        var aliases = (await context.CustomizationSlugAliases.AsNoTracking().Select(a => a.Slug).ToListAsync()).ToHashSet();
        var snapshots = sites.ToDictionary(site => site.Id,
            site => CustomizationVersion.Create(site, Guid.NewGuid(), "development-seed"));
        foreach (var site in sites)
        {
            var version = snapshots[site.Id];
            if (site.IsPublished) version.Publish();
            context.CustomizationVersions.Add(version);
            if (aliases.Add(site.Slug))
                context.CustomizationSlugAliases.Add(CustomizationSlugAlias.Create(site.Id, site.Slug));
        }
        // Insert snapshots before setting the circular main-version reference.
        await context.SaveChangesAsync();
        foreach (var site in sites)
            if (snapshots[site.Id].IsPublic) site.SetPublication(snapshots[site.Id].Id);
        // List.Contains keeps an EF-translatable expression rather than a span-based array overload.
        var ids = snapshots.Keys.ToList();
        var rsvps = await context.RsvpEntries.Where(r => r.CustomizationVersionId == null &&
            r.CustomizationId.HasValue && ids.Contains(r.CustomizationId.Value)).ToListAsync();
        foreach (var response in rsvps)
            context.Entry(response).Property(r => r.CustomizationVersionId).CurrentValue = snapshots[response.CustomizationId!.Value].Id;
        var wishes = await context.GuestbookEntries.Where(r => r.CustomizationVersionId == null &&
            r.CustomizationId.HasValue && ids.Contains(r.CustomizationId.Value)).ToListAsync();
        foreach (var response in wishes)
            context.Entry(response).Property(r => r.CustomizationVersionId).CurrentValue = snapshots[response.CustomizationId!.Value].Id;
        await context.SaveChangesAsync();
    }
}
