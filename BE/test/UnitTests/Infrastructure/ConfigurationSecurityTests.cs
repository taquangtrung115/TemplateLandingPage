namespace OnePortal.UnitTests.Infrastructure;

using System.IO;
using System.Text.Json;
using OnePortal.Infrastructure.Authentication;
using Npgsql;
using FluentAssertions;
using Xunit;

public class ConfigurationSecurityTests
{
    private readonly string _appSettingsPath;

    public ConfigurationSecurityTests()
    {
        // Định vị đường dẫn appsettings.json của dự án API
        var baseDir = AppContext.BaseDirectory;
        // Đi lên từ bin/Debug/net10.0/ đến BE/src/API/appsettings.json
        var candidatePath = Path.GetFullPath(Path.Combine(baseDir, "..", "..", "..", "..", "..", "src", "API", "appsettings.json"));
        if (!File.Exists(candidatePath))
        {
            // Dự phòng đường dẫn tương đối từ workspace root
            candidatePath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "BE", "src", "API", "appsettings.json"));
        }
        if (!File.Exists(candidatePath))
        {
            candidatePath = @"c:\Source\TemplateLandingPage\BE\src\API\appsettings.json";
        }

        _appSettingsPath = candidatePath;
    }

    [Fact]
    public void HappyPath_AppSettings_ShouldExist_AndBeValidJson()
    {
        // 1. Đường chạy thuận lợi: File cấu hình tồn tại và cú pháp JSON hợp lệ
        File.Exists(_appSettingsPath).Should().BeTrue($"File cấu hình phải tồn tại tại {_appSettingsPath}");

        var jsonText = File.ReadAllText(_appSettingsPath);
        using var jsonDoc = JsonDocument.Parse(jsonText);

        jsonDoc.RootElement.TryGetProperty("ConnectionStrings", out var connSection).Should().BeTrue();
        connSection.TryGetProperty("DefaultConnection", out var defaultConn).Should().BeTrue();
        defaultConn.GetString().Should().NotBeNullOrWhiteSpace();

        jsonDoc.RootElement.TryGetProperty("Jwt", out var jwtSection).Should().BeTrue();
        jwtSection.GetProperty("Issuer").GetString().Should().Be("OnePortal");
        jwtSection.GetProperty("Audience").GetString().Should().Be("OnePortal");
        jwtSection.TryGetProperty("SecretKey", out _).Should().BeFalse("signing credentials belong in environment or ignored local configuration");
        jwtSection.TryGetProperty("PrivateKeyPem", out _).Should().BeFalse();
    }

    [Fact]
    public void SharedConnectionDefaults_DoNotContainADatabasePassword()
    {
        using var document = JsonDocument.Parse(File.ReadAllText(_appSettingsPath));
        var connection = new NpgsqlConnectionStringBuilder(document.RootElement.GetProperty("ConnectionStrings").GetProperty("DefaultConnection").GetString());
        connection.Password.Should().BeNullOrEmpty();
        connection.Host.Should().Be("localhost");
    }

    [Theory]
    [InlineData("gA00#")]
    [InlineData("Admin@123")]
    [InlineData("SuperSecret123!")]
    [InlineData("postgres123")]
    public void NegativeCase_AppSettings_MustNotContainRealOrDangerousPasswords(string forbiddenPattern)
    {
        // 3. Trường hợp thất bại: Nếu appsettings.json chứa mật khẩu thật hoặc mật khẩu nguy hiểm -> Test Fails ngay
        var jsonText = File.ReadAllText(_appSettingsPath);
        jsonText.Should().NotContain(forbiddenPattern, $"File appsettings.json tuyệt đối không được chứa mật khẩu nhạy cảm hoặc mật khẩu cứng: {forbiddenPattern}");
    }

    [Fact]
    public void DevelopmentHmacValidation_RejectsMissingAndWeakKeyMaterial()
    {
        foreach (var secret in new[] { "", "secret", "123456", "jwt_secret_key" })
        {
            Action create = () => JwtKeyMaterial.Create(new JwtSettings { SecretKey = secret }, signing: true);
            create.Should().Throw<InvalidOperationException>();
        }
    }
}
