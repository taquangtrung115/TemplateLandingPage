namespace OnePortal.Application.Exceptions;

public sealed class QuotationImageUnavailableException : Exception
{
    public QuotationImageUnavailableException() : base("A saved quotation image is unavailable.") { }
}
