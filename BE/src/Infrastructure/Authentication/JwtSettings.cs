namespace TemplateLandingPage.Infrastructure.Authentication;

public class JwtSettings
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "TemplateLandingPage";
    public string Audience { get; set; } = "TemplateLandingPage";
    public string SecretKey { get; set; } = "SuperSecretKeyForTemplateLandingPage2026!@#$%^&*";
    public int ExpirationMinutes { get; set; } = 1440; // 24 hours
}
