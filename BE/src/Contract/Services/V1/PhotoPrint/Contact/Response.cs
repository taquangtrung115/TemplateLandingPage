namespace OnePortal.Contract.Services.V1.PhotoPrint.Contact;

public sealed record PhotoContactInput(string BrandName, string? Hotline, string? Email, string? Address, string? WorkingHours, bool MessengerEnabled,
    string? MessengerPageIdOrUsername, string? MessengerLinkOverride, string? MessengerPrefillText, string? MessengerQrImageUrl,
    bool FbCustomerChatEnabled, string? FbAppId, bool ZaloEnabled, string? ZaloAccountName, string? ZaloPhoneOrOaId, string? ZaloLinkOverride,
    string? ZaloPrefillText, string? ZaloQrImageUrl);
