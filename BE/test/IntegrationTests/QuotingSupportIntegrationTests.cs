namespace OnePortal.IntegrationTests;

using System.Net;
using System.Text.Json;
using FluentAssertions;
using Xunit;

[Collection(PostgresApiCollection.Name)]
public sealed class QuotingSupportIntegrationTests(PostgresApiFixture fixture)
{
    #region Request helpers
    private static async Task<JsonElement> SendAsync(HttpClient client, HttpMethod method, string path, object data)
    {
        using var response = await ApiTestJson.SendJsonAsync(client, method, path, data);
        response.IsSuccessStatusCode.Should().BeTrue(await response.Content.ReadAsStringAsync());
        using var json = await ApiTestJson.ReadAsync(response);
        return json.RootElement.GetProperty("value").Clone();
    }
    private static async Task<JsonElement> GetAsync(HttpClient client, string path)
    {
        using var response = await client.GetAsync(path);
        response.IsSuccessStatusCode.Should().BeTrue(await response.Content.ReadAsStringAsync());
        using var json = await ApiTestJson.ReadAsync(response);
        return json.RootElement.GetProperty("value").Clone();
    }
    private static Task<JsonElement> SubmitAsync(HttpClient client, string topic, string priority = "normal") => SendAsync(client, HttpMethod.Post,
        "/api/v1/quoting/support-requests", new { fullName = "Nguyễn Thị Hồng", email = "support@example.test", phone = "0901234567", topic, priority, message = "Cần hỗ trợ báo giá tiếng Việt" });
    #endregion

    [Fact]
    public async Task SubmissionToKanban_TracksWorkflowActorTimesAndRevision_AndSupportsReopen()
    {
        var user = await fixture.AddUserAsync(); var admin = await fixture.AddUserAsync("Admin");
        using var author = fixture.CreateClientFor(user.Id, "User"); using var processor = fixture.CreateClientFor(admin.Id, "Admin");
        var topic = "Flow-" + Guid.NewGuid(); var id = (await SubmitAsync(author, topic)).GetProperty("id").GetGuid();
        var initial = await GetAsync(processor, $"/api/v1/quoting/support-requests?status=New&searchTerm={topic}");
        var row = initial.GetProperty("data")[0]; row.GetProperty("id").GetGuid().Should().Be(id); row.GetProperty("revision").GetInt32().Should().Be(0);
        var processing = (await SendAsync(processor, HttpMethod.Put, $"/api/v1/quoting/support-requests/{id}/status", new { status = "InProgress", expectedRevision = 0, userId = Guid.NewGuid() })).GetProperty("request");
        processing.GetProperty("status").GetString().Should().Be("InProgress"); processing.GetProperty("revision").GetInt32().Should().Be(1);
        processing.GetProperty("updatedByUserId").GetGuid().Should().Be(admin.Id);
        var resolved = (await SendAsync(processor, HttpMethod.Put, $"/api/v1/quoting/support-requests/{id}/status", new { status = "Resolved", expectedRevision = 1 })).GetProperty("request");
        resolved.GetProperty("resolvedAtUtc").ValueKind.Should().Be(JsonValueKind.String); resolved.GetProperty("resolvedByUserId").GetGuid().Should().Be(admin.Id);
        (await GetAsync(processor, $"/api/v1/quoting/support-requests?status=Resolved&searchTerm={topic}")).GetProperty("total").GetInt32().Should().Be(1);
        (await GetAsync(processor, $"/api/v1/quoting/support-requests?status=New&searchTerm={topic}")).GetProperty("total").GetInt32().Should().Be(0);
        var reopened = (await SendAsync(processor, HttpMethod.Put, $"/api/v1/quoting/support-requests/{id}/status", new { status = "New", expectedRevision = 2 })).GetProperty("request");
        reopened.GetProperty("resolvedAtUtc").ValueKind.Should().Be(JsonValueKind.Null); reopened.GetProperty("resolvedByUserId").ValueKind.Should().Be(JsonValueKind.Null);
        reopened.GetProperty("revision").GetInt32().Should().Be(3);
    }

