namespace TemplateLandingPage.IntegrationTests;

using System.Net;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Persistence;
using Xunit;

[Collection(PostgresApiCollection.Name)]
public sealed class CustomizationPublishingIntegrationTests(PostgresApiFixture fixture)
{
    [Fact]
    public async Task OwnerDraftVersionsAndSlugAliasesFollowPublicationState()
    {
        var owner = await fixture.AddUserAsync();
        var anotherUser = await fixture.AddUserAsync();
        var template = await fixture.AddTemplateAsync();
        using var ownerClient = fixture.CreateClientFor(owner.Id, "User");
        using var otherClient = fixture.CreateClientFor(anotherUser.Id, "User");
        using var guestClient = fixture.CreateClientFor(Guid.Empty, "User");
        using var anonymous = fixture.CreateClientFor(Guid.Empty, "User");
        anonymous.DefaultRequestHeaders.Authorization = null;

        var draftId = Guid.NewGuid();
        const string originalConfig = "{\"theme\":{},\"hero\":{\"title\":\"Version one\"}}";
        using var create = await ApiTestJson.SendJsonAsync(ownerClient, HttpMethod.Post, "/api/v1/customizations",
            new { templateId = template.Id, title = "Site one", slug = UniqueSlug("site-one"), configJson = originalConfig, clientDraftId = draftId });
        create.StatusCode.Should().Be(HttpStatusCode.Created);
        using var createBody = await ApiTestJson.ReadAsync(create);
        var siteId = ApiTestJson.GuidValue(createBody.RootElement, "value", "id");
        var revision = ApiTestJson.IntValue(createBody.RootElement, "value", "revision");
        revision.Should().Be(1);

        using var createRetry = await ApiTestJson.SendJsonAsync(ownerClient, HttpMethod.Post, "/api/v1/customizations",
            new { templateId = template.Id, title = "Site one", slug = ApiTestJson.StringValue(createBody.RootElement, "value", "id"), configJson = originalConfig, clientDraftId = Guid.NewGuid() });
        // A new client draft id creates a distinct draft. Repeating the original id returns its original site.
        createRetry.Dispose();
        using var sameDraftRetry = await ApiTestJson.SendJsonAsync(ownerClient, HttpMethod.Post, "/api/v1/customizations",
            new { templateId = template.Id, title = "Site one", slug = ApiTestJson.StringValue(createBody.RootElement, "value", "slug"), configJson = originalConfig, clientDraftId = draftId });
        sameDraftRetry.StatusCode.Should().Be(HttpStatusCode.Created);
        using var retryBody = await ApiTestJson.ReadAsync(sameDraftRetry);
        ApiTestJson.GuidValue(retryBody.RootElement, "value", "id").Should().Be(siteId);

        using var guestCreate = await ApiTestJson.SendJsonAsync(anonymous, HttpMethod.Post, "/api/v1/customizations",
            new { templateId = template.Id, title = "Guest", slug = UniqueSlug("guest"), configJson = "{}", clientDraftId = Guid.NewGuid() });
        guestCreate.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        using var guestDetail = await anonymous.GetAsync($"/api/v1/customizations/{siteId}");
        guestDetail.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        using var otherDetail = await otherClient.GetAsync($"/api/v1/customizations/{siteId}");
        otherDetail.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        using var ownerDetail = await ownerClient.GetAsync($"/api/v1/customizations/{siteId}");
        ownerDetail.StatusCode.Should().Be(HttpStatusCode.OK);

        var originalSlug = ApiTestJson.StringValue(createBody.RootElement, "value", "slug");
        using var privateLookup = await anonymous.GetAsync($"/api/v1/customizations/slug/{originalSlug}");
        privateLookup.StatusCode.Should().Be(HttpStatusCode.NotFound);

        var firstRequestId = Guid.NewGuid();
        using var createVersion = await ApiTestJson.SendJsonAsync(ownerClient, HttpMethod.Post,
            $"/api/v1/customizations/{siteId}/versions",
            new { title = "Version one", slug = originalSlug, configJson = originalConfig, expectedRevision = revision, requestId = firstRequestId });
        createVersion.StatusCode.Should().Be(HttpStatusCode.Created);
        using var firstVersionBody = await ApiTestJson.ReadAsync(createVersion);
        var versionOneId = ApiTestJson.GuidValue(firstVersionBody.RootElement, "value", "versionId");
        var versionOneNumber = ApiTestJson.IntValue(firstVersionBody.RootElement, "value", "versionNumber");
        versionOneNumber.Should().Be(1);
        revision = ApiTestJson.IntValue(firstVersionBody.RootElement, "value", "revision");

        using var versionRetry = await ApiTestJson.SendJsonAsync(ownerClient, HttpMethod.Post,
            $"/api/v1/customizations/{siteId}/versions",
            new { title = "Version one", slug = originalSlug, configJson = originalConfig, expectedRevision = 1, requestId = firstRequestId });
        versionRetry.StatusCode.Should().Be(HttpStatusCode.Created);
        using var versionRetryBody = await ApiTestJson.ReadAsync(versionRetry);
        ApiTestJson.GuidValue(versionRetryBody.RootElement, "value", "versionId").Should().Be(versionOneId);

        using var privateVersionLookup = await anonymous.GetAsync($"/api/v1/customizations/slug/{originalSlug}/versions/1");
        privateVersionLookup.StatusCode.Should().Be(HttpStatusCode.NotFound);
        using var otherVersionDetail = await otherClient.GetAsync($"/api/v1/customizations/{siteId}/versions/{versionOneId}");
        otherVersionDetail.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        using var ownerVersionDetail = await ownerClient.GetAsync($"/api/v1/customizations/{siteId}/versions/{versionOneId}");
        ownerVersionDetail.StatusCode.Should().Be(HttpStatusCode.OK);
        using var ownerVersionDetailBody = await ApiTestJson.ReadAsync(ownerVersionDetail);
        ApiTestJson.StringValue(ownerVersionDetailBody.RootElement, "value", "configJson").Should().Be(originalConfig);

        using var publishFirst = await ApiTestJson.SendJsonAsync(ownerClient, HttpMethod.Put,
            $"/api/v1/customizations/{siteId}/publication",
            new { versionId = versionOneId, expectedRevision = revision });
        publishFirst.StatusCode.Should().Be(HttpStatusCode.OK);
        using var publishBody = await ApiTestJson.ReadAsync(publishFirst);
        revision = ApiTestJson.IntValue(publishBody.RootElement, "value", "revision");

        using var publicFirst = await anonymous.GetAsync($"/api/v1/customizations/slug/{originalSlug}");
        publicFirst.StatusCode.Should().Be(HttpStatusCode.OK);
        using var publicFirstBody = await ApiTestJson.ReadAsync(publicFirst);
        ApiTestJson.GuidValue(publicFirstBody.RootElement, "value", "versionId").Should().Be(versionOneId);
        ApiTestJson.StringValue(publicFirstBody.RootElement, "value", "configJson").Should().Be(originalConfig);
        publicFirstBody.RootElement.GetProperty("value").TryGetProperty("userId", out _).Should().BeFalse();

        var renamedSlug = UniqueSlug("site-renamed");
        const string workingConfig = "{\"theme\":{},\"hero\":{\"title\":\"Working update\"}}";
        var updateRequestId = Guid.NewGuid();
        using var updateDraft = await ApiTestJson.SendJsonAsync(ownerClient, HttpMethod.Put,
            $"/api/v1/customizations/{siteId}",
            new { title = "Working update", slug = renamedSlug, configJson = workingConfig, expectedRevision = revision, requestId = updateRequestId });
        updateDraft.StatusCode.Should().Be(HttpStatusCode.OK);
        using var updateBody = await ApiTestJson.ReadAsync(updateDraft);
        revision = ApiTestJson.IntValue(updateBody.RootElement, "value", "revision");

        using var unchangedPublic = await anonymous.GetAsync($"/api/v1/customizations/slug/{originalSlug}");
        unchangedPublic.StatusCode.Should().Be(HttpStatusCode.OK);
        using var unchangedPublicBody = await ApiTestJson.ReadAsync(unchangedPublic);
        ApiTestJson.StringValue(unchangedPublicBody.RootElement, "value", "configJson").Should().Be(originalConfig);

        const string secondConfig = "{\"theme\":{},\"hero\":{\"title\":\"Version two\"}}";
        var secondRequestId = Guid.NewGuid();
        using var createSecondVersion = await ApiTestJson.SendJsonAsync(ownerClient, HttpMethod.Post,
            $"/api/v1/customizations/{siteId}/versions",
            new { title = "Version two", slug = renamedSlug, configJson = secondConfig, expectedRevision = revision, requestId = secondRequestId });
        createSecondVersion.StatusCode.Should().Be(HttpStatusCode.Created);
        using var secondVersionBody = await ApiTestJson.ReadAsync(createSecondVersion);
        var versionTwoId = ApiTestJson.GuidValue(secondVersionBody.RootElement, "value", "versionId");
        ApiTestJson.IntValue(secondVersionBody.RootElement, "value", "versionNumber").Should().Be(2);
        revision = ApiTestJson.IntValue(secondVersionBody.RootElement, "value", "revision");

        using var unlistedVersions = await ownerClient.GetAsync($"/api/v1/customizations/{siteId}/versions");
        unlistedVersions.StatusCode.Should().Be(HttpStatusCode.OK);
        using var unlistedVersionsBody = await ApiTestJson.ReadAsync(unlistedVersions);
        var listedVersions = unlistedVersionsBody.RootElement.GetProperty("value").GetProperty("data");
        listedVersions.GetArrayLength().Should().Be(2);
        listedVersions[0].TryGetProperty("configJson", out _).Should().BeFalse();

        using var publishSecond = await ApiTestJson.SendJsonAsync(ownerClient, HttpMethod.Put,
            $"/api/v1/customizations/{siteId}/publication",
            new { versionId = versionTwoId, expectedRevision = revision });
        publishSecond.StatusCode.Should().Be(HttpStatusCode.OK);
        using var publishSecondBody = await ApiTestJson.ReadAsync(publishSecond);
        revision = ApiTestJson.IntValue(publishSecondBody.RootElement, "value", "revision");

        using var mainAtNewSlug = await anonymous.GetAsync($"/api/v1/customizations/slug/{renamedSlug}");
        mainAtNewSlug.StatusCode.Should().Be(HttpStatusCode.OK);
        using var mainAtNewSlugBody = await ApiTestJson.ReadAsync(mainAtNewSlug);
        ApiTestJson.GuidValue(mainAtNewSlugBody.RootElement, "value", "versionId").Should().Be(versionTwoId);
        ApiTestJson.StringValue(mainAtNewSlugBody.RootElement, "value", "configJson").Should().Be(secondConfig);

        using var firstAtOldAlias = await anonymous.GetAsync($"/api/v1/customizations/slug/{originalSlug}/versions/1");
        firstAtOldAlias.StatusCode.Should().Be(HttpStatusCode.OK);
        using var firstAtOldAliasBody = await ApiTestJson.ReadAsync(firstAtOldAlias);
        ApiTestJson.GuidValue(firstAtOldAliasBody.RootElement, "value", "versionId").Should().Be(versionOneId);
        ApiTestJson.StringValue(firstAtOldAliasBody.RootElement, "value", "configJson").Should().Be(originalConfig);

        using var privateVersionLookupAfterPublish = await anonymous.GetAsync($"/api/v1/customizations/slug/{renamedSlug}/versions/3");
        privateVersionLookupAfterPublish.StatusCode.Should().Be(HttpStatusCode.NotFound);

        using var removeOldVersion = await ownerClient.DeleteAsync(
            $"/api/v1/customizations/{siteId}/versions/{versionOneId}/publication?expectedRevision={revision}");
        removeOldVersion.StatusCode.Should().Be(HttpStatusCode.OK);
        using var removeOldVersionBody = await ApiTestJson.ReadAsync(removeOldVersion);
        revision = ApiTestJson.IntValue(removeOldVersionBody.RootElement, "value", "revision");
        using var closedOldVersion = await anonymous.GetAsync($"/api/v1/customizations/slug/{originalSlug}/versions/1");
        closedOldVersion.StatusCode.Should().Be(HttpStatusCode.NotFound);
        using var stillMainVersion = await anonymous.GetAsync($"/api/v1/customizations/slug/{renamedSlug}");
        stillMainVersion.StatusCode.Should().Be(HttpStatusCode.OK);

        using var removePublication = await ownerClient.DeleteAsync($"/api/v1/customizations/{siteId}/publication?expectedRevision={revision}");
        removePublication.StatusCode.Should().Be(HttpStatusCode.OK);
        using var closedMain = await anonymous.GetAsync($"/api/v1/customizations/slug/{renamedSlug}");
        closedMain.StatusCode.Should().Be(HttpStatusCode.NotFound);

        using var deleteSite = await ownerClient.DeleteAsync($"/api/v1/customizations/{siteId}?expectedRevision={revision + 1}");
        deleteSite.StatusCode.Should().Be(HttpStatusCode.OK);
        using var deletedSitePublic = await anonymous.GetAsync($"/api/v1/customizations/slug/{originalSlug}/versions/2");
        deletedSitePublic.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task RevisionRetryAndConcurrentVersionWritesAreIdempotentAndRollbackLosingSnapshot()
    {
        var owner = await fixture.AddUserAsync();
        var template = await fixture.AddTemplateAsync();
        using var firstClient = fixture.CreateClientFor(owner.Id, "User");
        using var secondClient = fixture.CreateClientFor(owner.Id, "User");
        const string initialConfig = "{\"theme\":{}}";
        var (siteId, revision, slug) = await CreateDraftAsync(firstClient, template.Id, "concurrent", initialConfig);

        var updateRequestId = Guid.NewGuid();
        const string updatedConfig = "{\"theme\":{},\"hero\":{\"title\":\"updated\"}}";
        var update = new { title = "Updated", slug, configJson = updatedConfig, expectedRevision = revision, requestId = updateRequestId };
        using var save = await ApiTestJson.SendJsonAsync(firstClient, HttpMethod.Put, $"/api/v1/customizations/{siteId}", update);
        save.StatusCode.Should().Be(HttpStatusCode.OK);
        using var saveBody = await ApiTestJson.ReadAsync(save);
        var savedRevision = ApiTestJson.IntValue(saveBody.RootElement, "value", "revision");

        using var retry = await ApiTestJson.SendJsonAsync(firstClient, HttpMethod.Put, $"/api/v1/customizations/{siteId}", update);
        retry.StatusCode.Should().Be(HttpStatusCode.OK);
        using var retryBody = await ApiTestJson.ReadAsync(retry);
        ApiTestJson.IntValue(retryBody.RootElement, "value", "revision").Should().Be(savedRevision);

        using var changedRetry = await ApiTestJson.SendJsonAsync(firstClient, HttpMethod.Put, $"/api/v1/customizations/{siteId}",
            new { title = "Changed retry", slug, configJson = "{\"theme\":{}}", expectedRevision = revision, requestId = updateRequestId });
        changedRetry.StatusCode.Should().Be(HttpStatusCode.Conflict);

        var initialVersionRequest = Guid.NewGuid();
        var initialVersion = new { title = "Snapshot one", slug, configJson = updatedConfig, expectedRevision = savedRevision, requestId = initialVersionRequest };
        using var createVersion = await ApiTestJson.SendJsonAsync(firstClient, HttpMethod.Post, $"/api/v1/customizations/{siteId}/versions", initialVersion);
        createVersion.StatusCode.Should().Be(HttpStatusCode.Created);
        using var firstVersionBody = await ApiTestJson.ReadAsync(createVersion);
        var firstVersionId = ApiTestJson.GuidValue(firstVersionBody.RootElement, "value", "versionId");
        var versionRevision = ApiTestJson.IntValue(firstVersionBody.RootElement, "value", "revision");

        using var exactVersionRetry = await ApiTestJson.SendJsonAsync(firstClient, HttpMethod.Post, $"/api/v1/customizations/{siteId}/versions", initialVersion);
        exactVersionRetry.StatusCode.Should().Be(HttpStatusCode.Created);
        using var exactRetryBody = await ApiTestJson.ReadAsync(exactVersionRetry);
        ApiTestJson.GuidValue(exactRetryBody.RootElement, "value", "versionId").Should().Be(firstVersionId);

        using var changedVersionRetry = await ApiTestJson.SendJsonAsync(firstClient, HttpMethod.Post,
            $"/api/v1/customizations/{siteId}/versions",
            new { title = "Different", slug, configJson = updatedConfig, expectedRevision = savedRevision, requestId = initialVersionRequest });
        changedVersionRetry.StatusCode.Should().Be(HttpStatusCode.Conflict);

        var raceOne = ApiTestJson.SendJsonAsync(firstClient, HttpMethod.Post, $"/api/v1/customizations/{siteId}/versions",
            new { title = "Race A", slug, configJson = "{\"theme\":{},\"hero\":{\"title\":\"A\"}}", expectedRevision = versionRevision, requestId = Guid.NewGuid() });
        var raceTwo = ApiTestJson.SendJsonAsync(secondClient, HttpMethod.Post, $"/api/v1/customizations/{siteId}/versions",
            new { title = "Race B", slug, configJson = "{\"theme\":{},\"hero\":{\"title\":\"B\"}}", expectedRevision = versionRevision, requestId = Guid.NewGuid() });
        var raceResponses = await Task.WhenAll(raceOne, raceTwo);
        try
        {
            raceResponses.Select(x => x.StatusCode).Count(x => x == HttpStatusCode.Created).Should().Be(1);
            raceResponses.Select(x => x.StatusCode).Count(x => x == HttpStatusCode.Conflict).Should().Be(1);
        }
        finally
        {
            foreach (var response in raceResponses) response.Dispose();
        }

        using var versionList = await firstClient.GetAsync($"/api/v1/customizations/{siteId}/versions");
        versionList.StatusCode.Should().Be(HttpStatusCode.OK);
        using var versionListBody = await ApiTestJson.ReadAsync(versionList);
        var versions = versionListBody.RootElement.GetProperty("value").GetProperty("data");
        versions.GetArrayLength().Should().Be(2);
        versions.EnumerateArray().Select(v => v.GetProperty("versionNumber").GetInt32()).Order().Should().Equal(1, 2);

        var otherOwner = await fixture.AddUserAsync();
        using var otherClient = fixture.CreateClientFor(otherOwner.Id, "User");
        using var stolenAlias = await ApiTestJson.SendJsonAsync(otherClient, HttpMethod.Post, "/api/v1/customizations",
            new { templateId = template.Id, title = "Slug conflict", slug, configJson = "{}", clientDraftId = Guid.NewGuid() });
        stolenAlias.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    private static async Task<(Guid Id, int Revision, string Slug)> CreateDraftAsync(HttpClient client, Guid templateId, string stem, string configJson)
    {
        var slug = UniqueSlug(stem);
        using var response = await ApiTestJson.SendJsonAsync(client, HttpMethod.Post, "/api/v1/customizations",
            new { templateId, title = "Draft", slug, configJson, clientDraftId = Guid.NewGuid() });
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        using var body = await ApiTestJson.ReadAsync(response);
        return (ApiTestJson.GuidValue(body.RootElement, "value", "id"),
            ApiTestJson.IntValue(body.RootElement, "value", "revision"), slug);
    }

    private static string UniqueSlug(string stem) => $"{stem}-{Guid.NewGuid():N}";
}
