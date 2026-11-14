namespace OnePortal.UnitTests.Infrastructure.Quoting;

using System.Net;
using System.Text;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using OnePortal.Infrastructure.Services.Quoting;
using Xunit;

public sealed class QuotationStorageTests
{
    #region Helpers
    private sealed class StubHandler(Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> send) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) => send(request, cancellationToken);
    }
    private static IConfiguration Configuration(string? path = null) => new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
    {
        ["Supabase:Url"] = "https://storage.example.test", ["Supabase:ServiceRoleKey"] = "synthetic-test-key", ["Supabase:Bucket"] = "quotations", ["Quoting:Storage:LocalPath"] = path
    }).Build();
    private static SupabaseStorageService Service(HttpMessageHandler handler, IConfiguration? configuration = null) => new(new HttpClient(handler), configuration ?? Configuration(), NullLogger<SupabaseStorageService>.Instance);
    #endregion

    [Fact]
    public async Task SupabaseUpload_ReturnsPrivateLocation_AndLeavesCallerStreamOpen()
    {
        var service = Service(new StubHandler(async (request, ct) =>
        {
            request.RequestUri!.AbsolutePath.Should().Be("/storage/v1/object/quotations/quote.pdf");
            (await request.Content!.ReadAsStringAsync(ct)).Should().Be("PDF tiếng Việt");
            request.Headers.Authorization!.Parameter.Should().Be("synthetic-test-key");
            return new HttpResponseMessage(HttpStatusCode.OK);
        }));
        using var stream = new MemoryStream(Encoding.UTF8.GetBytes("PDF tiếng Việt"));
        var result = await service.UploadFileAsync("quote.pdf", "application/pdf", stream);
        result.FileUrl.Should().Contain("/object/authenticated/quotations/");
        stream.CanRead.Should().BeTrue();
    }

    [Fact]
    public async Task FailedCloudUpload_FallsBackToCompleteLocalBytes_WithoutLeakingResponseDetails()
    {
        var path = Path.Combine(Path.GetTempPath(), "quoting-storage-test-" + Guid.NewGuid().ToString("N"));
        var configuration = Configuration(path);
        var cloud = Service(new StubHandler((_, _) => Task.FromResult(new HttpResponseMessage(HttpStatusCode.BadGateway) { Content = new StringContent("private provider details") })), configuration);
        var resolver = new QuotationFileStorageResolver(cloud, new LocalStorageService(configuration, NullLogger<LocalStorageService>.Instance), NullLogger<QuotationFileStorageResolver>.Instance);
        try
        {
            using var bytes = new MemoryStream(Encoding.UTF8.GetBytes("prefix|complete PDF bytes"));
            bytes.Position = 7;
            var result = await resolver.UploadFileAsync("quote.pdf", "application/pdf", bytes);
            result.StorageProvider.Should().Be("Local");
            (await File.ReadAllTextAsync(Path.Combine(path, "quote.pdf"))).Should().Be("complete PDF bytes");
            bytes.CanRead.Should().BeTrue();
        }
        finally { if (Directory.Exists(path)) Directory.Delete(path, true); }
    }

    [Theory]
    [InlineData("https://attacker.test/storage/v1/object/public/quotations/quote.pdf")]
    [InlineData("https://storage.example.test/storage/v1/object/public/other/quote.pdf")]
    [InlineData("http://storage.example.test/storage/v1/object/public/quotations/quote.pdf")]
    public async Task Download_DoesNotSendServiceKeyToForeignOriginOrBucket(string url)
    {
        var service = Service(new StubHandler((_, _) => throw new InvalidOperationException("Unexpected HTTP call")));
        (await service.DownloadFileAsync(url)).Should().BeNull();
    }

    [Fact]
    public async Task Download_UsesAuthenticatedRoute_AndOwnsResponseBytesAfterDisposal()
    {
        var service = Service(new StubHandler((request, _) =>
        {
            request.RequestUri!.AbsolutePath.Should().Be("/storage/v1/object/authenticated/quotations/quote.pdf");
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent("PDF data") });
        }));
        using var stream = await service.DownloadFileAsync("https://storage.example.test/storage/v1/object/public/quotations/quote.pdf");
        using var reader = new StreamReader(stream!);
        (await reader.ReadToEndAsync()).Should().Be("PDF data");
    }

    [Fact]
    public async Task Cancellation_DoesNotCreateALocalFallbackFile()
    {
        var path = Path.Combine(Path.GetTempPath(), "quoting-cancel-test-" + Guid.NewGuid().ToString("N"));
        var configuration = Configuration(path);
        using var cancellation = new CancellationTokenSource();
        var cloud = Service(new StubHandler((_, ct) => { cancellation.Cancel(); throw new OperationCanceledException(ct); }), configuration);
        var resolver = new QuotationFileStorageResolver(cloud, new LocalStorageService(configuration, NullLogger<LocalStorageService>.Instance), NullLogger<QuotationFileStorageResolver>.Instance);
        try
        {
            using var stream = new MemoryStream(new byte[] { 1, 2, 3 });
            await ((Func<Task>)(async () => { await resolver.UploadFileAsync("quote.pdf", "application/pdf", stream, cancellation.Token); })).Should().ThrowAsync<OperationCanceledException>();
            Directory.Exists(path).Should().BeFalse();
        }
        finally { if (Directory.Exists(path)) Directory.Delete(path, true); }
    }
    [Fact]
    public async Task LegacyLocalExport_RemainsReadableWithoutPublishingItsDirectory()
    {
        var root = Path.Combine(Path.GetTempPath(), "quoting-legacy-test-" + Guid.NewGuid().ToString("N"));
        var legacy = Path.Combine(root, "legacy");
        Directory.CreateDirectory(legacy);
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Quoting:Storage:LocalPath"] = Path.Combine(root, "private"),
            ["Quoting:Storage:LegacyPath"] = legacy
        }).Build();
        try
        {
            await File.WriteAllTextAsync(Path.Combine(legacy, "old.pdf"), "old export bytes");
            var service = new LocalStorageService(configuration, NullLogger<LocalStorageService>.Instance);
            using var stream = await service.DownloadFileAsync("/exports/quotations/old.pdf");
            using var reader = new StreamReader(stream!);
            (await reader.ReadToEndAsync()).Should().Be("old export bytes");
            using var missing = await service.DownloadFileAsync("/exports/quotations/missing.pdf");
            missing.Should().BeNull();
        }
        finally { if (Directory.Exists(root)) Directory.Delete(root, true); }
    }
    [Fact]
    public async Task SecretApiKey_IsNotForwardedAsAJwt_AndCloudKeysCannotCrossTenantPrefixes()
    {
        var id = Guid.NewGuid(); var requests = 0;
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Supabase:Url"] = "https://storage.example.test", ["Supabase:ServiceRoleKey"] = "sb_secret_synthetic_test",
        }).Build();
        using var http = new HttpClient(new StubHandler((request, _) =>
        {
            requests++;
            request.Headers.Authorization.Should().BeNull();
            request.Headers.GetValues("apikey").Should().ContainSingle().Which.Should().Be("sb_secret_synthetic_test");
            request.RequestUri!.AbsolutePath.Should().Contain($"/tenants/{id:N}/quoting/exports/quote.pdf");
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent("PDF") });
        }));
        var service = new SupabaseStorageService(http, configuration, NullLogger<SupabaseStorageService>.Instance,
            OnePortal.Application.Services.Tenancy.TenantContext.For(id, "quoting"));
        using var bytes = new MemoryStream([1, 2, 3]);
        var upload = await service.UploadFileAsync("quote.pdf", "application/pdf", bytes);
        using var own = await service.DownloadFileAsync(upload.FileUrl); own.Should().NotBeNull();
        (await service.DownloadFileAsync(upload.FileUrl.Replace(id.ToString("N"), Guid.NewGuid().ToString("N")))).Should().BeNull();
        requests.Should().Be(2);
    }

    [Fact]
    public async Task ProductionStorageFailure_DoesNotFallBackToReplicaLocalFiles()
    {
        var path = Path.Combine(Path.GetTempPath(), "oneportal-no-fallback-" + Guid.NewGuid().ToString("N"));
        var configuration = Configuration(path);
        var cloud = Service(new StubHandler((_, _) => Task.FromResult(new HttpResponseMessage(HttpStatusCode.ServiceUnavailable))), configuration);
        var resolver = new QuotationFileStorageResolver(cloud, new LocalStorageService(configuration, NullLogger<LocalStorageService>.Instance),
            NullLogger<QuotationFileStorageResolver>.Instance, configuration);
        using var bytes = new MemoryStream([1, 2, 3]);
        await ((Func<Task>)(async () => await resolver.UploadFileAsync("quote.pdf", "application/pdf", bytes)))
            .Should().ThrowAsync<OnePortal.Application.Exceptions.QuotationStorageUnavailableException>();
        Directory.Exists(path).Should().BeFalse();
    }

}
