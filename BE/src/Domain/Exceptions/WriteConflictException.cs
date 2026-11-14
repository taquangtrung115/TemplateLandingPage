namespace OnePortal.Domain.Exceptions;

public sealed class WriteConflictException : Exception
{
    public WriteConflictException() : base("Dữ liệu đã thay đổi hoặc đường dẫn đã được sử dụng. Vui lòng tải lại và thử lại.") { }
}