    [Fact]
    public async Task NonAdminAndForgedAdmin_CannotReadOrProcessPrivateSupportRequests()
    {
        var user = await fixture.AddUserAsync();
        using var author = fixture.CreateClientFor(user.Id, "User"); using var forged = fixture.CreateClientFor(user.Id, "Admin"); using var anonymous = fixture.CreateAnonymousClient();
        var id = (await SubmitAsync(author, "Private-" + Guid.NewGuid())).GetProperty("id").GetGuid();
        foreach (var client in new[] { author, forged, anonymous })
        {
            var expected = client == anonymous ? HttpStatusCode.Unauthorized : HttpStatusCode.Forbidden;
            using var list = await client.GetAsync("/api/v1/quoting/support-requests"); list.StatusCode.Should().Be(expected);
            using var change = await ApiTestJson.SendJsonAsync(client, HttpMethod.Put, $"/api/v1/quoting/support-requests/{id}/status", new { status = "Resolved", expectedRevision = 0 });
            change.StatusCode.Should().Be(expected);
        }
    }

    [Fact]
    public async Task ConcurrentChanges_OneWinsAndTheOtherMustReload()
    {
        var user = await fixture.AddUserAsync("Admin"); using var client = fixture.CreateClientFor(user.Id, "Admin");
        var id = (await SubmitAsync(client, "Concurrent-" + Guid.NewGuid())).GetProperty("id").GetGuid();
        var updates = await Task.WhenAll(new[] { "InProgress", "Resolved" }.Select(status => ApiTestJson.SendJsonAsync(client, HttpMethod.Put, $"/api/v1/quoting/support-requests/{id}/status", new { status, expectedRevision = 0 })));
        try { updates.Select(response => response.StatusCode).Should().BeEquivalentTo(new[] { HttpStatusCode.OK, HttpStatusCode.Conflict }); }
        finally { foreach (var response in updates) response.Dispose(); }
    }

    [Theory]
    [InlineData("status=Unknown")]
    [InlineData("priority=wrong")]
    [InlineData("page=0")]
    [InlineData("pageSize=101")]
    public async Task InvalidSearch_ReturnsValidation(string query)
    {
        var user = await fixture.AddUserAsync("Admin"); using var client = fixture.CreateClientFor(user.Id, "Admin");
        using var response = await client.GetAsync("/api/v1/quoting/support-requests?" + query); response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task PrioritySearchAndPagination_DoNotDropOrDuplicateRequests()
    {
        var user = await fixture.AddUserAsync("Admin"); using var client = fixture.CreateClientFor(user.Id, "Admin"); var topic = "Paging-" + Guid.NewGuid();
        for(var index = 0; index < 22; index++) await SubmitAsync(client, topic, index == 21 ? "urgent" : "normal");
        var first = await GetAsync(client, $"/api/v1/quoting/support-requests?status=New&searchTerm={topic}&pageSize=20&page=1");
        var second = await GetAsync(client, $"/api/v1/quoting/support-requests?status=New&searchTerm={topic}&pageSize=20&page=2");
        first.GetProperty("total").GetInt32().Should().Be(22); first.GetProperty("data").GetArrayLength().Should().Be(20); second.GetProperty("data").GetArrayLength().Should().Be(2);
        first.GetProperty("data")[0].GetProperty("priority").GetString().Should().Be("urgent");
        first.GetProperty("data").EnumerateArray().Select(row=>row.GetProperty("id").GetGuid()).Should().NotIntersectWith(second.GetProperty("data").EnumerateArray().Select(row=>row.GetProperty("id").GetGuid()));
        (await GetAsync(client, $"/api/v1/quoting/support-requests?searchTerm={topic}&priority=urgent")).GetProperty("total").GetInt32().Should().Be(1);
    }

    [Fact]
    public async Task InvalidStatusAndUnknownId_ReturnValidationAndNotFound()
    {
        var user = await fixture.AddUserAsync("Admin"); using var client = fixture.CreateClientFor(user.Id, "Admin");
        using var invalid = await ApiTestJson.SendJsonAsync(client, HttpMethod.Put, $"/api/v1/quoting/support-requests/{Guid.NewGuid()}/status", new { status = "Unknown", expectedRevision = -1 }); invalid.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        using var missing = await ApiTestJson.SendJsonAsync(client, HttpMethod.Put, $"/api/v1/quoting/support-requests/{Guid.NewGuid()}/status", new { status = "Resolved", expectedRevision = 0 }); missing.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
