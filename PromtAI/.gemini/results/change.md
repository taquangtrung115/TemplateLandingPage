# BÁO CÁO THAY ĐỔI VÀ BÀN GIAO KỸ THUẬT (CHẶNG 2: CODER)

> **Dự án**: Template Landing Page  
> **Nội dung thực hiện**: Hoàn thiện tích hợp xác thực Google & Facebook OAuth (PKCE Hybrid) và xuất bản bộ tài liệu cấu hình chuẩn hóa Production (Song ngữ Việt - Anh).  
> **Thời điểm hoàn thành**: 23/09/2026  
> **Trạng thái**: Hoàn tất 100% - Toàn bộ Tests và Build đều PASS.

---

## 1. DANH SÁCH FILE ĐÃ THAY ĐỔI VÀ TẠO MỚI

| STT | Loại thay đổi | Đường dẫn file | Mục đích thực hiện |
|---|---|---|---|
| 1 | **Modified** | `FE/src/lib/supabaseClient.js` | Cập nhật logic khởi tạo Supabase Client hỗ trợ fallback linh hoạt giữa `VITE_SUPABASE_ANON_KEY` và `VITE_SUPABASE_PUBLISHABLE_KEY`. |
| 2 | **Modified** | `FE/.env.example` | Bổ sung hướng dẫn cấu hình cả 2 định dạng khóa public của Supabase (`VITE_SUPABASE_ANON_KEY` và `VITE_SUPABASE_PUBLISHABLE_KEY`). |
| 3 | **Created** | `_Docs/HUONG_DAN_CAU_HINH_OAUTH.md` | Tài liệu hướng dẫn kỹ thuật chi tiết step-by-step đầy đủ 7 phần bằng Tiếng Việt (Tổng quan PKCE, Google Cloud, Meta Developers, Supabase Console, Local Dev, Production Render/Vercel, Troubleshooting). |
| 4 | **Created** | `_Docs/OAUTH_SETUP_GUIDE.md` | Tài liệu hướng dẫn kỹ thuật OAuth 2.0 đầy đủ 7 phần chuẩn quốc tế bằng Tiếng Anh (English Version). |

---

## 2. CHI TIẾT MỖI CHỖ SỬA VÀ RATIONALE KỸ THUẬT

### 2.1. Cập nhật `FE/src/lib/supabaseClient.js`
- **Mã nguồn trước sửa**:
  ```javascript
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_anon_key';
  ```
- **Mã nguồn sau sửa**:
  ```javascript
  const supabaseAnonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    '';
  ```
- **Mục đích**:
  - Supabase gần đây cung cấp 2 chuẩn quy ước đặt tên cho Public Key ở Dashboard: dạng truyền thống `anon key` (JWT format) và dạng mới `publishable key` (prefix `sb_publishable_...`).
  - Trong dự án, file `FE/.env` sử dụng `VITE_SUPABASE_PUBLISHABLE_KEY`. Thay đổi này đảm bảo client nhận đúng key thực tế, tránh trường hợp bị rơi vào fallback `placeholder_anon_key` gây lỗi HTTP 401 khi gọi Supabase Auth API.

### 2.2. Cập nhật `FE/.env.example`
- **Mục đích**:
  - Hướng dẫn rõ ràng cho lập trình viên mới hoặc DevOps cách lấy Public Key trên Supabase Dashboard.
  - Khai báo mẫu cả 2 biến môi trường `VITE_SUPABASE_ANON_KEY` và `VITE_SUPABASE_PUBLISHABLE_KEY`.

