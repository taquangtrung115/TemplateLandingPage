# Kế hoạch Hoàn nguyên (Revert) sang Cơ chế Đăng ký & Đăng nhập Truyền thống

## CÂU HỎI CÒN BỎ NGỎ
Không có

---

## 1. Trả lời về Supabase OAuth (Google & Facebook) & Cách thức Vận hành

### Supabase có hỗ trợ Google và Facebook OAuth không?
**CÓ.** Supabase Auth hỗ trợ đầy đủ và nguyên bản cả Google OAuth 2.0 và Facebook Login (cùng nhiều nhà cung cấp khác như GitHub, Apple, Azure...) thông qua chuẩn PKCE (Proof Key for Code Exchange).

### Cách thức vận hành của Supabase OAuth:
1. **Luồng xác thực PKCE ở Client (React SPA)**:
   - Trình duyệt gọi SDK: `supabase.auth.signInWithOAuth({ provider: 'google' | 'facebook', options: { redirectTo: '/auth/callback' } })`.
   - Supabase SDK tự động tạo cặp mã bảo mật: `code_verifier` (lưu cục bộ trong bộ nhớ/sessionStorage) và `code_challenge` gửi lên máy chủ Supabase.
   - Trình duyệt được chuyển hướng tới trang ủy quyền của Google/Facebook OAuth Consent Dialog.
2. **Xác thực và trao đổi mã bảo mật ở Máy chủ**:
   - Sau khi người dùng đồng ý cấp quyền, Google/Facebook chuyển hướng về Callback URL của Supabase Auth Server: `https://<supabase-project-ref>.supabase.co/auth/v1/callback` kèm `authorization_code`.
   - Supabase Auth Server bí mật trao đổi code này với Google/Facebook bằng Client Secret (được lưu an toàn trong bảng điều khiển Supabase Console, không bao giờ lộ ra Client).
   - Supabase phát hành phiên đăng nhập (Supabase Session gồm access_token, user metadata) và redirect ngược lại trình duyệt về URL ứng dụng: `/auth/callback?code=xxx`.
   - SDK Supabase tại client tự động bắt `code` và đổi lấy Session hoàn chỉnh.
3. **Mô hình Hybrid cấp Token ứng dụng (.NET Backend)**:
   - Client lấy User Profile từ Supabase Session và gửi sang API `.NET 10` (`POST /api/v1/auth/external-login`).
   - Backend xác thực email, thực hiện Account Linking hoặc JIT Provisioning, sau đó sinh JWT riêng của hệ thống có gắn Role (`Admin` hoặc `User`).

### Lý do thường gặp khiến cấu hình Google/Facebook thất bại:
- **Google OAuth**: Google Cloud Console bắt buộc phải cấu hình chính xác `Authorized redirect URIs` là `https://<project-ref>.supabase.co/auth/v1/callback`. Ngoài ra, nếu Google OAuth Consent Screen ở chế độ "Testing", chỉ các email được thêm vào danh sách "Test users" mới được phép đăng nhập.
- **Facebook Login**: Meta for Developers yêu cầu App ở chế độ Live (hoặc cấp quyền cho Test Users), đồng thời phải bật các quyền `email`, `public_profile`, và điền Valid OAuth Redirect URIs chính xác.

### Quyết định thực thi:
Theo chỉ đạo của người dùng: "lỗi rồi, cấu hình google cũng k đc, cấu hình facebook cũng k đc, hãy back lại dùng cơ chế register và login như cũ đi", hệ thống sẽ **hoàn nguyên hoàn toàn về cơ chế Đăng ký và Đăng nhập bằng Email & Mật khẩu truyền thống**, loại bỏ sạch sẽ các phụ thuộc OAuth bên thứ ba ở cả Frontend và Backend, đảm bảo đơn giản, an toàn và hoạt động độc lập 100%.

---

## 2. Danh sách file cần Xóa và Sửa (Kèm đường dẫn chính xác)

