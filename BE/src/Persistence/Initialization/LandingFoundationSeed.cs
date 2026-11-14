namespace OnePortal.Persistence.Initialization;

using Microsoft.EntityFrameworkCore;
using OnePortal.Domain.Entities;

public sealed class LandingFoundationSeed : ITenantSeedStep
{
    public string AppKey => "landing";
    public string Key => "foundation";
    public int Version => 1;

    public async Task ApplyAsync(ApplicationDbContext context, string tenantName, CancellationToken cancellationToken)
    {
        #region Missing defaults
        var category = await context.Categories.IgnoreQueryFilters().FirstOrDefaultAsync(category => category.TenantId == context.CurrentTenantId && category.Slug == "general", cancellationToken);
        if (category is null)
        {
            category = Category.Create("General", "general", "Workspace templates", "Layout", 0);
            context.Categories.Add(category);
        }
        if (!category.IsDeleted && !await context.Templates.IgnoreQueryFilters().AnyAsync(template => template.TenantId == context.CurrentTenantId && template.Slug == "workspace-starter", cancellationToken))
            context.Templates.Add(Template.Create("Workspace starter", "workspace-starter", "A starter page for this workspace", category.Id, "General",
                "/catalog-previews/catalog-wedding-01-cover.svg", null, null, null, null, null, "{\"couple\":{\"groom\":\"\",\"bride\":\"\"}}"));
        if (!await context.NavigationMenus.IgnoreQueryFilters().AnyAsync(menu => menu.TenantId == context.CurrentTenantId, cancellationToken))
            context.NavigationMenus.Add(NavigationMenu.Create("Templates", "/templates", null, 0));
        #endregion
    }
}
