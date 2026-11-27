namespace OnePortal.UnitTests.Infrastructure.PhotoPrint;

using System.Net;
using Microsoft.Extensions.Configuration;
using OnePortal.Infrastructure.Services.PhotoPrint;
using Xunit;

public sealed class PhotoFileStorageTests
{
    [Theory]
    [InlineData("{\"statusCode\":\"404\",\"error\":\"not_found\",\"message\":\"Object not found\"}")]
    [InlineData("{\"code\":\"NoSuchKey\"}")]
    public async Task MissingObjectWrappedInBadRequestReturnsNull(string content)
    {
        using var client = new HttpClient(new StorageHandler(content));
        Assert.Null(await CreateStorage(client).OpenAsync(Guid.NewGuid(), "photo.webp", "image/webp", default));
    }

    [Theory]
    [InlineData("{\"statusCode\":\"403\",\"code\":\"AccessDenied\"}")]
    [InlineData("Bad request")]
    public async Task OtherBadRequestsRemainStorageFailures(string content)
    {
        using var client = new HttpClient(new StorageHandler(content));
        await Assert.ThrowsAsync<HttpRequestException>(() =>
            CreateStorage(client).OpenAsync(Guid.NewGuid(), "photo.webp", "image/webp", default));
    }

    private static PhotoFileStorage CreateStorage(HttpClient client) => new(client,
        new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Supabase:Url"] = "https://storage.example.test",
            ["Supabase:ServiceRoleKey"] = "test-only"
        }).Build());

    private sealed class StorageHandler(string content) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) =>
            Task.FromResult(new HttpResponseMessage(HttpStatusCode.BadRequest) { Content = new StringContent(content) });
    }
}
