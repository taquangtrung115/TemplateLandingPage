namespace OnePortal.Infrastructure.Authentication;

using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;

public static class JwtKeyMaterial
{
    public static SecurityKey Create(JwtSettings settings, bool signing)
    {
        var pem = signing ? settings.PrivateKeyPem : string.IsNullOrWhiteSpace(settings.PublicKeyPem) ? settings.PrivateKeyPem : settings.PublicKeyPem;
        if (!string.IsNullOrWhiteSpace(pem))
        {
            var rsa = RSA.Create(); rsa.ImportFromPem(pem.Replace("\\n", "\n", StringComparison.Ordinal));
            return new RsaSecurityKey(rsa) { KeyId = settings.KeyId };
        }
        if (Encoding.UTF8.GetByteCount(settings.SecretKey) < 32) throw new InvalidOperationException("Configure JWT signing key material.");
        return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.SecretKey));
    }
}
