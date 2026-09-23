# BÁO CÁO TRIỂN KHAI: XÁC THỰC GOOGLE & FACEBOOK OAUTH VỚI SUPABASE, .NET 10 CLEAN ARCHITECTURE VÀ REACT 19

---

## 1. TỔNG QUAN KẾT QUẢ TRIỂN KHAI

Hệ thống xác thực Google & Facebook OAuth đã được triển khai hoàn chỉnh theo mô hình **Hybrid OAuth Architecture**:
- **Frontend (React 19 + Supabase Client SDK)**: Sử dụng chuẩn OAuth 2.1 kết hợp PKCE để kết nối tới Google và Meta (Facebook). Không yêu cầu client secret tại Frontend.
- **Backend (.NET 10 Web API - Clean Architecture)**: Là **Source of Truth** duy nhất. Tiếp nhận session payload qua endpoint `POST /api/v1/auth/external-login`, thực hiện cơ chế Account Linking (liên kết tài khoản đã có mà không ghi đè mật khẩu), Just-In-Time Provisioning (tự động tạo tài khoản với Role="User" và dummy hash bảo mật), kiểm tra trạng thái khóa tài khoản (`IsActive`), và cấp JWT Bearer Token chuẩn của hệ thống.
- **Kiểm thử tự động**:
  - Backend: **400/400 tests PASS (100%)** bao gồm 393 UnitTests và 7 ArchitectureTests.
  - Frontend: **149/149 tests PASS (100%)** trên 14 test suites, `npm run build` thành công sạch sẽ.

---

## 2. DANH SÁCH FILE ĐÃ THAY ĐỔI VÀ TẠO MỚI

### 2.1. Backend (.NET 10 Clean Architecture)

