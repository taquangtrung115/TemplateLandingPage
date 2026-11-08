namespace TemplateLandingPage.IntegrationTests;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TemplateLandingPage.Application.Abstractions;
using TemplateLandingPage.Infrastructure.Services.Quoting;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using Xunit;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Persistence;

[CollectionDefinition(Name, DisableParallelization = true)]
public sealed class PostgresApiCollection : ICollectionFixture<PostgresApiFixture>
{
    public const string Name = "PostgreSQL API integration";
}

public sealed class PostgresApiFixture : IAsyncLifetime
{
    public const string Issuer = "TemplateLandingPage.IntegrationTests";
    public const string Audience = "TemplateLandingPage.IntegrationTests";
    private readonly string _adminConnectionString;
    private WebApplicationFactory<Program>? _factory;
    private bool _databaseCreated;

    public PostgresApiFixture()
    {
        DatabaseName = $"template_test_{Guid.NewGuid():N}";
        var admin = new NpgsqlConnectionStringBuilder
        {
            Host = Environment.GetEnvironmentVariable("TEMPLATE_TEST_PGHOST") ?? "127.0.0.1",
            Port = int.TryParse(Environment.GetEnvironmentVariable("TEMPLATE_TEST_PGPORT"), out var port) ? port : 55432,
            Username = Environment.GetEnvironmentVariable("TEMPLATE_TEST_PGUSER") ?? "template_test",
            Password = Environment.GetEnvironmentVariable("TEMPLATE_TEST_PGPASSWORD") ?? string.Empty,
            Database = "postgres",
            Pooling = false,
            Timeout = 5,
            CommandTimeout = 30
        };
        _adminConnectionString = admin.ConnectionString;
        var testDatabase = new NpgsqlConnectionStringBuilder(admin.ConnectionString) { Database = DatabaseName };
        ConnectionString = testDatabase.ConnectionString;
        SecretKey = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    }

    public string DatabaseName { get; }
    public string ConnectionString { get; }
    public string SecretKey { get; }

    public async Task InitializeAsync()
    {
        await using (var connection = new NpgsqlConnection(_adminConnectionString))
        {
            await connection.OpenAsync();
            await using var create = new NpgsqlCommand($"CREATE DATABASE {new NpgsqlCommandBuilder().QuoteIdentifier(DatabaseName)}", connection);
            await create.ExecuteNonQueryAsync();
            _databaseCreated = true;
        }

        try
        {
            _factory = new TestApiFactory(ConnectionString, SecretKey);
            using var client = _factory.CreateClient();
            using var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            await db.Database.MigrateAsync();
        }
        catch
        {
            await DropOwnedDatabaseAsync();
            throw;
        }
    }

    public HttpClient CreateClientFor(Guid userId, string claimedRole)
    {
        var client = (_factory ?? throw new InvalidOperationException("Test API has not started.")).CreateClient();
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue(
            "Bearer", CreateToken(userId, claimedRole));
        return client;
    }

    public HttpClient CreateAnonymousClient() => _factory!.CreateClient();

    public async Task<T> WithDatabaseAsync<T>(Func<ApplicationDbContext, Task<T>> action)
    {
        await using var scope = _factory!.Services.CreateAsyncScope();
        return await action(scope.ServiceProvider.GetRequiredService<ApplicationDbContext>());
    }

