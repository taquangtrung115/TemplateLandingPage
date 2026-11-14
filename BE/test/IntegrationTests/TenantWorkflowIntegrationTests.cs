namespace OnePortal.IntegrationTests;

using System.Net;
using System.Text.Json;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using OnePortal.Domain.Entities.Quoting;
using OnePortal.Application.Services.Tenancy;
using OnePortal.Persistence;
using Xunit;

[Collection(PostgresApiCollection.Name)]
public sealed class TenantWorkflowIntegrationTests(PostgresApiFixture fixture)
{
    #region Full workflows
    [Fact]
    public async Task Store_ProvisionsAndDescribesANewTenant()
    {
        var owner = await fixture.AddUserAsync("User", isPlatformAdmin: true);
        await fixture.WithDatabaseAsync(async database =>
        {
            var store = new OnePortal.Persistence.Repositories.Tenancy.TenantStore(database);
            var result = await store.CreateAsync("direct-" + Guid.NewGuid().ToString("N"), "Direct tenant", ["quoting"], owner.Email, default);
            result.IsSuccess.Should().BeTrue(); result.Value.Applications.Should().ContainSingle(application => application.ProvisioningStatus == "Ready");
            return true;
        });
    }
    [Fact]
    public async Task TwoCompanies_KeepProductsAndRolesIsolated_EvenWithForgedRoleAndTenantHeaders()
    {
        var owner = await fixture.AddUserAsync("User", isPlatformAdmin: true);
        using var client = fixture.CreateClientFor(owner.Id, "Admin");
        var a = await CreateAsync(client, owner.Email, "quoting"); var b = await CreateAsync(client, owner.Email, "quoting");
        var rootA = Root(a, "quoting"); var rootB = Root(b, "quoting");
        using var empty = await client.GetAsync(rootA + "/products"); empty.EnsureSuccessStatusCode();
        (await ValueAsync(empty)).GetArrayLength().Should().Be(0);
        var idA = await ProductAsync(client, rootA, "SHARED-CODE", "Only A");
        await ProductAsync(client, rootB, "SHARED-CODE", "Only B");
        using var cross = await client.GetAsync(rootB + "/products/" + idA); cross.StatusCode.Should().Be(HttpStatusCode.NotFound);
        using var downgrade = await ApiTestJson.SendJsonAsync(client, HttpMethod.Put,
            $"/api/v1/platform/tenants/{b.Id}/applications/quoting/members", new { email = owner.Email, role = "User", isActive = true });
        // Add a second administrator before changing the initial administrator's role.
        downgrade.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var anotherAdmin = await fixture.AddUserAsync();
        using var grant = await ApiTestJson.SendJsonAsync(client, HttpMethod.Put,
            $"/api/v1/platform/tenants/{b.Id}/applications/quoting/members", new { email = anotherAdmin.Email, role = "Admin", isActive = true }); grant.EnsureSuccessStatusCode();
        using var changed = await ApiTestJson.SendJsonAsync(client, HttpMethod.Put,
            $"/api/v1/platform/tenants/{b.Id}/applications/quoting/members", new { email = owner.Email, role = "User", isActive = true }); changed.EnsureSuccessStatusCode();
        client.DefaultRequestHeaders.Add("X-Tenant-Id", a.Id.ToString());
        client.DefaultRequestHeaders.Add("X-Role", "Admin");
        using var denied = await ApiTestJson.SendJsonAsync(client, HttpMethod.Post, rootB + "/products", Product("FORGED", "Denied"));
        denied.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        using var stillAdmin = await ApiTestJson.SendJsonAsync(client, HttpMethod.Post, rootA + "/products", Product("ALLOWED", "A admin"));
        stillAdmin.StatusCode.Should().Be(HttpStatusCode.Created);
        using var contexts = await client.GetAsync("/api/v1/auth/contexts?appKey=quoting"); contexts.EnsureSuccessStatusCode();
        var memberships = (await ValueAsync(contexts)).GetProperty("items").EnumerateArray().ToArray();
        memberships.Single(item => item.GetProperty("tenantId").GetGuid() == b.Id).GetProperty("role").GetString().Should().Be("User");
    }

