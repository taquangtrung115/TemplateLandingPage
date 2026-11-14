namespace OnePortal.Application.UseCases.V1.Interactions.Helpers;

using System.Text.Json;

public static class InteractionFeatureAvailability
{
    public static bool IsEnabled(string configJson, string sectionName)
    {
        try
        {
            using var document = JsonDocument.Parse(configJson);
            if (document.RootElement.ValueKind != JsonValueKind.Object ||
                !TryGetProperty(document.RootElement, sectionName, out var section) ||
                section.ValueKind != JsonValueKind.Object ||
                !TryGetProperty(section, "enabled", out var enabled))
            {
                return false;
            }

            return enabled.ValueKind == JsonValueKind.True;
        }
        catch (JsonException)
        {
            return false;
        }
    }

    private static bool TryGetProperty(JsonElement element, string name, out JsonElement value)
    {
        foreach (var property in element.EnumerateObject())
        {
            if (string.Equals(property.Name, name, StringComparison.OrdinalIgnoreCase))
            {
                value = property.Value;
                return true;
            }
        }

        value = default;
        return false;
    }
}
