namespace OnePortal.Infrastructure.Services.Quoting;

using PdfSharp.Fonts;

internal sealed class QuotationFontResolver : IFontResolver
{
    #region Embedded typefaces
    public byte[] GetFont(string faceName)
    {
        var fileName = faceName == "QuotationSans-Bold" ? "NotoSans-Bold.ttf" : "NotoSans-Regular.ttf";
        using var stream = typeof(QuotationFontResolver).Assembly.GetManifestResourceStream(
            $"OnePortal.Infrastructure.Assets.Fonts.{fileName}")
            ?? throw new InvalidOperationException("The quotation font resource is missing.");
        using var output = new MemoryStream();
        stream.CopyTo(output);
        return output.ToArray();
    }

    public FontResolverInfo ResolveTypeface(string familyName, bool isBold, bool isItalic) =>
        new(isBold ? "QuotationSans-Bold" : "QuotationSans-Regular", false, isItalic);
    #endregion
}
