using Microsoft.EntityFrameworkCore;
using TemplateLandingPage.Persistence;
using TemplateLandingPage.Persistence.Data;

var definitions = TemplateCatalogSeeder.ReadDefinitions();
Console.WriteLine($"Catalog: {definitions.Count} categories, {definitions.Sum(c => c.Concepts.Length)} templates.");
if (!args.Contains("--apply"))
{
    Console.WriteLine("Preview only. Set TEMPLATE_SEED_CONNECTION_STRING and pass --apply to insert missing catalog data.");
    return;
}

var connectionString = Environment.GetEnvironmentVariable("TEMPLATE_SEED_CONNECTION_STRING");
if (string.IsNullOrWhiteSpace(connectionString))
    throw new InvalidOperationException("TEMPLATE_SEED_CONNECTION_STRING must be supplied explicitly. No appsettings fallback is used.");
await using var context = new ApplicationDbContext(
    new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(connectionString).Options);
if (args.Contains("--migrate"))
    await context.Database.MigrateAsync();
else if ((await context.Database.GetPendingMigrationsAsync()).Any())
    throw new InvalidOperationException("Pending schema migrations. Apply them separately or pass --migrate explicitly.");
var result = await TemplateCatalogSeeder.SeedAsync(context);
Console.WriteLine($"Added {result.CategoriesAdded} categories, {result.TemplatesAdded} templates; preserved {result.TemplatesPreserved} existing entries.");
