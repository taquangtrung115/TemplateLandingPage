namespace TemplateLandingPage.Infrastructure.Services.Quoting;

using PdfSharp.Fonts;

internal sealed class QuotationFontResolver : IFontResolver
{
    public byte[] GetFont(string faceName)
    {
        using var stream = typeof(QuotationFontResolver).Assembly.GetManifestResourceStream(
            "TemplateLandingPage.Infrastructure.Assets.Fonts.NotoSans-Regular.ttf")
            ?? throw new InvalidOperationException("The quotation font resource is missing.");
        using var output = new MemoryStream();
        stream.CopyTo(output);
        return output.ToArray();
    }

    public FontResolverInfo ResolveTypeface(string familyName, bool isBold, bool isItalic) =>
        new("QuotationSans", isBold, isItalic);
}
