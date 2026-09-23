# Báo Cáo Kiểm Thử Chặng 3: Tester

**Ngày thực hiện:** 23/09/2026  
**Dự án:** TemplateLandingPage (Fullstack .NET 10 + React SPA)  
**Trạng thái kiểm thử:** ✅ **PASS TOÀN BỘ 100% (XANH HẾT)**  

---

## 1. Rà Soát Mã Nguồn Sau Hoàn Nguyên (Revert)

Đã kiểm tra đối chiếu chi tiết giữa `PromtAI/.gemini/results/change.md` và `PromtAI/.gemini/results/plan.md`:
- **Frontend (FE):**
  - Đã loại bỏ sạch sẽ SDK `@supabase/supabase-js` và các thành phần OAuth (xóa `SocialAuthButtons.jsx`, `AuthCallbackPage.jsx`, `supabaseClient.js`, route `/auth/callback`).
  - Giao diện `LoginPage.jsx` và `RegisterPage.jsx` đã trở về form thuần túy Email & Mật khẩu.
  - Avatar trên `Navbar.jsx` hiển thị chữ cái đầu viết hoa từ `fullName` (fallback `'U'`), không phụ thuộc ảnh mạng ngoài.
  - `AuthContext.jsx` tinh gọn với bộ 3 hàm chuẩn: `login`, `register`, `logout`.
- **Backend (BE):**
  - Đã xóa sạch `ExternalLoginCommandHandler`, `ExternalLoginCommandValidator`, `ExternalLoginCommand`.
  - Gỡ bỏ endpoint `POST /api/v1/auth/external-login` khỏi `AuthApi.cs`.
  - Entity `User` đã lược bỏ các phương thức OAuth thừa, duy trì cơ chế bảo mật mật khẩu `IPasswordHasher` (BCrypt / PBKDF2).

---

## 2. Kết Quả Kiểm Thử Bao Quát 3 Nhóm

### Nhóm A: Đường Thuận Lợi (Happy Path)
| Kịch bản kiểm thử | Tầng | File kiểm thử thực thi | Kết quả |
| :--- | :--- | :--- | :--- |
| **Đăng ký tài khoản mới thành công** với Email, Mật khẩu, Họ tên | Backend | `BE/test/UnitTests/Application/Auth/RegisterCommandHandlerTests.cs` (`Handle_Should_RegisterUser_WhenEmailIsUnique`) | ✅ PASS |
| **Form Đăng ký tại Client** nhập đầy đủ thông tin và gửi yêu cầu | Frontend | `FE/test/registerPage.test.jsx` (`successfully registers new user and navigates to /templates`) | ✅ PASS |
| **Tự động đăng nhập sau khi đăng ký** (Auto-login lấy JWT Token) | Frontend | `FE/test/authContext.test.jsx` (`register auto-triggers login when backend returns Guid only`) | ✅ PASS |
| **Đăng nhập thành công với tài khoản User** & cấp JWT Token | Backend & Frontend | `BE/test/UnitTests/Application/Auth/LoginCommandHandlerTests.cs` & `FE/test/authContext.test.jsx` | ✅ PASS |
| **Điều hướng đúng theo Role: Admin** chuyển hướng về `/admin` | Frontend | `FE/test/loginPage.test.jsx` (`navigates to /admin when Admin logs in successfully`) | ✅ PASS |
| **Điều hướng đúng theo Role: User** chuyển hướng về `/` hoặc trang trước đó (`location.state.from`) | Frontend | `FE/test/loginPage.test.jsx` (`navigates to root /...`, `navigates to previous location...`) | ✅ PASS |

---

### Nhóm B: Trường Hợp Biên (Edge Cases)
| Kịch bản kiểm thử | Tầng | File kiểm thử thực thi | Chi tiết xử lý & Kết quả |
| :--- | :--- | :--- | :--- |
| **Email trùng lặp (`DuplicateEmail`)** | Backend & Frontend | `BE/.../RegisterCommandHandlerTests.cs` & `FE/test/registerPage.test.jsx` | Trả về mã lỗi `AuthErrors.DuplicateEmail`, frontend hiển thị thông báo lỗi rõ ràng, không crash. ✅ PASS |
| **Tài khoản bị khóa (`IsActive = false`)** | Backend | `BE/.../LoginCommandHandlerTests.cs` (`Handle_Should_ReturnFailure_WhenUserIsInactive`) | Trả về `AuthErrors.UserInactive` ("Tài khoản của bạn đã bị khóa."), chặn cấp JWT. ✅ PASS |
| **LocalStorage nhiễm bẩn chuỗi `"undefined"` hoặc `"null"`** | Frontend | `FE/test/authContext.test.jsx` (`safely handles localStorage contaminated with string...`) | AuthContext tự động dọn sạch token/user rác, không ném lỗi `JSON.parse` cú pháp. ✅ PASS |
| **Chuẩn hóa Email (Trim & Lowercase) và Họ tên** | Backend & Domain | `BE/test/UnitTests/Domain/DomainEntityValidationTests.cs` (`User_Create_Should_NormalizeEmail_And_TrimFullName`) | Email được tự động chuyển về chữ thường và xóa khoảng trắng 2 đầu (`User.Create`). ✅ PASS |
| **Phòng thủ Optional Chaining trên User Object** | Frontend | `FE/test/loginPage.test.jsx` (`safely handles user object without role property`, null, undefined) | Không bị lỗi `Cannot read properties of undefined (reading 'role')`. ✅ PASS |

