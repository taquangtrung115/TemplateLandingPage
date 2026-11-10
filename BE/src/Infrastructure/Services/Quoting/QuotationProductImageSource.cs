namespace TemplateLandingPage.Infrastructure.Services.Quoting;

internal static class QuotationProductImageSource
{
    private const string BundledPrefix = "/api/v1/quoting/product-images/";

    public static Stream? OpenBundledImage(string? imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl)) return null;
        var path = Uri.TryCreate(imageUrl, UriKind.Absolute, out var absolute)
            ? absolute.AbsolutePath : imageUrl.Split('?', '#')[0];
        if (!path.StartsWith(BundledPrefix, StringComparison.Ordinal)) return null;
        var fileName = path[BundledPrefix.Length..];
        if (!fileName.EndsWith(".png", StringComparison.Ordinal)) return null;
        var code = fileName[..^4];
        if (code.Length == 0 || !code.All(character => char.IsAsciiLetterOrDigit(character) || character == '-')) return null;
        // The snapshotted URL selects the photo. A catalog code can be renamed or refer to a different photo.
        return typeof(QuotationProductImageSource).Assembly.GetManifestResourceStream($"TemplateLandingPage.Infrastructure.Assets.Products.{code}.png");
    }
}
