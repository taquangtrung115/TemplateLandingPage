namespace TemplateLandingPage.Persistence.Data;

public sealed record CatalogCategoryDefinition(string Slug, string Name, string Icon, string Format,
    string Title, string Subtitle, string[] Concepts);