| STT | Đường dẫn file | Hành động | Mục đích chi tiết |
|---|---|---|---|
| 1 | [`BE/src/Domain/Entities/User.cs`](file:///e:/Code/TemplateLandingPage/BE/src/Domain/Entities/User.cs) | **Sửa** | Thêm thuộc tính `AvatarUrl`, `Provider` (mặc định "Local"); bổ sung static factory `CreateExternal(...)` sinh dummy hash bảo mật dạng `EXTERNAL_{provider}_{guid}` (chống bypass mật khẩu rỗng); bổ sung phương thức `UpdateExternalProfile(...)` để liên kết thông tin. |
| 2 | [`BE/src/Contract/Services/V1/Auth/Command.cs`](file:///e:/Code/TemplateLandingPage/BE/src/Contract/Services/V1/Auth/Command.cs) | **Sửa** | Khai báo record `ExternalLoginCommand(Provider, Email, FullName, AvatarUrl, IdToken) : ICommand<LoginResponse>`. |
| 3 | [`BE/src/Contract/Services/V1/Auth/Response.cs`](file:///e:/Code/TemplateLandingPage/BE/src/Contract/Services/V1/Auth/Response.cs) | **Sửa** | Bổ sung `string? AvatarUrl` vào record `UserResponse`; bổ sung `AuthErrors.InvalidProvider` và `AuthErrors.ExternalAuthFailed`. |
| 4 | [`BE/src/Application/UseCases/V1/Auth/Commands/ExternalLoginCommandHandler.cs`](file:///e:/Code/TemplateLandingPage/BE/src/Application/UseCases/V1/Auth/Commands/ExternalLoginCommandHandler.cs) | **Tạo mới** | Handler xử lý nghiệp vụ OAuth: Kiểm tra `IsActive`, liên kết tài khoản nếu email đã có sẵn (Account Linking), tạo mới tài khoản nếu chưa có (JIT Provisioning), cập nhật `AvatarUrl`, cấp phát JWT token hệ thống. |
| 5 | [`BE/src/Application/UseCases/V1/Auth/Validators/ExternalLoginCommandValidator.cs`](file:///e:/Code/TemplateLandingPage/BE/src/Application/UseCases/V1/Auth/Validators/ExternalLoginCommandValidator.cs) | **Tạo mới** | Validator kiểm tra: Provider chỉ chấp nhận "Google" hoặc "Facebook" (case-insensitive), Email hợp lệ, FullName không để trống. |
| 6 | [`BE/src/Application/UseCases/V1/Auth/Commands/LoginCommandHandler.cs`](file:///e:/Code/TemplateLandingPage/BE/src/Application/UseCases/V1/Auth/Commands/LoginCommandHandler.cs) | **Sửa** | Cập nhật khởi tạo `UserResponse` truyền thêm `user.AvatarUrl`. |
| 7 | [`BE/src/Application/UseCases/V1/Auth/Queries/GetCurrentUserQueryHandler.cs`](file:///e:/Code/TemplateLandingPage/BE/src/Application/UseCases/V1/Auth/Queries/GetCurrentUserQueryHandler.cs) | **Sửa** | Cập nhật khởi tạo `UserResponse` truyền thêm `user.AvatarUrl`. |
| 8 | [`BE/src/Application/UseCases/V1/Users/Queries/GetUsersQueryHandler.cs`](file:///e:/Code/TemplateLandingPage/BE/src/Application/UseCases/V1/Users/Queries/GetUsersQueryHandler.cs) | **Sửa** | Cập nhật khởi tạo `UserResponse` truyền thêm `u.AvatarUrl`. |
| 9 | [`BE/src/Application/UseCases/V1/Users/Queries/GetUserByIdQueryHandler.cs`](file:///e:/Code/TemplateLandingPage/BE/src/Application/UseCases/V1/Users/Queries/GetUserByIdQueryHandler.cs) | **Sửa** | Cập nhật khởi tạo `UserResponse` truyền thêm `user.AvatarUrl`. |
| 10 | [`BE/src/Presentation/APIs/Auth/AuthApi.cs`](file:///e:/Code/TemplateLandingPage/BE/src/Presentation/APIs/Auth/AuthApi.cs) | **Sửa** | Đăng ký Minimal API endpoint `POST /api/v1/auth/external-login`. |
| 11 | [`BE/src/Persistence/Configurations/UserConfiguration.cs`](file:///e:/Code/TemplateLandingPage/BE/src/Persistence/Configurations/UserConfiguration.cs) | **Sửa** | Cấu hình EF Core: `AvatarUrl` (varchar 500, nullable), `Provider` (varchar 50, nullable). |
| 12 | [`BE/src/Persistence/Migrations/20260923143000_AddAvatarAndProviderToUsers.cs`](file:///e:/Code/TemplateLandingPage/BE/src/Persistence/Migrations/20260923143000_AddAvatarAndProviderToUsers.cs) | **Tạo mới** | EF Core Migration thêm cột `AvatarUrl` và `Provider` vào bảng `Users`. |
| 13 | [`BE/src/Persistence/Migrations/20260923143000_AddAvatarAndProviderToUsers.Designer.cs`](file:///e:/Code/TemplateLandingPage/BE/src/Persistence/Migrations/20260923143000_AddAvatarAndProviderToUsers.Designer.cs) | **Tạo mới** | File Designer cho migration `AddAvatarAndProviderToUsers`. |
| 14 | [`BE/src/Persistence/Migrations/ApplicationDbContextModelSnapshot.cs`](file:///e:/Code/TemplateLandingPage/BE/src/Persistence/Migrations/ApplicationDbContextModelSnapshot.cs) | **Sửa** | Cập nhật ModelSnapshot chứa `AvatarUrl` và `Provider`. |
| 15 | [`BE/test/UnitTests/Application/Auth/ExternalLoginCommandHandlerTests.cs`](file:///e:/Code/TemplateLandingPage/BE/test/UnitTests/Application/Auth/ExternalLoginCommandHandlerTests.cs) | **Tạo mới** | Bộ unit test kiểm thử: Tạo user JIT mới, Liên kết tài khoản cũ bảo toàn mật khẩu, Chặn user bị vô hiệu hóa (`IsActive = false`). |
| 16 | [`BE/test/UnitTests/Application/Auth/ExternalLoginCommandValidatorTests.cs`](file:///e:/Code/TemplateLandingPage/BE/test/UnitTests/Application/Auth/ExternalLoginCommandValidatorTests.cs) | **Tạo mới** | Bộ unit test kiểm thử validation: Provider hợp lệ/không hợp lệ, định dạng email, tên rỗng. |
| 17 | [`BE/test/UnitTests/Domain/DomainEntityValidationTests.cs`](file:///e:/Code/TemplateLandingPage/BE/test/UnitTests/Domain/DomainEntityValidationTests.cs) | **Sửa** | Bổ sung unit test cho domain logic: `User.CreateExternal` và `User.UpdateExternalProfile`. |
| 18 | [`BE/test/UnitTests/Application/Behaviors/ValidationPipelineBehaviorTests.cs`](file:///e:/Code/TemplateLandingPage/BE/test/UnitTests/Application/Behaviors/ValidationPipelineBehaviorTests.cs) | **Sửa** | Cập nhật khởi tạo `UserResponse` trong mock test dữ liệu. |

---

### 2.2. Frontend (React 19 + Vite)

| STT | Đường dẫn file | Hành động | Mục đích chi tiết |
|---|---|---|---|
| 1 | [`FE/package.json`](file:///e:/Code/TemplateLandingPage/FE/package.json) | **Sửa** | Cài đặt thư viện `@supabase/supabase-js`. |
| 2 | [`FE/.env`](file:///e:/Code/TemplateLandingPage/FE/.env) | **Tạo mới** | Cấu hình `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` phục vụ môi trường chạy ứng dụng. |
| 3 | [`FE/.env.example`](file:///e:/Code/TemplateLandingPage/FE/.env.example) | **Tạo mới** | Mẫu biến môi trường hướng dẫn cấu hình API Base URL và Supabase Auth. |
| 4 | [`FE/src/lib/supabaseClient.js`](file:///e:/Code/TemplateLandingPage/FE/src/lib/supabaseClient.js) | **Tạo mới** | Khởi tạo Supabase client singleton với chế độ PKCE (`flowType: 'pkce'`), cung cấp hàm `signInWithGoogle()`, `signInWithFacebook()`, `getSupabaseSession()`. |
| 5 | [`FE/src/api/authApi.js`](file:///e:/Code/TemplateLandingPage/FE/src/api/authApi.js) | **Sửa** | Thêm hàm `externalLogin(payload)` gọi tới `/auth/external-login`. |
| 6 | [`FE/src/contexts/AuthContext.jsx`](file:///e:/Code/TemplateLandingPage/FE/src/contexts/AuthContext.jsx) | **Sửa** | Thêm `loginWithOAuth(provider)`, `handleOAuthCallback(session)` (bóc tách metadata từ Google/Facebook và gửi về backend để cấp JWT token); cập nhật `logout()` dọn dẹp phiên đồng bộ và đăng xuất khỏi Supabase. |
| 7 | [`FE/src/components/auth/SocialAuthButtons.jsx`](file:///e:/Code/TemplateLandingPage/FE/src/components/auth/SocialAuthButtons.jsx) | **Tạo mới** | Component nút đăng nhập Google và Facebook kèm icon SVG thương hiệu chính thức, divider phân tách tinh tế và loading indicator. |
| 8 | [`FE/src/pages/auth/LoginPage.jsx`](file:///e:/Code/TemplateLandingPage/FE/src/pages/auth/LoginPage.jsx) | **Sửa** | Tích hợp `SocialAuthButtons mode="login"` lên trên form đăng nhập truyền thống. |
| 9 | [`FE/src/pages/auth/RegisterPage.jsx`](file:///e:/Code/TemplateLandingPage/FE/src/pages/auth/RegisterPage.jsx) | **Sửa** | Tích hợp `SocialAuthButtons mode="register"` lên trên form đăng ký truyền thống. |
| 10 | [`FE/src/pages/auth/AuthCallbackPage.jsx`](file:///e:/Code/TemplateLandingPage/FE/src/pages/auth/AuthCallbackPage.jsx) | **Tạo mới** | Trang tiếp nhận redirect sau khi đăng nhập Google/Facebook: bắt lỗi từ URL params (`error`, `error_description`), lấy session từ Supabase, gọi `handleOAuthCallback` và tự động chuyển hướng theo Role (`/admin` hoặc `/templates`). |
| 11 | [`FE/src/routes/index.jsx`](file:///e:/Code/TemplateLandingPage/FE/src/routes/index.jsx) | **Sửa** | Khai báo route `/auth/callback` trỏ tới `AuthCallbackPage`. |
| 12 | [`FE/src/components/Navbar.jsx`](file:///e:/Code/TemplateLandingPage/FE/src/components/Navbar.jsx) | **Sửa** | Hiển thị avatar ảnh thật (`user.avatarUrl`) trong dropdown profile tài khoản khi người dùng có ảnh từ Google/Facebook. |
| 13 | [`FE/test/oauthFlow.test.jsx`](file:///e:/Code/TemplateLandingPage/FE/test/oauthFlow.test.jsx) | **Tạo mới** | Bộ unit test kiểm thử giao diện `SocialAuthButtons`, luồng redirect và xử lý lỗi của `AuthCallbackPage`. |

---

## 3. VỊ TRÍ TRỌNG YẾU TESTER NÊN SOI KỸ (CRITICAL TEST SCENARIOS)

Tester và QA cần chú trọng kiểm tra các điểm giao thoa và trường hợp biên (edge cases) sau:

1. **Account Linking (Liên kết tài khoản theo Email)**:
   - *Kịch bản*: Tạo trước 1 tài khoản thường bằng Email `tester@gmail.com` và Password `Password@123`.
   - *Kiểm tra*: Nhấn "Tiếp tục với Google" bằng chính email `tester@gmail.com`.
   - *Kỳ vọng*: Backend không tạo bản ghi mới mà liên kết vào user hiện tại, cập nhật `AvatarUrl` nếu trước đó chưa có; sau đó đăng xuất và dùng lại mật khẩu `Password@123` để đăng nhập thường vẫn thành công (mật khẩu không bị mất hay ghi đè).
2. **Khóa tài khoản (Account Inactive)**:
   - *Kịch bản*: Tài khoản có email `banned@gmail.com` bị Admin set `IsActive = false` trong CSDL.
   - *Kiểm tra*: Người dùng thực hiện đăng nhập bằng Google/Facebook với email `banned@gmail.com`.
   - *Kỳ vọng*: Backend chặn ngay lập tức và trả về mã lỗi `Auth.UserInactive`. Frontend trên trang `/auth/callback` phải hiển thị thông báo lỗi rõ ràng *"Tài khoản của bạn đã bị khóa."* và có nút quay về trang Đăng nhập.
3. **Phân quyền người dùng mới (Role Assignment)**:
   - *Kịch bản*: Người dùng mới tinh lần đầu đăng nhập bằng Google hoặc Facebook.
   - *Kỳ vọng*: Bản ghi trong bảng `Users` có `Role = "User"`, `Provider = "Google"` hoặc `"Facebook"`. Không bao giờ được phép tự động gán quyền `"Admin"`.
4. **Bảo vệ PasswordHash của tài khoản OAuth**:
   - *Kịch bản*: Kẻ tấn công cố tình gọi `POST /api/v1/auth/login` với email của tài khoản OAuth và mật khẩu rỗng `""` hoặc mật khẩu ngẫu nhiên.
   - *Kỳ vọng*: Hệ thống luôn trả về `400 Bad Request` hoặc `Auth.InvalidCredentials` vì `PasswordHash` lưu chuỗi dummy `EXTERNAL_GOOGLE_{guid}` không thể verify thành công qua thuật toán PBKDF2.
5. **Xử lý người dùng bấm Hủy (OAuth Cancellation)**:
   - *Kịch bản*: Trên màn hình chọn tài khoản Google/Facebook, người dùng bấm nút Hủy / Cancel.
   - *Kỳ vọng*: Nhà cung cấp redirect về `/auth/callback?error=access_denied`. Trang `AuthCallbackPage` không bị đơ hoặc trắng trang, mà hiển thị thông báo thân thiện và nút "Quay lại trang Đăng Nhập".
6. **Hiển thị Avatar trên Navbar**:
   - *Kịch bản*: Sau khi đăng nhập bằng Google/Facebook thành công.
   - *Kỳ vọng*: Dropdown profile ở góc trên bên phải hiển thị hình ảnh đại diện thực tế (ảnh tròn bo viền mượt) thay vì chỉ là chữ cái viết tắt đầu tiên.

---

## 4. KẾT QUẢ XÁC MINH HỆ THỐNG

```
[Backend Unit & Architecture Tests]
Passed! - Failed: 0, Passed: 393, Skipped: 0, Total: 393 - TemplateLandingPage.UnitTests.dll (net10.0)
Passed! - Failed: 0, Passed:   7, Skipped: 0, Total:   7 - TemplateLandingPage.Architecture.Tests.dll (net10.0)
==> 400/400 TESTS PASS (100%)

[Frontend Unit & Integration Tests]
Test Files: 14 passed (14)
Tests:      149 passed (149)
Duration:   37.11s
==> 149/149 TESTS PASS (100%)

[Frontend Production Build]
✓ built in 7.98s
dist/index.html                     0.51 kB │ gzip:   0.33 kB
dist/assets/index-C_nf2yvl.css     84.45 kB │ gzip:  13.22 kB
dist/assets/index-CeULjlNA.js   1,715.62 kB │ gzip: 395.95 kB
==> BUILD SUCCESS CLEANLY
```
