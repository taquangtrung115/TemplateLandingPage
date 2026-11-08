namespace TemplateLandingPage.Application.UseCases.V1.Quoting.Products.Helpers;

public static class QuotingProductImageAddress
{
    public const string Prefix = "/api/v1/quoting/product-images/uploads/";
    public static bool IsFileName(string? fileName) => fileName is not null && fileName.Length == 36
        && Guid.TryParseExact(fileName[..32], "N", out _) && fileName[32..] is ".png" or ".jpg";
    public static string? FileName(string? imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl)) return null;
        var path = Uri.TryCreate(imageUrl, UriKind.Absolute, out var uri) ? uri.AbsolutePath : imageUrl;
        if (!path.StartsWith(Prefix, StringComparison.Ordinal)) return null;
        var fileName = path[Prefix.Length..];
        return IsFileName(fileName) ? fileName : null;
    }
}
