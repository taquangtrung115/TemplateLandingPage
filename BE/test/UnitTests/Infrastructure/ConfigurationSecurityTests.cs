namespace TemplateLandingPage.UnitTests.Infrastructure;

using System.IO;
using System.Text.Json;
using System.Text.RegularExpressions;
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
        jwtSection.TryGetProperty("SecretKey", out var secretKey).Should().BeTrue();
        secretKey.GetString().Should().NotBeNullOrWhiteSpace();
        secretKey.GetString()!.Length.Should().BeGreaterThanOrEqualTo(32, "SecretKey tối thiểu 32 ký tự để đảm bảo chuẩn HMAC-SHA256");
    }

    [Fact]
    public void EdgeCase_ConnectionString_ShouldUseSafePlaceholderPassword()
    {
        // 2. Trường hợp biên: ConnectionString chỉ dùng placeholder Password=passwordhere;
        var jsonText = File.ReadAllText(_appSettingsPath);
        using var jsonDoc = JsonDocument.Parse(jsonText);
        var defaultConn = jsonDoc.RootElement.GetProperty("ConnectionStrings").GetProperty("DefaultConnection").GetString()!;

        // Trích xuất Password trong Connection String
        var match = Regex.Match(defaultConn, @"Password\s*=\s*([^;]+);?", RegexOptions.IgnoreCase);
        match.Success.Should().BeTrue("ConnectionString phải có tham số Password");

        var passwordValue = match.Groups[1].Value.Trim();
        passwordValue.Should().NotBeNullOrWhiteSpace("Password trong ConnectionString không được để trống");
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
    public void NegativeCase_JwtSecretKey_MustRejectWeakOrShortKeys()
    {
        // 3. Trường hợp thất bại: JWT SecretKey phải an toàn và không dùng key mặc định quá ngắn
        var jsonText = File.ReadAllText(_appSettingsPath);
        using var jsonDoc = JsonDocument.Parse(jsonText);
        var secretKey = jsonDoc.RootElement.GetProperty("Jwt").GetProperty("SecretKey").GetString()!;

        // Key không được ngắn dưới 32 ký tự và không được để trống
        secretKey.Length.Should().BeGreaterThanOrEqualTo(32);
        secretKey.Should().NotBe("secret");
        secretKey.Should().NotBe("123456");
        secretKey.Should().NotBe("jwt_secret_key");
    }
}
