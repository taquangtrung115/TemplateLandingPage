namespace OnePortal.Application.Exceptions;

public sealed class QuotationStorageUnavailableException : Exception
{
    public QuotationStorageUnavailableException() : base("Shared quotation storage is unavailable.") { }
}
