# BÁO CÁO THAY ĐỔI MÃ NGUỒN (CHANGE LOG)

## 1. Danh sách file đã thay đổi

| STT | File thay đổi | Loại thay đổi |
|:---:|---|:---:|
| 1 | `FE/src/api/authApi.js` | Sửa (Modified) |
| 2 | `FE/src/api/userApi.js` | Sửa (Modified) |
| 3 | `FE/src/api/customizationApi.js` | Sửa (Modified) |
| 4 | `FE/src/api/interactionApi.js` | Sửa (Modified) |
| 5 | `FE/src/contexts/AuthContext.jsx` | Sửa (Modified) |
| 6 | `FE/src/pages/auth/LoginPage.jsx` | Sửa (Modified) |

---

## 2. Chi tiết từng vị trí sửa và mục đích

### 2.1. `FE/src/api/authApi.js`
- **Mục đích**: Chuẩn hóa unwrapping dữ liệu từ response của Backend API theo cú pháp `response.data?.value ?? response.data`.
- **Hàm thay đổi**:
  - `login`: Thay `return response.data;` thành `return response.data?.value ?? response.data;`.
  - `register`: Thay `return response.data;` thành `return response.data?.value ?? response.data;`.
  - `getMe`: Thay `return response.data;` thành `return response.data?.value ?? response.data;`.

### 2.2. `FE/src/api/userApi.js`
- **Mục đích**: Đồng bộ unwrap `response.data?.value ?? response.data` cho tất cả các endpoint quản lý người dùng.
- **Hàm thay đổi**:
  - `getUsers`, `getUserById`, `createUser`, `updateUser`, `deleteUser`.

### 2.3. `FE/src/api/customizationApi.js`
- **Mục đích**: Đồng bộ unwrap `response.data?.value ?? response.data` cho các endpoint tùy biến thiệp/landing page.
- **Hàm thay đổi**:
  - `saveCustomization`, `updateCustomization`, `getCustomizationById`, `getCustomizationBySlug`, `getMyCustomizations`, `deleteCustomization`.

### 2.4. `FE/src/api/interactionApi.js`
- **Mục đích**: Đồng bộ unwrap `response.data?.value ?? response.data` cho các endpoint tương tác (RSVP, Sổ lưu bút).
- **Hàm thay đổi**:
  - `submitRsvp`, `getRsvps`, `submitGuestbook`, `getGuestbook`.

### 2.5. `FE/src/contexts/AuthContext.jsx`
- **Mục đích**: Áp dụng defensive programming để bảo vệ trạng thái xác thực và phiên đăng nhập.
- **Chi tiết thay đổi**:
  - Khởi tạo state `user` & `token`: Kiểm tra và loại bỏ các chuỗi rác trong localStorage (`'undefined'`, `'null'`), chỉ parse JSON khi dữ liệu thực sự hợp lệ.
  - `initAuth` (useEffect): Chỉ gọi `authApi.getMe()` khi token hợp lệ khác rác; unwrap phòng vệ `profile = res?.value ?? res` và chỉ lưu khi profile tồn tại; nếu token không hợp lệ hoặc lỗi xác thực thì xóa sạch localStorage và reset state.
  - `login`: Trích xuất an toàn `const payload = data?.value ?? data;`, bóc tách `jwtToken` và `userProfile`; chỉ ghi vào localStorage và cập nhật state khi các giá trị này tồn tại; trả về `userProfile`.
  - `register`: Hỗ trợ trường hợp Backend `RegisterCommand` trả về `Guid` (chưa kèm JWT token) bằng cách tự động gọi hàm `login(email, password)` để thiết lập phiên đăng nhập đầy đủ và chuyển hướng an toàn.

### 2.6. `FE/src/pages/auth/LoginPage.jsx`
- **Mục đích**: Ngăn chặn Runtime TypeError `Cannot read properties of undefined (reading 'role')`.
- **Chi tiết thay đổi**:
  - Sử dụng optional chaining: `if (user?.role === 'Admin')`.
  - Giữ fallback an toàn: điều hướng sang `from` (mặc định `/`) nếu không phải Admin.

---

## 3. Vị trí trọng yếu Tester nên soi kỹ

1. **Luồng Đăng nhập Admin (`FE/src/pages/auth/LoginPage.jsx` & `FE/src/contexts/AuthContext.jsx`)**:
   - Thử đăng nhập với tài khoản Admin (`admin@template.com` / `Admin@123456`).
   - Kiểm tra console xem có còn xuất hiện lỗi TypeError `Cannot read properties of undefined (reading 'role')` hay không.
   - Kiểm tra xem người dùng có được điều hướng chính xác vào trang `/admin` hay không.
   - Kiểm tra localStorage xem key `token` có lưu chuỗi JWT hợp lệ (không phải `'undefined'`) và `user` có lưu đúng JSON object của Admin hay không.

2. **Luồng Đăng nhập User thường**:
   - Thử đăng nhập với `user@template.com` / `User@123456`.
   - Kiểm tra xem người dùng có được điều hướng đúng về trang trước đó hoặc `/` hay không.

3. **Luồng Đăng ký tài khoản mới (`FE/src/pages/auth/RegisterPage.jsx`)**:
   - Thử tạo tài khoản mới.
   - Kiểm tra sau khi đăng ký, session có được tự động thiết lập (token + user có trong localStorage) và người dùng có chuyển thẳng đến `/templates` mà không cần phải tự đăng nhập lại hay không.

4. **F5 Refresh trang (Phiên làm việc & Auth State)**:
   - Đăng nhập xong, nhấn F5 tải lại trang bất kỳ.
   - Kiểm tra `initAuth` có đồng bộ profile mượt mà từ `/auth/me` mà không bị logout oan hay crash trang.
   - Thử cố tình chèn chuỗi `"undefined"` vào `localStorage.setItem('token', 'undefined')` và reload trang: AuthContext phải xóa sạch rác và reset state về unauthenticated một cách an toàn.

5. **Trang Quản trị Người dùng (`FE/src/pages/admin/AdminUsersPage.jsx`)**:
   - Sau khi login Admin, vào `/admin/users`. Kiểm tra danh sách người dùng hiển thị đầy đủ (do `userApi.getUsers()` đã unwrap đúng mảng thay vì bọc Result).

---

## 4. Kết quả kiểm thử tự động

- **Frontend build (`FE/`)**: `npm run build` thành công 100% (exit code 0, 1696 modules transformed).
- **Backend tests (`BE/`)**:
  - `TemplateLandingPage.UnitTests`: 312/312 tests Passed.
  - `TemplateLandingPage.Architecture.Tests`: 7/7 tests Passed.
  - Tổng cộng: **319/319 tests Passed**.