### 2.3. Tạo tài liệu `_Docs/HUONG_DAN_CAU_HINH_OAUTH.md` (Bản Tiếng Việt) & `_Docs/OAUTH_SETUP_GUIDE.md` (Bản Tiếng Anh)
- **Cấu trúc 7 phần hoàn chỉnh chuẩn Production**:
  1. **Phần 1: Tổng quan luồng kiến trúc PKCE Hybrid**: Sơ đồ Mermaid sequence diagram chi tiết 12 bước từ khi bấm nút tới khi cấp JWT nội bộ; giải thích lý do bảo mật không làm lộ Client Secret trên Client SPA; phân tích cơ chế JIT Provisioning, Account Linking, Avatar Seeding và Dummy Password chống brute-force.
  2. **Phần 2: Hướng dẫn Google Cloud Console**: Step-by-step tạo project, cấu hình màn hình đồng thuận OAuth (Scopes `email`, `profile`, `openid`), tạo OAuth Client ID (Web Application), khai báo đúng Authorized JavaScript Origins và Authorized Redirect URIs (`https://<PROJECT-REF>.supabase.co/auth/v1/callback`).
  3. **Phần 3: Hướng dẫn Meta for Developers (Facebook Login)**: Tạo Facebook App (Consumer/Business), bật Facebook Login, cấu hình Valid OAuth Redirect URIs, điền Privacy Policy URL và chuyển app sang chế độ **Live** với quyền hạn `email` và `public_profile` ở mức Advanced Access.
  4. **Phần 4: Hướng dẫn Supabase Console**: Bật Provider Google & Facebook kèm Client ID/Secret, cấu hình Site URL và Whitelist Redirect URLs (`http://localhost:5173/**`, `https://*.vercel.app/**`, `https://<PROD-DOMAIN>/**`), lấy Connection String PostgreSQL (Session/Transaction Pooler) và API Keys.
  5. **Phần 5: Hướng dẫn cấu hình môi trường Local Development**: Mẫu file `appsettings.Development.json` cho Backend, file `.env` cho Frontend, các câu lệnh khởi chạy song song Backend (`dotnet run --project BE/src/API`) và Frontend (`npm run dev`).
  6. **Phần 6: Hướng dẫn cấu hình môi trường Production (Render & Vercel)**: Bảng biến môi trường chuẩn cho Render Web Service (`ASPNETCORE_ENVIRONMENT`, `ConnectionStrings__DefaultConnection`, `Jwt__*`, `Cors__AllowedOrigins__*`), thiết lập biến môi trường cho Vercel (`VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), và ma trận kiểm tra đồng bộ CORS giữa các bên.
  7. **Phần 7: Bảng xử lý sự cố thường gặp (Troubleshooting Guide)**: Bảng tổng hợp nguyên nhân & cách khắc phục dứt điểm cho 7 lỗi phổ biến nhất (`redirect_uri_mismatch`, URL Blocked Facebook, App Inactive Facebook, Invalid API Key Supabase, CORS backend, User Inactive, Callback timeout 7s), kèm hướng dẫn soi Logs trên Supabase, Render và Browser DevTools.

---

## 3. VỊ TRÍ TRỌNG YẾU MÀ TESTER NÊN SOI KỸ (CRITICAL QA CHECKPOINTS)

Khi kiểm thử tính năng đăng nhập Google / Facebook OAuth và hệ thống tài liệu, Tester cần chú ý đặc biệt các kịch bản biên sau:

1. **Kiểm tra Fallback Anon Key (`FE/src/lib/supabaseClient.js`)**:
   - Thử nghiệm chỉ khai báo `VITE_SUPABASE_ANON_KEY` trong `.env` -> Supabase Client vẫn hoạt động bình thường.
   - Thử nghiệm chỉ khai báo `VITE_SUPABASE_PUBLISHABLE_KEY` trong `.env` -> Supabase Client vẫn hoạt động bình thường.
2. **Kiểm tra Account Linking theo Email (Bảo tồn Password & Phân quyền Admin)**:
   - *Kịch bản*: Tạo trước 1 tài khoản Admin bằng email/password thông thường: `admin@example.com` với mật khẩu xác định.
   - *Thao tác*: Sử dụng Google hoặc Facebook có cùng email `admin@example.com` để đăng nhập.
   - *Kỳ vọng*: Backend thực hiện Account Linking thành công; cấp JWT có Claim Role là `Admin`; mật khẩu cũ không bị ghi đè (vẫn có thể đăng nhập bằng form Email/Password ban đầu).
3. **Kiểm tra Avatar Seeding (Không ghi đè avatar hiện có)**:
   - *Kịch bản*: User A đã có sẵn `AvatarUrl` tùy chỉnh.
   - *Thao tác*: Đăng nhập bằng Google OAuth có trả về ảnh đại diện khác.
   - *Kỳ vọng*: Hàm `UpdateExternalProfile` trong `User.cs` không ghi đè avatar của người dùng nếu trường `AvatarUrl` đã có giá trị.
4. **Kiểm tra Khóa tài khoản (`user.IsActive == false`)**:
   - *Kịch bản*: Set `IsActive = false` của một tài khoản trong cơ sở dữ liệu.
   - *Thao tác*: Đăng nhập bằng Google/Facebook ứng với email đó.
   - *Kỳ vọng*: Backend từ chối cấp token, trả về lỗi `AuthErrors.UserInactive`; màn hình hiển thị thông báo lỗi thân thiện "Tài khoản của bạn đã bị khóa".
5. **Kiểm tra Xử lý Hủy ủy quyền hoặc Lỗi Provider (`AuthCallbackPage.jsx`)**:
   - *Kịch bản*: Người dùng nhấn nút "Cancel" hoặc "Từ chối" trên màn hình OAuth của Google/Facebook.
   - *Kỳ vọng*: Provider điều hướng về `/auth/callback?error=access_denied&error_description=...`. Trang callback bắt được tham số lỗi, hiển thị thông báo lỗi rõ ràng và cung cấp nút "Quay lại trang Đăng nhập", không để trang bị treo vô hạn.
6. **Kiểm tra Timeout Fallback 7 giây**:
   - *Kịch bản*: Ngắt kết nối mạng hoặc chặn request lấy session từ Supabase tại `/auth/callback`.
   - *Kỳ vọng*: Sau 7 giây, hệ thống tự động thoát trạng thái chờ, hiển thị giao diện thông báo xác thực quá thời gian kèm nút "Thử đăng nhập lại".

---

## 4. KẾT QUẢ KIỂM THỬ VÀ BUILD TỰ ĐỘNG

- **Backend .NET 10**:
  - Lệnh: `dotnet test BE/TemplateLandingPage.sln`
  - Kết quả: **409 / 409 tests PASSED** (402 Unit Tests + 7 Architecture Tests, Failed: 0).
- **Frontend React 18/19 (Vitest)**:
  - Lệnh: `npm run test` (trong thư mục `FE`)
  - Kết quả: **156 / 156 tests PASSED** (14 test files, Failed: 0).
- **Frontend Production Build**:
  - Lệnh: `npm run build` (trong thư mục `FE`)
  - Kết quả: **Vite build thành công (exit code 0)**, tạo thư mục `dist/` sạch sẽ.