    public string CreateToken(Guid userId, string claimedRole)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Role, claimedRole)
        };
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SecretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            Issuer,
            Audience,
            claims,
            DateTime.UtcNow.AddMinutes(-1),
            DateTime.UtcNow.AddMinutes(30),
            credentials);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<User> AddUserAsync(string role = "User", bool isActive = true, bool isDeleted = false)
    {
        var user = User.Create($"{Guid.NewGuid():N}@integration.test", "test-hash", "Integration User", role);
        if (!isActive) user.UpdateProfile("Integration User", role, false);
        if (isDeleted) user.Delete();
        await using var scope = _factory!.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Users.Add(user);
        await db.SaveChangesAsync();
        return user;
    }

    public async Task<Template> AddTemplateAsync(Guid? categoryId = null, string? slug = null)
    {
        var template = Template.Create(
            "Integration Template", slug ?? $"integration-template-{Guid.NewGuid():N}", null,
            categoryId, "Integration", "https://example.test/template.png", null, null, null, null, null, "{}");
        await using var scope = _factory!.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Templates.Add(template);
        await db.SaveChangesAsync();
        return template;
    }

    public async Task<UserCustomization> AddOwnerlessCustomizationAsync(Template template, string? slug = null, bool isPublic = false)
    {
        var site = UserCustomization.Create(null, template.Id, "Legacy Ownerless", slug ?? $"ownerless-{Guid.NewGuid():N}", "{}");
        await using var scope = _factory!.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.UserCustomizations.Add(site);
        await db.SaveChangesAsync();

        var requestId = Guid.NewGuid();
        var version = CustomizationVersion.Create(site, requestId, $"hash-{requestId:N}");
        db.CustomizationVersions.Add(version);
        db.CustomizationSlugAliases.Add(CustomizationSlugAlias.Create(site.Id, site.Slug));
        if (isPublic)
        {
            version.Publish();
            site.SetPublication(version.Id);
        }
        await db.SaveChangesAsync();
        return site;
    }

    public async Task ChangeUserAsync(Guid userId, string role, bool isActive)
    {
        await using var scope = _factory!.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var user = await db.Users.SingleAsync(x => x.Id == userId);
        user.UpdateProfile(user.FullName, role, isActive);
        await db.SaveChangesAsync();
    }

    public async Task SetUserDeletedAsync(Guid userId)
    {
        await using var scope = _factory!.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var user = await db.Users.SingleAsync(x => x.Id == userId);
        user.Delete();
        await db.SaveChangesAsync();
    }

    public async Task DisposeAsync()
    {
        _factory?.Dispose();
        await DropOwnedDatabaseAsync();
    }

    private async Task DropOwnedDatabaseAsync()
    {
        if (!_databaseCreated) return;
        NpgsqlConnection.ClearAllPools();
        await using var connection = new NpgsqlConnection(_adminConnectionString);
        await connection.OpenAsync();
        await using (var terminate = new NpgsqlCommand(
            "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = @database AND pid <> pg_backend_pid()", connection))
        {
            terminate.Parameters.AddWithValue("database", DatabaseName);
            await terminate.ExecuteNonQueryAsync();
        }
        await using var drop = new NpgsqlCommand($"DROP DATABASE {new NpgsqlCommandBuilder().QuoteIdentifier(DatabaseName)}", connection);
        await drop.ExecuteNonQueryAsync();
        _databaseCreated = false;
    }

    private sealed class TestApiFactory(string connectionString, string secretKey) : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Development");
            // Program validates startup settings before WebApplicationFactory applies late configuration.
            // Override the test key, preserving the production JWT handler and account/role validation.
            builder.ConfigureTestServices(services => services.PostConfigure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
            {
                options.TokenValidationParameters.IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
                options.TokenValidationParameters.ValidIssuer = Issuer;
                options.TokenValidationParameters.ValidAudience = Audience;
            }));
            builder.ConfigureTestServices(services => services.AddHttpClient<IQuotingProductImageService, SupabaseProductImageService>()
                .ConfigurePrimaryHttpMessageHandler(() => new FakeSupabaseImageHandler()));
            builder.ConfigureAppConfiguration((_, configuration) => configuration.AddInMemoryCollection(
                new Dictionary<string, string?>
                {
                    ["ConnectionStrings:DefaultConnection"] = connectionString,
                    ["Jwt:SecretKey"] = secretKey,
                    ["Jwt:Issuer"] = Issuer,
                    ["Jwt:Audience"] = Audience,
                    ["SeedData:Enabled"] = "false",
                    ["Quoting:Images:SupabaseUrl"] = "https://storage.integration.test",
                    ["Quoting:Images:SecretKey"] = "synthetic-image-key",
                    ["Quoting:Images:ServiceRoleKey"] = "synthetic-image-key",
                    ["Supabase:Url"] = "",
                    ["Supabase:ServiceRoleKey"] = "",
                    ["Supabase:Key"] = "",
                    ["SupabaseStorage:Url"] = "",
                    ["SupabaseStorage:ServiceRoleKey"] = "",
                    ["Quoting:Storage:LocalPath"] = Path.Combine(AppContext.BaseDirectory, "quoting-test-files", new NpgsqlConnectionStringBuilder(connectionString).Database!)
                }));
        }
    }
}

public static class ApiTestJson
{
    public static Task<HttpResponseMessage> SendJsonAsync(HttpClient client, HttpMethod method, string uri, object value) =>
        client.SendAsync(new HttpRequestMessage(method, uri) { Content = Json(value) });

    public static string StringValue(System.Text.Json.JsonElement root, params string[] path)
    {
        foreach (var segment in path) root = root.GetProperty(segment);
        return root.GetString()!;
    }
    public static readonly System.Text.Json.JsonSerializerOptions Options = new(System.Text.Json.JsonSerializerDefaults.Web);

    public static System.Net.Http.Json.JsonContent Json(object value) => System.Net.Http.Json.JsonContent.Create(value, options: Options);

    public static async Task<System.Text.Json.JsonDocument> ReadAsync(HttpResponseMessage response) =>
        System.Text.Json.JsonDocument.Parse(await response.Content.ReadAsStringAsync());

    public static Guid GuidValue(System.Text.Json.JsonElement root, params string[] path)
    {
        foreach (var segment in path) root = root.GetProperty(segment);
        return root.GetGuid();
    }

    public static int IntValue(System.Text.Json.JsonElement root, params string[] path)
    {
        foreach (var segment in path) root = root.GetProperty(segment);
        return root.GetInt32();
    }
}
