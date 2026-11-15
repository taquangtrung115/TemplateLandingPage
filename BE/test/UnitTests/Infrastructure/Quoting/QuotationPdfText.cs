namespace OnePortal.UnitTests.Infrastructure.Quoting;

using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using PdfSharp.Pdf.IO;

internal static class QuotationPdfText
{
    #region PDF output inspection
    // Decode the embedded font maps so assertions inspect the text actually drawn by PDFsharp.
    public static IReadOnlyList<string> Read(byte[] bytes)
    {
        using var document = PdfReader.Open(new MemoryStream(bytes), PdfDocumentOpenMode.Import);
        var result = new List<string>();
        foreach (var page in document.Pages)
        {
            var fonts = page.Resources.Elements.GetDictionary("/Font")!;
            var maps = new Dictionary<string, Dictionary<int, char>>();
            foreach (var name in fonts.Elements.KeyNames)
            {
                var font = fonts.Elements.GetDictionary(name.Value)!;
                var mapping = font.Elements.GetDictionary("/ToUnicode");
                var glyphs = new Dictionary<int, char>();
                if (mapping?.Stream is not null)
                    foreach (Match range in Regex.Matches(Encoding.ASCII.GetString(mapping.Stream.UnfilteredValue), @"<([0-9A-Fa-f]{4})>\s*<([0-9A-Fa-f]{4})>\s*<([0-9A-Fa-f]{4})>"))
                    {
                        var first = int.Parse(range.Groups[1].Value, NumberStyles.HexNumber);
                        var last = int.Parse(range.Groups[2].Value, NumberStyles.HexNumber);
                        var unicode = int.Parse(range.Groups[3].Value, NumberStyles.HexNumber);
                        for (var code = first; code <= last; code++) glyphs[code] = (char)(unicode + code - first);
                    }
                maps[name.Value] = glyphs;
            }
            var currentFont = "";
            var content = Encoding.ASCII.GetString(page.Contents.CreateSingleContent().Stream.UnfilteredValue);
            foreach (Match operation in Regex.Matches(content, @"(?<font>/F\d+)\s+[\d.]+\s+Tf|<(?<text>[0-9A-Fa-f\s]+)>\s*Tj"))
            {
                if (operation.Groups["font"].Success) { currentFont = operation.Groups["font"].Value; continue; }
                var hex = Regex.Replace(operation.Groups["text"].Value, @"\s", "");
                var text = new StringBuilder();
                for (var index = 0; index + 3 < hex.Length; index += 4)
                {
                    var code = int.Parse(hex.Substring(index, 4), NumberStyles.HexNumber);
                    text.Append(maps[currentFont].GetValueOrDefault(code, '?'));
                }
                result.Add(text.ToString());
            }
        }
        return result;
    }
    #endregion
}
