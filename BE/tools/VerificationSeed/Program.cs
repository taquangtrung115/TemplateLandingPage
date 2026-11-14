using Microsoft.EntityFrameworkCore;
using Npgsql;
using OnePortal.Application.Services.Tenancy;
using OnePortal.Domain.Entities;
using OnePortal.Domain.Entities.Tenancy;
using OnePortal.Infrastructure.Services;
using OnePortal.Persistence;
using OnePortal.Persistence.Initialization;

#region Disposable database guard
// This tool can only operate on the fixed disposable database on loopback.
var connectionString = Environment.GetEnvironmentVariable("ONEPORTAL_E2E_CONNECTION_STRING")
    ?? "Host=127.0.0.1;Port=55432;Username=template_test;Database=oneportal_e2e";
var settings = new NpgsqlConnectionStringBuilder(connectionString);
if (settings.Host is not ("localhost" or "127.0.0.1" or "::1") || settings.Database != "oneportal_e2e")
    throw new InvalidOperationException("Verification setup requires loopback PostgreSQL and Database=oneportal_e2e.");

#endregion

#region Schema and foundation
var adminSettings = new NpgsqlConnectionStringBuilder(connectionString) { Database = "postgres", Pooling = false };
await using (var connection = new NpgsqlConnection(adminSettings.ConnectionString))
{
    await connection.OpenAsync();
    if (args.Contains("--reset", StringComparer.Ordinal))
    {
        await using var drop = new NpgsqlCommand("DROP DATABASE IF EXISTS oneportal_e2e WITH (FORCE)", connection);
        await drop.ExecuteNonQueryAsync();
    }
    await using var lookup = new NpgsqlCommand("SELECT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'oneportal_e2e')", connection);
    if (!(bool)(await lookup.ExecuteScalarAsync())!)
    {
        await using var create = new NpgsqlCommand("CREATE DATABASE oneportal_e2e TEMPLATE template0", connection);
        await create.ExecuteNonQueryAsync();
    }
}

var options = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(connectionString).Options;
await using var database = new ApplicationDbContext(options);
await DatabaseInitializer.InitializeAsync(database);
await DatabaseInitializer.SeedAsync(database);
#endregion

#region Synthetic identity
var user = await database.Users.SingleOrDefaultAsync(account => account.Email == "platform@oneportal.test");
if (user is null)
{
    user = User.Create("platform@oneportal.test", new PasswordHasher().HashPassword("Synthetic-password-123!"), "Platform E2E", "User");
    database.Users.Add(user);
}
user.SetPlatformAdmin(true);
await database.SaveChangesAsync();
foreach (var app in new[] { (TenantDefaults.LandingId, "landing"), (TenantDefaults.QuotingId, "quoting") })
{
    await using var scoped = new ApplicationDbContext(options, TenantContext.For(app.Item1, app.Item2));
    if (!await scoped.TenantMemberships.AnyAsync(membership => membership.UserId == user.Id))
    {
        scoped.TenantMemberships.Add(TenantMembership.Create(app.Item1, user.Id, app.Item2, "Admin"));
        await scoped.SaveChangesAsync();
    }
}
Console.WriteLine("Disposable E2E schema, foundation data and synthetic identity are ready.");

#endregion
