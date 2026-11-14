namespace OnePortal.Application.UseCases.V1.Tenancy.Helpers;

using OnePortal.Contract.Abstractions.Shared;

public static class TenancyErrors
{
    public static readonly Error Forbidden = new("Tenancy.Forbidden", "Bạn không có quyền quản lý workspace này.");
    public static readonly Error Invalid = new("Tenancy.Invalid", "Thông tin workspace hoặc quyền truy cập không hợp lệ.");
    public static readonly Error NotFound = new("Tenancy.NotFound", "Không tìm thấy workspace, ứng dụng hoặc tài khoản.");
    public static readonly Error Conflict = new("Tenancy.Conflict", "Mã workspace hoặc quyền truy cập đã tồn tại.");
    public static readonly Error LastAdmin = new("Tenancy.LastAdmin", "Cần giữ ít nhất một quản trị viên hoạt động.");
}
