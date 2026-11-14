namespace OnePortal.Persistence.Data;

using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using OnePortal.Domain.Entities;

public static class TemplateCatalogSeeder
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public static IReadOnlyList<CatalogCategoryDefinition> ReadDefinitions() =>
        ReadResource<CatalogCategoryDefinition>("TemplateCatalog.json");

    public static IReadOnlyList<CatalogStyleDefinition> ReadStyles() =>
        ReadResource<CatalogStyleDefinition>("TemplateCatalogStyles.json");

    private static T[] ReadResource<T>(string name)
    {
        using var stream = typeof(TemplateCatalogSeeder).Assembly.GetManifestResourceStream(
            $"OnePortal.Persistence.Data.{name}") ?? throw new InvalidOperationException($"Missing catalog resource: {name}");
        return JsonSerializer.Deserialize<T[]>(stream, JsonOptions) ?? throw new InvalidOperationException($"Invalid catalog: {name}");
    }

    public static async Task<CatalogSeedResult> SeedAsync(ApplicationDbContext context, CancellationToken cancellationToken = default)
    {
        var definitions = ReadDefinitions();
        var styles = ReadStyles();
        // Include removed rows so seeding never resurrects an administrator's removal or overwrites edited templates.
        var categories = await context.Categories.IgnoreQueryFilters().Where(entity => entity.TenantId == context.CurrentTenantId).AsNoTracking()
            .Select(c => new { c.Id, c.Slug, c.IsDeleted }).ToDictionaryAsync(c => c.Slug, cancellationToken);
        var existingSlugs = (await context.Templates.IgnoreQueryFilters().Where(entity => entity.TenantId == context.CurrentTenantId).AsNoTracking()
            .Select(t => t.Slug).ToListAsync(cancellationToken)).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var categoriesAdded = 0;
        var templatesAdded = 0;
        var preserved = 0;
        foreach (var definition in definitions)
        {
            if (definition.Concepts.Length < 15)
                throw new InvalidOperationException($"Category {definition.Slug} must define at least 15 templates.");
            Guid categoryId;
            if (categories.TryGetValue(definition.Slug, out var existing))
            {
                if (existing.IsDeleted) { preserved += definition.Concepts.Length; continue; }
                categoryId = existing.Id;
            }
            else
            {
                var category = Category.Create(definition.Name, definition.Slug,
                    $"Bộ sưu tập {definition.Name.ToLowerInvariant()}", definition.Icon, categories.Count + categoriesAdded);
                context.Categories.Add(category);
                categoryId = category.Id;
                categoriesAdded++;
            }

            for (var index = 0; index < definition.Concepts.Length; index++)
            {
                var slug = $"catalog-{definition.Slug}-{index + 1:00}";
                if (!existingSlugs.Add(slug)) { preserved++; continue; }
                var concept = definition.Concepts[index];
                var image = $"/catalog-previews/{slug}.svg";
                context.Templates.Add(Template.Create(
                    $"{definition.Name} · {concept}", slug,
                    $"{concept}. {definition.Subtitle}. Nội dung minh họa có thể chỉnh sửa.",
                    categoryId, definition.Name, image, null, null, null, null, null,
                    TemplateCatalogConfigBuilder.Build(definition, styles[index % styles.Count], concept, image, index)));
                templatesAdded++;
            }
        }

        await context.SaveChangesAsync(cancellationToken);
        return new CatalogSeedResult(categoriesAdded, templatesAdded, preserved);
    }
}
