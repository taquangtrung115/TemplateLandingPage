namespace OnePortal.Infrastructure.Services.Quoting;

using System.Text.Json;
using OnePortal.Domain.Entities.Quoting;

internal sealed record QuotationTemplateContent(
    string SellerName, string Address, string TaxCode, string Phone,
    string BankAccount, string BankName, string BankHolder,
    string Delivery, string Payment, string VatNote, string SignCity, string SignTitle, string CustomerSignTitle)
{
    #region Configuration
    public static QuotationTemplateContent From(QuotationTemplateVersion version)
    {
        var seller = Parse(version.SellerInfoJson);
        var payment = Parse(version.PaymentTermsJson);
        var signature = Parse(version.SignatureConfigJson);
        var bank = payment.TryGetProperty("bankAccounts", out var banks) && banks.ValueKind == JsonValueKind.Array && banks.GetArrayLength() > 0
            ? banks[0] : default;
        return new(
            Text(seller, "companyName", "CHUỖI ĂN VẶT"), Text(seller, "address", "19 NGÔ VĂN NĂM PHÚ THẠNH TPHCM"), Text(seller, "taxCode", "0319645690"), Text(seller, "phone", ""),
            Text(bank, "accountNumber", Text(seller, "bankAccount", "")), Text(bank, "bankName", Text(seller, "bankName", "")),
            Text(bank, "accountHolder", Text(seller, "bankHolder", "")),
            Text(payment, "delivery", Text(payment, "deliveryLocation", "")), Text(payment, "payment", Text(payment, "paymentMethod", "")),
            Text(payment, "vatNote", ""), Text(signature, "city", Text(signature, "signCity", "TP.HCM")), Text(signature, "rightTitle", Text(signature, "signTitle", "PHÒNG KINH DOANH")),
            Text(signature, "leftTitle", "ĐẠI DIỆN KHÁCH HÀNG"));
    }

    private static JsonElement Parse(string? json)
    {
        try
        {
            using var document = JsonDocument.Parse(string.IsNullOrWhiteSpace(json) ? "{}" : json);
            return document.RootElement.ValueKind == JsonValueKind.Object ? document.RootElement.Clone() : JsonSerializer.SerializeToElement(new { });
        }
        catch (JsonException) { return JsonSerializer.SerializeToElement(new { }); }
    }

    private static string Text(JsonElement value, string key, string fallback) =>
        value.ValueKind == JsonValueKind.Object && value.TryGetProperty(key, out var property) && property.ValueKind == JsonValueKind.String
            ? property.GetString() ?? fallback : fallback;
    #endregion
}
