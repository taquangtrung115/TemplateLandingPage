namespace OnePortal.Application.UseCases.V1.PhotoPrint.Uploads;

internal static class PhotoFileTypes
{
    public static (string Extension, string Mime)? Detect(ReadOnlySpan<byte> bytes)
    {
        if (bytes.Length < 12) return null;
        if (bytes.StartsWith(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 })) return (".png", "image/png");
        if (bytes.StartsWith(new byte[] { 255, 216, 255 })) return (".jpg", "image/jpeg");
        if (bytes[..4].SequenceEqual("RIFF"u8) && bytes[8..12].SequenceEqual("WEBP"u8)) return (".webp", "image/webp");
        return null;
    }

    public static string? ForExtension(string extension) => extension switch
    {
        ".png" => "image/png", ".jpg" => "image/jpeg", ".webp" => "image/webp", _ => null,
    };
}
