# Báo Cáo Thay Đổi & Hoàn Nguyên (Revert) - Chặng 2: Coder

## 1. Tóm Tắt Mục Tiêu
Hoàn nguyên (revert) hệ thống về cơ chế Đăng ký & Đăng nhập bằng Email & Mật khẩu truyền thống theo đúng bản kế hoạch tại `PromtAI/.gemini/results/plan.md`. Loại bỏ sạch sẽ SDK Supabase, các API đăng nhập bên thứ ba (Google, Facebook OAuth) ở cả Frontend và Backend, đảm bảo mã nguồn gọn gàng, hệ thống kiểm thử tự động đạt 100% pass và build sản phẩm thành công tuyệt đối.

---

## 2. Danh Sách File Đã Thay Đổi / Đã Xóa

### A. Frontend (FE)
| Trạng thái | Đường dẫn file | Mục đích sửa đổi / Xóa |
| :--- | :--- | :--- |
| **Xóa** | `FE/src/components/auth/SocialAuthButtons.jsx` | Xóa component nút bấm Google & Facebook OAuth và divider. |
| **Xóa** | `FE/src/pages/auth/AuthCallbackPage.jsx` | Xóa trang callback hứng redirect từ Supabase OAuth. |
| **Xóa** | `FE/src/lib/supabaseClient.js` | Xóa module khởi tạo Supabase Client. |
| **Xóa** | `FE/test/oauthFlow.test.jsx` | Xóa bộ unit test cho luồng OAuth & callback. |
| **Xóa** | `FE/test/supabaseClient.test.js` | Xóa bộ unit test cấu hình Supabase Client. |
| **Sửa** | `FE/src/pages/auth/LoginPage.jsx` | Gỡ bỏ component `SocialAuthButtons`, trả lại giao diện form đăng nhập thuần túy bằng Email & Mật khẩu. |
| **Sửa** | `FE/src/pages/auth/RegisterPage.jsx` | Gỡ bỏ component `SocialAuthButtons`, trả lại giao diện form đăng ký thuần túy bằng Họ tên, Email & Mật khẩu. |
| **Sửa** | `FE/src/routes/index.jsx` | Gỡ bỏ import `AuthCallbackPage` và route `/auth/callback`. |
| **Sửa** | `FE/src/contexts/AuthContext.jsx` | Gỡ bỏ import `@supabase`, loại bỏ 2 hàm `loginWithOAuth` và `handleOAuthCallback`, gỡ `supabase.auth.signOut()`, duy trì bộ ba hàm chuẩn: `login`, `register`, `logout`. |
| **Sửa** | `FE/src/api/authApi.js` | Gỡ bỏ phương thức `externalLogin(payload)`. |
| **Sửa** | `FE/src/components/Navbar.jsx` | Trả về hiển thị avatar bằng chữ cái đầu viết hoa của tên người dùng (`user?.fullName?.charAt(0) || 'U'`). |
| **Sửa** | `FE/package.json` & `package-lock.json` | Gỡ bỏ hoàn toàn thư viện `@supabase/supabase-js`. |

### B. Backend (BE)
| Trạng thái | Đường dẫn file | Mục đích sửa đổi / Xóa |
| :--- | :--- | :--- |
| **Xóa** | `BE/src/Application/UseCases/V1/Auth/Commands/ExternalLoginCommandHandler.cs` | Xóa Command Handler xử lý đăng nhập qua mạng xã hội. |
| **Xóa** | `BE/src/Application/UseCases/V1/Auth/Validators/ExternalLoginCommandValidator.cs` | Xóa Validator kiểm tra dữ liệu `ExternalLoginCommand`. |
| **Xóa** | `BE/test/UnitTests/Application/Auth/ExternalLoginCommandHandlerTests.cs` | Xóa bộ test case cho `ExternalLoginCommandHandler`. |
| **Xóa** | `BE/test/UnitTests/Application/Auth/ExternalLoginCommandValidatorTests.cs` | Xóa bộ test case cho `ExternalLoginCommandValidator`. |
| **Sửa** | `BE/src/Presentation/APIs/Auth/AuthApi.cs` | Gỡ bỏ endpoint `POST /api/v1/auth/external-login`. |
| **Sửa** | `BE/src/Contract/Services/V1/Auth/Command.cs` | Gỡ bỏ record `ExternalLoginCommand`. |
| **Sửa** | `BE/src/Contract/Services/V1/Auth/Response.cs` | Gỡ bỏ các mã lỗi không còn dùng: `InvalidProvider` và `ExternalAuthFailed`. |
| **Sửa** | `BE/src/Domain/Entities/User.cs` | Gỡ bỏ hai phương thức nghiệp vụ OAuth: `CreateExternal` và `UpdateExternalProfile`. |
| **Sửa** | `BE/test/UnitTests/Domain/DomainEntityValidationTests.cs` | Gỡ bỏ các unit test kiểm thử cho `User.CreateExternal` và `User.UpdateExternalProfile`. |

### C. Cấu hình bảo mật bí mật (Giữ nguyên vẹn)
- `.gitignore`, `FE/.gitignore`: Đảm bảo không commit `.env`, `appsettings.*.json`.
- `BE/src/API/appsettings.example.json`, `FE/.env.example`: Giữ nguyên file mẫu cấu hình môi trường.

---

## 3. Vị Trí Trọng Yếu Tester Nên Soi Kỹ (Key Focus Areas for Testing)

1. **Luồng Đăng ký & Tự động Đăng nhập (`RegisterPage.jsx` & `AuthContext.jsx`)**:
   - Khi đăng ký tài khoản mới thành công, kiểm tra xem `AuthContext.register()` có tự động gọi `login(email, password)` để lấy JWT Token và chuyển hướng người dùng ngay sang `/templates` hay không.
   - Kiểm tra hiển thị thông báo lỗi khi đăng ký với email đã tồn tại (`DuplicateEmail`).
2. **Luồng Đăng nhập & Điều hướng Phân quyền (`LoginPage.jsx`)**:
   - Kiểm tra tài khoản `Admin` (`admin@template.com` / `Admin@123456`) -> Điều hướng đến `/admin`.
   - Kiểm tra tài khoản `User` thường -> Điều hướng về trang trước đó (`from`) hoặc `/`.
   - Kiểm tra thông báo lỗi khi nhập sai mật khẩu hoặc tài khoản bị vô hiệu hóa (`IsActive = false`).
3. **Hiển thị Avatar trên Navbar (`Navbar.jsx`)**:
   - Sau khi đăng nhập, kiểm tra dropdown avatar hiển thị đúng chữ cái đầu của tên người dùng trong badge tròn viền rose, không còn thẻ `<img>` load ảnh mạng ngoài.
4. **Đăng xuất (`AuthContext.jsx` -> `logout()`)**:
   - Kiểm tra `localStorage` dọn sạch cả `token` và `user`, trạng thái `isAuthenticated` trở về `false`.
5. **Độ ổn định của hệ thống Build & Test**:
   - Backend: Toàn bộ 379 bài kiểm thử xUnit (372 Unit Tests + 7 Architecture Tests) pass 100%.
   - Frontend: Toàn bộ 143 bài kiểm thử Vitest (13 test suites) pass 100%.
   - Frontend Vite Production Build chạy thành công sạch sẽ không còn cảnh báo lỗi runtime.
