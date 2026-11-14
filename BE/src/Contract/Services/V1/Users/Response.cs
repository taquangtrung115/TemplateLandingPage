namespace OnePortal.Contract.Services.V1.Users;

using OnePortal.Contract.Abstractions.Shared;

public static class UserErrors
{
    public static readonly Error NotFound = new("User.NotFound", "Không tìm thấy người dùng.");
    public static readonly Error CannotDeleteSelf = new("User.CannotDeleteSelf", "Không thể xóa tài khoản hiện tại đang đăng nhập.");
    public static readonly Error DuplicateEmail = new("User.DuplicateEmail", "Email đã tồn tại.");
}
