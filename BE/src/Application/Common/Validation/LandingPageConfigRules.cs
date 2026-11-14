namespace OnePortal.Application.Common.Validation;

using System.Text;
using System.Text.Json;

internal static class LandingPageConfigRules
{
    private static readonly HashSet<string> TextFields =
        ["title", "subtitle", "name", "description", "desc", "content", "caption", "badge", "fontFamily", "primaryColor",
         "secondaryColor", "backgroundColor", "textColor", "accentColor", "coverImageUrl", "imageUrl", "url", "ctaUrl",
         "videoUrl", "audioUrl", "eventDate", "animation", "layout", "callToActionText", "venueName", "address",
         "ceremonyName", "mapUrl", "time", "date", "ctaText", "editorialLabel", "imageCaption", "type"];

    public static bool IsValid(string? config)
    {
        if (string.IsNullOrWhiteSpace(config) || Encoding.UTF8.GetByteCount(config) > 2_000_000) return false;
        try
        {
            using var document = JsonDocument.Parse(config, new JsonDocumentOptions { MaxDepth = 64 });
            if (document.RootElement.ValueKind != JsonValueKind.Object || !HasBoundedValues(document.RootElement)) return false;
            string[] objects = ["theme", "hero", "coupleOrCelebrant", "eventDetails", "rsvp", "music", "wishes", "booking", "sectionHeadings"];
            string[] arrays = ["timeline", "gallery", "extraSections", "speakers", "pricingTickets", "pricingPackages", "servicesGrid",
                "treatmentProcess", "featureCardsGrid", "metrics", "hierarchicalCards"];
            foreach (var field in objects)
                if (document.RootElement.TryGetProperty(field, out var value) && value.ValueKind != JsonValueKind.Object) return false;
            foreach (var field in arrays)
                if (document.RootElement.TryGetProperty(field, out var value) &&
                    (value.ValueKind != JsonValueKind.Array || value.EnumerateArray().Any(item => item.ValueKind != JsonValueKind.Object))) return false;
            if (document.RootElement.TryGetProperty("sectionOrder", out var order) &&
                (order.ValueKind != JsonValueKind.Array || order.EnumerateArray().Any(item => item.ValueKind != JsonValueKind.String))) return false;
            return true;
        }
        catch (JsonException) { return false; }
    }

    private static bool HasBoundedValues(JsonElement value) => value.ValueKind switch
    {
        JsonValueKind.Object => value.EnumerateObject().All(p => p.Name.Length <= 200 &&
            (!TextFields.Contains(p.Name) || p.Value.ValueKind is JsonValueKind.String or JsonValueKind.Null) &&
            (p.Name != "enabled" || p.Value.ValueKind is JsonValueKind.True or JsonValueKind.False) && HasBoundedValues(p.Value)),
        JsonValueKind.Array => value.GetArrayLength() <= 500 && value.EnumerateArray().All(HasBoundedValues),
        JsonValueKind.String => value.GetString()!.Length <= 250_000,
        _ => true
    };
}
