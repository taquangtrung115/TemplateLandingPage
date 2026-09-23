namespace TemplateLandingPage.Contract.Services.V1.Auth;

using TemplateLandingPage.Contract.Abstractions.Shared;

public record LoginResponse(string Token, UserResponse User);

public record UserResponse(
    Guid Id,
    string Email,
    string FullName,
    string Role,
    bool IsActive,
    string? AvatarUrl,
    DateTime CreatedAtUtc);

public static class AuthErrors
{
    public static readonly Error DuplicateEmail = new("Auth.DuplicateEmail", "Email đã tồn tại trong hệ thống.");
    public static readonly Error InvalidCredentials = new("Auth.InvalidCredentials", "Email hoặc mật khẩu không chính xác.");
    public static readonly Error UserInactive = new("Auth.UserInactive", "Tài khoản của bạn đã bị khóa.");
}