### A. Frontend (FE)
| Thao tác | Đường dẫn file | Mô tả chi tiết |
| :--- | :--- | :--- |
| **Xóa** | `FE/src/components/auth/SocialAuthButtons.jsx` | Xóa hoàn toàn component nút Google / Facebook và divider |
| **Xóa** | `FE/src/pages/auth/AuthCallbackPage.jsx` | Xóa hoàn toàn trang xử lý callback OAuth |
| **Xóa** | `FE/src/lib/supabaseClient.js` | Xóa hoàn toàn module khởi tạo Supabase Client |
| **Xóa** | `FE/test/oauthFlow.test.jsx` | Xóa toàn bộ file test luồng OAuth phía Frontend |
| **Xóa** | `FE/test/supabaseClient.test.js` | Xóa toàn bộ file test cấu hình Supabase Client |
| **Sửa** | `FE/src/pages/auth/LoginPage.jsx` | Gỡ bỏ import `SocialAuthButtons` và thẻ JSX `<SocialAuthButtons ... />`. Giữ nguyên form đăng nhập Email & Password |
| **Sửa** | `FE/src/pages/auth/RegisterPage.jsx` | Gỡ bỏ import `SocialAuthButtons` và thẻ JSX `<SocialAuthButtons ... />`. Giữ nguyên form đăng ký Email, Mật khẩu & Họ tên |
| **Sửa** | `FE/src/routes/index.jsx` | Gỡ bỏ import `AuthCallbackPage` và route `/auth/callback` |
| **Sửa** | `FE/src/contexts/AuthContext.jsx` | Loại bỏ import `supabaseClient`, gỡ 2 hàm `loginWithOAuth` và `handleOAuthCallback`, gỡ bỏ `supabase.auth.signOut()` trong `logout()`. Giữ lại luồng truyền thống `login`, `register`, `logout` |
| **Sửa** | `FE/src/api/authApi.js` | Gỡ bỏ phương thức `externalLogin(payload)`. Giữ lại `login`, `register`, `getMe` |
| **Sửa** | `FE/src/components/Navbar.jsx` | Hiển thị avatar chữ cái đầu của tên người dùng như cũ thay vì thẻ `<img>` |
| **Sửa** | `FE/package.json` | Gỡ bỏ dependency `"@supabase/supabase-js"` |

### B. Backend (BE)
| Thao tác | Đường dẫn file | Mô tả chi tiết |
| :--- | :--- | :--- |
| **Xóa** | `BE/src/Application/UseCases/V1/Auth/Commands/ExternalLoginCommandHandler.cs` | Xóa handler xử lý đăng nhập external |
| **Xóa** | `BE/src/Application/UseCases/V1/Auth/Validators/ExternalLoginCommandValidator.cs` | Xóa validator kiểm tra ExternalLoginCommand |
| **Xóa** | `BE/test/UnitTests/Application/Auth/ExternalLoginCommandHandlerTests.cs` | Xóa bộ unit test cho ExternalLoginCommandHandler |
| **Xóa** | `BE/test/UnitTests/Application/Auth/ExternalLoginCommandValidatorTests.cs` | Xóa bộ unit test cho ExternalLoginCommandValidator |
| **Sửa** | `BE/src/Presentation/APIs/Auth/AuthApi.cs` | Gỡ bỏ endpoint `POST /api/v1/auth/external-login`. Giữ nguyên `register`, `login`, `me` |
| **Sửa** | `BE/src/Contract/Services/V1/Auth/Command.cs` | Gỡ bỏ `ExternalLoginCommand`. Giữ lại `RegisterCommand`, `LoginCommand` |
| **Sửa** | `BE/src/Contract/Services/V1/Auth/Response.cs` | Dọn dẹp các lỗi không còn dùng (`InvalidProvider`, `ExternalAuthFailed` trong `AuthErrors`) |
| **Sửa** | `BE/src/Domain/Entities/User.cs` | Gỡ bỏ hoặc tinh gọn các method phụ trợ external: `CreateExternal`, `UpdateExternalProfile`. Giữ nguyên cấu trúc entity cốt lõi |

### C. Bảo vệ bí mật (BẮT BUỘC GIỮ NGUYÊN)
- Giữ nguyên toàn bộ cấu hình phòng chống lộ bí mật trong:
  - `.gitignore` (chặn `.env`, `.env.*`, `appsettings.*.json`)
  - `FE/.gitignore` (chặn `.env`, `.env.*`)
  - `BE/src/API/appsettings.example.json` (file mẫu không chứa mật khẩu thật)
  - `FE/.env.example` (file mẫu cấu hình môi trường)

---

## 3. Chữ ký Hàm và Interface Cần Có

### A. Frontend (FE)
#### 1. `FE/src/api/authApi.js`
```javascript
export const authApi = {
  login: async (credentials) => {
    // credentials: { email: string, password: string }
    // returns: Promise<LoginResponse>
  },
  register: async (userData) => {
    // userData: { email: string, password: string, fullName: string }
    // returns: Promise<Result<Guid>>
  },
  getMe: async () => {
    // returns: Promise<UserResponse>
  }
};
```

#### 2. `FE/src/contexts/AuthContext.jsx`
```javascript
export const AuthContext = createContext(null);

// Interface giá trị AuthContext cung cấp:
interface AuthContextValue {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: 'Admin' | 'User';
    isActive: boolean;
    avatarUrl?: string | null;
    createdAtUtc: string;
  } | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<UserResponse>;
  register: (email: string, password: string, fullName: string) => Promise<UserResponse>;
  logout: () => void;
}
```

#### 3. `FE/src/components/Navbar.jsx` (Avatar UI)
```jsx
// Render Avatar quay về dạng chữ cái đầu viết hoa (fallback 'U'):
<div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center border border-rose-200">
  {user?.fullName?.charAt(0) || 'U'}
</div>
```