    [Fact]
    public async Task Provisioning_IsIdempotent_PreservesEdits_AndDoesNotCopyLegacyCompanyCatalog()
    {
        var owner = await fixture.AddUserAsync("User", isPlatformAdmin: true); using var client = fixture.CreateClientFor(owner.Id, "User");
        var tenant = await CreateAsync(client, owner.Email, "quoting"); var root = Root(tenant, "quoting");
        using var templates = await client.GetAsync(root + "/templates"); templates.EnsureSuccessStatusCode();
        var original = (await ValueAsync(templates)).EnumerateArray().Single(); var id = original.GetProperty("id").GetGuid();
        using var edit = await ApiTestJson.SendJsonAsync(client, HttpMethod.Put, root + "/templates/" + id, new { name = "Tenant custom template", description = "Keep", isActive = false }); edit.EnsureSuccessStatusCode();
        foreach (var unused in Enumerable.Range(0, 2))
        {
            using var retry = await ApiTestJson.SendJsonAsync(client, HttpMethod.Put, $"/api/v1/platform/tenants/{tenant.Id}/applications/quoting", new { isEnabled = true, allowSelfRegistration = true }); retry.EnsureSuccessStatusCode();
        }
        using var products = await client.GetAsync(root + "/products"); (await ValueAsync(products)).GetArrayLength().Should().Be(0);
        await fixture.WithTenantDatabaseAsync(tenant.Id, "quoting", async database =>
        {
            var saved = await database.QuotationTemplates.SingleAsync(template => template.Id == id);
            saved.Name.Should().Be("Tenant custom template"); saved.IsActive.Should().BeFalse();
            (await database.TenantSeedHistory.CountAsync()).Should().Be(1);
            (await database.TenantApplications.SingleAsync()).AllowSelfRegistration.Should().BeTrue(); return true;
        });
        using var enableLanding = await ApiTestJson.SendJsonAsync(client, HttpMethod.Put, $"/api/v1/platform/tenants/{tenant.Id}/applications/landing", new { isEnabled = true, allowSelfRegistration = false }); enableLanding.EnsureSuccessStatusCode();
        using var publicTemplates = await fixture.CreateAnonymousClient().GetAsync(Root(tenant, "landing") + "/templates");
        publicTemplates.EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task Signup_GrantsOnlyTheOpenLandingWorkspace_AndDisabledWorkspacesRejectRequests()
    {
        var owner = await fixture.AddUserAsync("User", isPlatformAdmin: true); using var client = fixture.CreateClientFor(owner.Id, "User");
        var tenant = await CreateAsync(client, owner.Email, "landing", "quoting"); using var anonymous = fixture.CreateAnonymousClient();
        var email = $"signup-{Guid.NewGuid():N}@tenant.test";
        var registration = new { email, password = "Synthetic-password-123!", fullName = "Signup User" };
        using var closed = await ApiTestJson.SendJsonAsync(anonymous, HttpMethod.Post, Root(tenant, "landing") + "/auth/register", registration);
        closed.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        using var open = await ApiTestJson.SendJsonAsync(client, HttpMethod.Put, $"/api/v1/platform/tenants/{tenant.Id}/applications/landing", new { isEnabled = true, allowSelfRegistration = true }); open.EnsureSuccessStatusCode();
        using var registered = await ApiTestJson.SendJsonAsync(anonymous, HttpMethod.Post, Root(tenant, "landing") + "/auth/register", registration); registered.EnsureSuccessStatusCode();
        var userId = (await ValueAsync(registered)).GetGuid(); using var user = fixture.CreateClientFor(userId, "Admin");
        using var contexts = await user.GetAsync("/api/v1/auth/contexts?appKey=quoting");
        (await ValueAsync(contexts)).GetProperty("items").GetArrayLength().Should().Be(0);
        using var unavailable = await user.GetAsync(Root(tenant, "quoting") + "/products"); unavailable.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        using var disable = await ApiTestJson.SendJsonAsync(client, HttpMethod.Put, $"/api/v1/platform/tenants/{tenant.Id}", new { name = "Disabled", isActive = false }); disable.EnsureSuccessStatusCode();
        using var stopped = await anonymous.GetAsync(Root(tenant, "landing") + "/templates"); stopped.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task DatabaseForeignKeys_RejectAnotherTenantsProductGroup()
    {
        var owner = await fixture.AddUserAsync("User", isPlatformAdmin: true); using var client = fixture.CreateClientFor(owner.Id, "User");
        var a = await CreateAsync(client, owner.Email, "quoting"); var b = await CreateAsync(client, owner.Email, "quoting");
        var group = QuotingProductGroup.Create("GROUP", "A", null, 0);
        await fixture.WithTenantDatabaseAsync(a.Id, "quoting", async database => { database.QuotingProductGroups.Add(group); await database.SaveChangesAsync(); return true; });
        await fixture.WithTenantDatabaseAsync(b.Id, "quoting", async database =>
        {
            var product = QuotingProduct.Create("CROSS", "Cross", null, "Unit", 1, null, null); product.AssignGroup(group); database.QuotingProducts.Add(product);
            await ((Func<Task>)(() => database.SaveChangesAsync())).Should().ThrowAsync<DbUpdateException>(); return true;
        });
    }
    [Fact]
    public async Task SeedFailure_RollsBackPartialRows_AndRetryCompletesExactlyOnce()
    {
        var owner = await fixture.AddUserAsync("User", isPlatformAdmin: true);
        using var client = fixture.CreateClientFor(owner.Id, "User");
        var tenant = await CreateAsync(client, owner.Email, "landing");
        await fixture.WithTenantDatabaseAsync(tenant.Id, "landing", async database =>
        {
            await ((Func<Task>)(() => OnePortal.Persistence.Initialization.DatabaseInitializer.ProvisionAsync(database,
                seedSteps: [new FailedTenantSeedStep()]))).Should().ThrowAsync<InvalidOperationException>();
            database.ChangeTracker.Clear();
            (await database.Categories.AnyAsync(category => category.Slug == "partial-seed")).Should().BeFalse();
            (await database.TenantSeedHistory.CountAsync()).Should().Be(1);
            (await database.TenantApplications.SingleAsync()).ProvisioningStatus.Should().Be("Failed");
            await OnePortal.Persistence.Initialization.DatabaseInitializer.ProvisionAsync(database);
            database.ChangeTracker.Clear();
            (await database.TenantApplications.SingleAsync()).ProvisioningStatus.Should().Be("Ready");
            (await database.TenantSeedHistory.CountAsync()).Should().Be(1);
            return true;
        });
    }

    [Fact]
    public async Task ConcurrentInitializationAndBootstrap_AreIdempotent_AndDoNotRegrantRevokedPrivilege()
    {
        var owner = await fixture.AddUserAsync();
        await fixture.WithDatabaseAsync(async database =>
        {
            var options = database.GetOptions();
            async Task InitializeAsync()
            {
                await using var context = new ApplicationDbContext(options);
                await OnePortal.Persistence.Initialization.DatabaseInitializer.InitializeAsync(context);
                var configuration = new Microsoft.Extensions.Configuration.ConfigurationBuilder().AddInMemoryCollection(
                    new Dictionary<string, string?> { ["Tenancy:BootstrapPlatformAdminUserId"] = owner.Id.ToString() }).Build();
                await OnePortal.Persistence.Initialization.DatabaseInitializer.BootstrapAdministratorAsync(context, configuration);
            }
            await Task.WhenAll(InitializeAsync(), InitializeAsync());
            var saved = await database.Users.SingleAsync(user => user.Id == owner.Id);
            saved.IsPlatformAdmin.Should().BeTrue();
            saved.SetPlatformAdmin(false); await database.SaveChangesAsync();
            await InitializeAsync(); database.ChangeTracker.Clear();
            (await database.Users.SingleAsync(user => user.Id == owner.Id)).IsPlatformAdmin.Should().BeFalse();
            return true;
        });
    }

    [Fact]
    public async Task OwnerAssignment_RequiresAnActiveMembershipInTheCurrentTenant()
    {
        var owner = await fixture.AddUserAsync("User", isPlatformAdmin: true);
        var foreignUser = await fixture.AddUserAsync();
        using var client = fixture.CreateClientFor(owner.Id, "User");
        var tenant = await CreateAsync(client, owner.Email, "landing");
        await fixture.WithTenantDatabaseAsync(tenant.Id, "landing", async database =>
        {
            var repository = new OnePortal.Persistence.Repositories.UserRepository(database);
            (await repository.GetActiveByIdAsync(foreignUser.Id)).Should().BeNull();
            (await repository.GetActiveByIdAsync(owner.Id)).Should().NotBeNull();
            return true;
        });
    }
    [Fact]
    public async Task UploadedImage_IsStoredAndResolvedOnlyInsideItsOwningWorkspace()
    {
        var owner = await fixture.AddUserAsync("User", isPlatformAdmin: true);
        using var client = fixture.CreateClientFor(owner.Id, "User");
        var a = await CreateAsync(client, owner.Email, "quoting");
        var b = await CreateAsync(client, owner.Email, "quoting");
        using var bitmap = new SkiaSharp.SKBitmap(4, 4);
        bitmap.Erase(SkiaSharp.SKColors.Blue);
        using var image = SkiaSharp.SKImage.FromBitmap(bitmap);
        using var data = image.Encode(SkiaSharp.SKEncodedImageFormat.Png, 100);
        using var content = new MultipartFormDataContent();
        using var file = new ByteArrayContent(data.ToArray());
        file.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/png");
        content.Add(file, "file", "sample.png");
        using var upload = await client.PostAsync(Root(a, "quoting") + "/products/images", content);
        upload.StatusCode.Should().Be(HttpStatusCode.Created);
        var address = (await ValueAsync(upload)).GetProperty("image").GetProperty("imageUrl").GetString()!;
        address.Should().StartWith(Root(a, "quoting") + "/product-images/uploads/");
        using var anonymous = fixture.CreateAnonymousClient();
        using var own = await anonymous.GetAsync(address); own.StatusCode.Should().Be(HttpStatusCode.OK);
        using var foreign = await anonymous.GetAsync(address.Replace(a.Key, b.Key)); foreign.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
    #endregion

    #region Registration and administration
    [Fact]
    public async Task QuotingSignup_RespectsWorkspaceSetting_AndNeverGrantsAdministrator()
    {
        var owner = await fixture.AddUserAsync("User", isPlatformAdmin: true); using var admin = fixture.CreateClientFor(owner.Id, "Admin");
        var a = await CreateAsync(admin, owner.Email, "quoting", "landing"); var b = await CreateAsync(admin, owner.Email, "quoting");
        using var guest = fixture.CreateAnonymousClient();
        using var settings = await guest.GetAsync(Root(a, "quoting") + "/auth/registration"); settings.EnsureSuccessStatusCode();
        (await ValueAsync(settings)).GetProperty("settings").GetProperty("allowSelfRegistration").GetBoolean().Should().BeFalse();
        var email = $"signup-{Guid.NewGuid():N}@test.local"; var registration = new { email, fullName = "New User", password = "Synthetic-password-123!", role = "Admin", isPlatformAdmin = true };
        using var closed = await ApiTestJson.SendJsonAsync(guest, HttpMethod.Post, Root(a, "quoting") + "/auth/register", registration); closed.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        using var opened = await ApiTestJson.SendJsonAsync(admin, HttpMethod.Put, Root(a, "quoting") + "/auth/registration", new { allowSelfRegistration = true }); opened.EnsureSuccessStatusCode();
        using var signup = await ApiTestJson.SendJsonAsync(guest, HttpMethod.Post, Root(a, "quoting") + "/auth/register", registration); signup.EnsureSuccessStatusCode();
        var userId = (await ValueAsync(signup)).GetGuid(); using var user = fixture.CreateClientFor(userId, "Admin");
        using var me = await user.GetAsync(Root(a, "quoting") + "/auth/me"); var profile = await ValueAsync(me);
        profile.GetProperty("role").GetString().Should().Be("User"); profile.GetProperty("isPlatformAdmin").GetBoolean().Should().BeFalse();
        using var read = await user.GetAsync(Root(a, "quoting") + "/products"); read.EnsureSuccessStatusCode();
        using var members = await user.GetAsync(Root(a, "quoting") + "/members"); members.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        using var escalation = await ApiTestJson.SendJsonAsync(user, HttpMethod.Put, Root(a, "quoting") + "/auth/registration", new { allowSelfRegistration = false }); escalation.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        using var other = await user.GetAsync(Root(b, "quoting") + "/products"); other.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        using var landing = await user.GetAsync(Root(a, "landing") + "/auth/me"); landing.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        using var disabled = await ApiTestJson.SendJsonAsync(admin, HttpMethod.Put, Root(a, "quoting") + "/auth/registration", new { allowSelfRegistration = false }); disabled.EnsureSuccessStatusCode();
        using var blockedAgain = await ApiTestJson.SendJsonAsync(guest, HttpMethod.Post, Root(a, "quoting") + "/auth/register", new { email = "other-" + email, fullName = "Other", password = "Synthetic-password-123!" }); blockedAgain.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateMember_CreatesIdentityAndScopedRole_AndNeverReplacesExistingCredentials()
    {
        var owner = await fixture.AddUserAsync("User", isPlatformAdmin: true); using var admin = fixture.CreateClientFor(owner.Id, "Admin");
        var tenant = await CreateAsync(admin, owner.Email, "quoting", "landing"); var email = $"created-{Guid.NewGuid():N}@test.local";
        using var created = await ApiTestJson.SendJsonAsync(admin, HttpMethod.Post, Root(tenant, "quoting") + "/members", new { email, fullName = "Scoped Admin", password = "Synthetic-password-123!", role = "Admin", tenantId = Guid.NewGuid(), appKey = "landing" });
        created.StatusCode.Should().Be(HttpStatusCode.Created); var id = (await ValueAsync(created)).GetProperty("member").GetProperty("id").GetGuid();
        using var member = fixture.CreateClientFor(id, "Admin");
        using var members = await member.GetAsync(Root(tenant, "quoting") + "/members"); members.EnsureSuccessStatusCode();
        using var platform = await member.GetAsync("/api/v1/platform/tenants"); platform.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        using var landing = await member.GetAsync(Root(tenant, "landing") + "/auth/me"); landing.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        using var duplicate = await ApiTestJson.SendJsonAsync(admin, HttpMethod.Post, Root(tenant, "quoting") + "/members", new { email, fullName = "Overwrite", password = "Replacement-123!", role = "User" }); duplicate.StatusCode.Should().Be(HttpStatusCode.Conflict);
        using var login = await ApiTestJson.SendJsonAsync(fixture.CreateAnonymousClient(), HttpMethod.Post, "/api/v1/auth/login", new { email, password = "Synthetic-password-123!" }); login.EnsureSuccessStatusCode();
        await fixture.WithTenantDatabaseAsync(tenant.Id, "quoting", async database => {
            var account = await database.Users.AsNoTracking().SingleAsync(user => user.Id == id); account.FullName.Should().Be("Scoped Admin"); account.Role.Should().Be("User"); account.IsPlatformAdmin.Should().BeFalse();
            (await database.TenantMemberships.CountAsync(membership => membership.UserId == id)).Should().Be(1); return true;
        });
    }

    [Fact]
    public async Task CreateMember_InvalidInputOrUnavailableApplication_DoesNotCreateOrphanAccounts()
    {
        var owner = await fixture.AddUserAsync("User", isPlatformAdmin: true); using var admin = fixture.CreateClientFor(owner.Id, "Admin"); var tenant = await CreateAsync(admin, owner.Email, "quoting");
        var email = $"orphan-{Guid.NewGuid():N}@test.local";
        using var invalid = await ApiTestJson.SendJsonAsync(admin, HttpMethod.Post, Root(tenant, "quoting") + "/members", new { email, fullName = "Invalid", password = "tiny", role = "Admin" }); invalid.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        using var absent = await ApiTestJson.SendJsonAsync(admin, HttpMethod.Post, $"/api/v1/platform/tenants/{tenant.Id}/applications/landing/members", new { email, fullName = "Invalid", password = "Synthetic-password-123!", role = "User" }); absent.StatusCode.Should().Be(HttpStatusCode.NotFound);
        await fixture.WithDatabaseAsync(async database => { (await database.Users.AnyAsync(user => user.Email == email)).Should().BeFalse(); return true; });
    }
    #endregion

    #region Helpers
    private static string Root((Guid Id, string Key) tenant, string appKey) => $"/t/{tenant.Key}/api/v1/{appKey}";
    private static object Product(string code, string name) => new { code, name, unit = "Unit", price = 10m, isActive = true, category = "Chung" };
    private static async Task<Guid> ProductAsync(HttpClient client, string root, string code, string name)
    {
        using var response = await ApiTestJson.SendJsonAsync(client, HttpMethod.Post, root + "/products", Product(code, name));
        response.StatusCode.Should().Be(HttpStatusCode.Created); return (await ValueAsync(response)).GetGuid();
    }
    private static async Task<(Guid Id, string Key)> CreateAsync(HttpClient client, string adminEmail, params string[] applications)
    {
        var key = "company-" + Guid.NewGuid().ToString("N");
        using var response = await ApiTestJson.SendJsonAsync(client, HttpMethod.Post, "/api/v1/platform/tenants", new { key, name = key, applications, adminEmail });
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var tenant = (await ValueAsync(response)).GetProperty("tenant");
        tenant.GetProperty("applications").EnumerateArray().Should().OnlyContain(application => application.GetProperty("provisioningStatus").GetString() == "Ready");
        return (tenant.GetProperty("id").GetGuid(), key);
    }
    private static async Task<JsonElement> ValueAsync(HttpResponseMessage response)
    {
        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync()); return document.RootElement.GetProperty("value").Clone();
    }
    #endregion
}
