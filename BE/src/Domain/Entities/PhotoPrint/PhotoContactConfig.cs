namespace OnePortal.Domain.Entities.PhotoPrint;

using OnePortal.Domain.Abstractions;

public sealed class PhotoContactConfig : AggregateRoot<Guid>
{
    public PhotoContactConfig() => Id = Guid.NewGuid();

    public string BrandName { get; set; } = string.Empty;
    public string? Hotline { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? WorkingHours { get; set; }
    public bool MessengerEnabled { get; set; }
    public string? MessengerPageIdOrUsername { get; set; }
    public string? MessengerLinkOverride { get; set; }
    public string? MessengerPrefillText { get; set; }
    public string? MessengerQrImageUrl { get; set; }
    public bool FbCustomerChatEnabled { get; set; }
    public string? FbAppId { get; set; }
    public bool ZaloEnabled { get; set; }
    public string? ZaloAccountName { get; set; }
    public string? ZaloPhoneOrOaId { get; set; }
    public string? ZaloLinkOverride { get; set; }
    public string? ZaloPrefillText { get; set; }
    public string? ZaloQrImageUrl { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
}