### B. Backend (BE)
#### 1. Contract Commands & Responses (`BE/src/Contract/Services/V1/Auth/Command.cs` & `Response.cs`)
```csharp
namespace TemplateLandingPage.Contract.Services.V1.Auth;

using TemplateLandingPage.Contract.Abstractions.Message;

public record RegisterCommand(string Email, string Password, string FullName) : ICommand<Guid>;

public record LoginCommand(string Email, string Password) : ICommand<LoginResponse>;

public record LoginResponse(string Token, UserResponse User);

public record UserResponse(
    Guid Id,
    string Email,
    string FullName,
    string Role,
    bool IsActive,
    string? AvatarUrl,
    DateTime CreatedAtUtc);
```

#### 2. API Endpoints (`BE/src/Presentation/APIs/Auth/AuthApi.cs`)
```csharp
public sealed class AuthApi : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/auth").WithTags("Auth");

        group.MapPost("register", async (RegisterCommand command, ISender sender) => ...);
        group.MapPost("login", async (LoginCommand command, ISender sender) => ...);
        group.MapGet("me", async (ClaimsPrincipal user, ISender sender) => ...).RequireAuthorization();
    }
}
```

---

## 4. Các Trường Hợp Biên Bắt Buộc Phải Xử Lý (Edge Cases)

1. **Chuẩn hóa Email (Email Trimming & Case-insensitivity)**:
   - Backend `RegisterCommandHandler` và `LoginCommandHandler`: Luôn trim và lower case email (`request.Email.Trim().ToLowerInvariant()`).
   - Kiểm tra trùng lặp email bằng `_userRepository.ExistsByEmailAsync` trước khi đăng ký.
2. **Kiểm tra trạng thái kích hoạt tài khoản (Active Check)**:
   - Trong `LoginCommandHandler`: Nếu `!user.IsActive`, từ chối ngay lập tức với `Result.Failure<LoginResponse>(AuthErrors.UserInactive)` ("Tài khoản của bạn đã bị khóa.").
3. **Mật khẩu không khớp hoặc người dùng không tồn tại**:
   - Trả về cùng thông điệp lỗi chung `AuthErrors.InvalidCredentials` ("Email hoặc mật khẩu không chính xác.") để chống lộ thông tin tài khoản (User Enumeration).
4. **Tự động đăng nhập sau khi đăng ký (Auto-Login on Register)**:
   - `RegisterCommand` của backend trả về `Result<Guid>`.
   - `AuthContext.register()` ở frontend tự động gọi `login(email, password)` ngay sau khi tạo tài khoản thành công để khởi tạo phiên đăng nhập lập tức, lưu token và redirect sang `/templates`.
5. **An toàn bộ nhớ trình duyệt (LocalStorage Contamination Guard)**:
   - `AuthContext` phải kiểm tra và loại bỏ triệt để chuỗi `"undefined"` hoặc `"null"` trong `localStorage.getItem('token')` và `localStorage.getItem('user')` để không gây lỗi parse JSON.
   - Khi logout, dọn sạch cả `token` và `user` khỏi localStorage.
6. **Điều hướng phân quyền an toàn (Role-based Navigation)**:
   - Dùng optional chaining `user?.role === 'Admin'` khi điều hướng tại `LoginPage` để tránh lỗi crash runtime `Cannot read properties of undefined (reading 'role')`.

---

## 5. Quy Ước Bám Theo & File Tham Chiếu (Reference Files)

Coder cần bám sát các mẫu chuẩn có sẵn trong codebase:
- **Minimal API Endpoint chuẩn**: Copy cú pháp từ [AuthApi.cs](file:///e:/Code/TemplateLandingPage/BE/src/Presentation/APIs/Auth/AuthApi.cs).
- **Command & Validator pattern chuẩn**: Tham khảo [LoginCommandHandler.cs](file:///e:/Code/TemplateLandingPage/BE/src/Application/UseCases/V1/Auth/Commands/LoginCommandHandler.cs) và [LoginCommandValidator.cs](file:///e:/Code/TemplateLandingPage/BE/src/Application/UseCases/V1/Auth/Validators/LoginCommandValidator.cs).
- **Frontend Auth Context & API unwrapping chuẩn**: Tham khảo [AuthContext.jsx](file:///e:/Code/TemplateLandingPage/FE/src/contexts/AuthContext.jsx) và [authApi.js](file:///e:/Code/TemplateLandingPage/FE/src/api/authApi.js).
- **Trang Auth giao diện Tailwind & Form Validation**: Tham khảo [LoginPage.jsx](file:///e:/Code/TemplateLandingPage/FE/src/pages/auth/LoginPage.jsx) và [RegisterPage.jsx](file:///e:/Code/TemplateLandingPage/FE/src/pages/auth/RegisterPage.jsx).
- **Frontend Unit Testing (Vitest + React Testing Library)**: Bám sát [loginPage.test.jsx](file:///e:/Code/TemplateLandingPage/FE/test/loginPage.test.jsx) và [authContext.test.jsx](file:///e:/Code/TemplateLandingPage/FE/test/authContext.test.jsx).
- **Backend Unit Testing (xUnit + Moq + FluentAssertions)**: Bám sát [LoginCommandHandlerTests.cs](file:///e:/Code/TemplateLandingPage/BE/test/UnitTests/Application/Auth/LoginCommandHandlerTests.cs).
