namespace OnePortal.Infrastructure.Authentication;

public class JwtSettings
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "OnePortal";
    public string Audience { get; set; } = "OnePortal";
    public string SecretKey { get; set; } = string.Empty;
    public string PrivateKeyPem { get; set; } = string.Empty;
    public string PublicKeyPem { get; set; } = string.Empty;
    public string KeyId { get; set; } = "platform-v1";
    public int ExpirationMinutes { get; set; } = 1440; // 24 hours
}