---

### Nhóm C: Trường Hợp Thất Bại (Failure Path & Negative Tests)
| Kịch bản kiểm thử | Tầng | File kiểm thử thực thi | Chi tiết xử lý & Kết quả |
| :--- | :--- | :--- | :--- |
| **Sai mật khẩu (`InvalidCredentials`)** | Backend & Frontend | `BE/.../LoginCommandHandlerTests.cs` & `FE/test/loginPage.test.jsx` | Trả về lỗi chung chống User Enumeration, không cấp token, hiển thị cảnh báo đỏ. ✅ PASS |
| **Người dùng không tồn tại** | Backend | `BE/.../LoginCommandHandlerTests.cs` (`Handle_Should_ReturnFailure_WhenUserDoesNotExist`) | Trả về `AuthErrors.InvalidCredentials`. ✅ PASS |
| **Mật khẩu dưới 6 ký tự** | Backend & Frontend | `BE/.../RegisterCommandValidatorTests.cs` & `FE/test/registerPage.test.jsx` | Validator chặn với thông điệp "Mật khẩu phải từ 6 ký tự trở lên"; Client kích hoạt HTML5 `minLength={6}`. ✅ PASS |
| **Trường dữ liệu rỗng (Email, Password, FullName)** | Backend | `BE/.../RegisterCommandValidatorTests.cs` & `LoginCommandValidatorTests.cs` | FluentValidation chặn toàn bộ chuỗi rỗng / null / chỉ chứa khoảng trắng. ✅ PASS |
| **Format email không hợp lệ** | Backend | `BE/.../RegisterCommandValidatorTests.cs` & `LoginCommandValidatorTests.cs` | Bắt lỗi chuỗi sai định dạng RFC email. ✅ PASS |
| **Đăng ký gặp lỗi hệ thống / mất mạng** | Frontend | `FE/test/registerPage.test.jsx` (`displays fallback error message...`) | Hiển thị thông báo dự phòng, nút bấm trở lại trạng thái khả dụng. ✅ PASS |

---

## 3. Tổng Hợp Số Liệu Test Suites

### Backend (.NET 10 xUnit + Moq + FluentAssertions)
- **Lệnh chạy:** `dotnet test BE/TemplateLandingPage.sln`
- **Kết quả:**
  - `TemplateLandingPage.UnitTests.dll`: **375 passed, 0 failed, 0 skipped**
  - `TemplateLandingPage.Architecture.Tests.dll`: **7 passed, 0 failed, 0 skipped**
  - **Tổng cộng:** **382/382 bài test đạt 100%** (Thời gian chạy: ~2.5s)

### Frontend (React 19 + Vitest + React Testing Library)
- **Lệnh chạy:** `npm run test -- --run` (trong thư mục `FE`)
- **Kết quả:**
  - **14/14 test suites passed** (100%)
  - **147/147 test cases passed** (100%, 0 failed, 0 skipped)
  - Đã bổ sung bộ test toàn diện cho trang Đăng ký: `FE/test/registerPage.test.jsx` (4/4 passed).

### Production Build Frontend (Vite)
- **Lệnh chạy:** `npm run build` (trong thư mục `FE`)
- **Kết quả:**
  - `✓ 1723 modules transformed.`
  - `✓ built in 9.75s` với **0 errors**.

---

## 4. Kết Luận Nghiệm Thu Chặng 3

- Toàn bộ các yêu cầu của Chặng 3 dành cho Tester đã được hoàn thành đầy đủ, chính xác và nghiêm ngặt.
- Mã nguồn chỉ bổ sung và hoàn thiện các ca kiểm thử trong thư mục `test/`, tuyệt đối không can thiệp hay làm biến đổi code sản phẩm.
- Toàn bộ hệ thống kiểm thử cả Backend và Frontend **XANH HẾT 100%**.
- **Xác nhận hoàn thành Chặng 3: Tester.** Sẵn sàng chuyển giao cho Leader nghiệm thu tổng thể.
