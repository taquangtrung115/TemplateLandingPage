# KẾ HOẠCH TRIỂN KHAI (PLAN)

## CÂU HỎI CÒN BỎ NGỎ
Không có

---

## 1. Mục tiêu
Khắc phục triệt để lỗi JavaScript crash: `Cannot read properties of undefined (reading 'role')` khi người dùng đăng nhập bằng tài khoản Admin (hoặc User) do Frontend nhận cấu trúc `Result<LoginResponse>` từ Backend Minimal API nhưng chưa unwrap thuộc tính `.value`. Đồng thời chuẩn hóa toàn bộ các API client trong `FE/src/api/` và áp dụng defensive programming cho `AuthContext.jsx` và `LoginPage.jsx`.

---

## 2. Những file cần sửa hoặc tạo mới
Tất cả các file đều thuộc Frontend (`FE/`):

1. **`FE/src/api/authApi.js`** (Sửa)
   - Unwrap thuộc tính `.value` cho các hàm: `login`, `register`, `getMe`.
   - Trả về: `response.data?.value ?? response.data`.

2. **`FE/src/api/userApi.js`** (Sửa)
   - Đồng bộ chuẩn hóa unwrap `.value` cho các hàm: `getUsers`, `getUserById`, `createUser`, `updateUser`, `deleteUser`.
   - Trả về: `response.data?.value ?? response.data`.

3. **`FE/src/api/customizationApi.js`** (Sửa)
   - Đồng bộ chuẩn hóa unwrap `.value` cho các hàm: `saveCustomization`, `updateCustomization`, `getCustomizationById`, `getCustomizationBySlug`, `getMyCustomizations`, `deleteCustomization`.
   - Trả về: `response.data?.value ?? response.data`.

4. **`FE/src/api/interactionApi.js`** (Sửa)
   - Đồng bộ chuẩn hóa unwrap `.value` cho các hàm: `submitRsvp`, `getRsvps`, `submitGuestbook`, `getGuestbook`.
   - Trả về: `response.data?.value ?? response.data`.

5. **`FE/src/contexts/AuthContext.jsx`** (Sửa)
   - Khởi tạo state an toàn: lọc bỏ các giá trị rác trong `localStorage` (như chuỗi `'undefined'`, `'null'`).
   - `initAuth` (useEffect): kiểm tra token hợp lệ trước khi gọi `authApi.getMe()`, unwrap phòng vệ `profile?.value ?? profile`, lưu profile hợp lệ vào `localStorage`.
   - `login`: trích xuất an toàn `{ token, user }` từ `data?.value ?? data`, chỉ lưu `localStorage` khi `token` và `user` tồn tại, trả về `userProfile`.
   - `register`: sau khi gọi `authApi.register`, nếu kết quả trả về không có token/user (do Backend trả về `Guid`), tự động gọi `login(email, password)` để hoàn tất phiên đăng nhập và trả về `userProfile`.

6. **`FE/src/pages/auth/LoginPage.jsx`** (Sửa)
   - Sử dụng optional chaining `user?.role === 'Admin'` tại dòng kiểm tra quyền điều hướng.
   - Fallback an toàn: nếu không phải Admin, điều hướng về `from` (fallback `/`).

*(Lưu ý: Backend `BE` đã có sẵn kiến trúc trả về `Result<T>` chuẩn và 312 unit test đều PASS, không cần sửa đổi backend).*

---

## 3. Chữ ký hàm & Interface cần có

### 3.1. `FE/src/api/authApi.js`
```javascript
export const authApi = {
  login: async (credentials: { email: string, password: string }): Promise<LoginResponse>
  register: async (userData: { email: string, password: string, fullName: string }): Promise<any>
  getMe: async (): Promise<UserResponse>
};
```
*Chi tiết implement:*
- `login`: `const response = await axiosInstance.post('/auth/login', credentials); return response.data?.value ?? response.data;`
- `register`: `const response = await axiosInstance.post('/auth/register', userData); return response.data?.value ?? response.data;`
- `getMe`: `const response = await axiosInstance.get('/auth/me'); return response.data?.value ?? response.data;`

### 3.2. `FE/src/api/userApi.js`
```javascript
export const userApi = {
  getUsers: async (): Promise<UserResponse[]>
  getUserById: async (id: string): Promise<UserResponse>
  createUser: async (userData: object): Promise<string>
  updateUser: async (id: string, userData: object): Promise<any>
  deleteUser: async (id: string): Promise<any>
};
```
*Tất cả method đều unwrap:* `return response.data?.value ?? response.data;`

### 3.3. `FE/src/api/customizationApi.js`
```javascript
export const customizationApi = {
  saveCustomization: async (data: object): Promise<string>
  updateCustomization: async (id: string, data: object): Promise<any>
  getCustomizationById: async (id: string): Promise<CustomizationResponse>
  getCustomizationBySlug: async (slug: string): Promise<CustomizationResponse>
  getMyCustomizations: async (): Promise<CustomizationResponse[]>
  deleteCustomization: async (id: string): Promise<any>
};
```
*Tất cả method đều unwrap:* `return response.data?.value ?? response.data;`

### 3.4. `FE/src/api/interactionApi.js`
```javascript
export const interactionApi = {
  submitRsvp: async (rsvpData: object): Promise<string>
  getRsvps: async (customizationId: string): Promise<RsvpResponse[]>
  submitGuestbook: async (guestbookData: object): Promise<string>
  getGuestbook: async (customizationId: string): Promise<GuestbookResponse[]>
};
```
*Tất cả method đều unwrap:* `return response.data?.value ?? response.data;`

### 3.5. `FE/src/contexts/AuthContext.jsx`
```javascript
// State initializers
const [user, setUser] = useState(() => {
  const savedUser = localStorage.getItem('user');
  if (!savedUser || savedUser === 'undefined' || savedUser === 'null') return null;
  try { return JSON.parse(savedUser); } catch { return null; }
});
const [token, setToken] = useState(() => {
  const savedToken = localStorage.getItem('token');
  if (!savedToken || savedToken === 'undefined' || savedToken === 'null') return null;
  return savedToken;
});

// login
const login = useCallback(async (email, password) => {
  const data = await authApi.login({ email, password });
  const payload = data?.value ?? data;
  const jwtToken = payload?.token;
  const userProfile = payload?.user;

  if (jwtToken) {
    localStorage.setItem('token', jwtToken);
    setToken(jwtToken);
  }
  if (userProfile) {
    localStorage.setItem('user', JSON.stringify(userProfile));
    setUser(userProfile);
  }
  return userProfile;
}, []);

// register
const register = useCallback(async (email, password, fullName) => {
  const data = await authApi.register({ email, password, fullName });
  const payload = data?.value ?? data;
  if (payload?.token && payload?.user) {
    localStorage.setItem('token', payload.token);
    localStorage.setItem('user', JSON.stringify(payload.user));
    setToken(payload.token);
    setUser(payload.user);
    return payload.user;
  }
  // Backend RegisterCommand trả về Guid, tự động gọi login để thiết lập phiên đăng nhập
  return await login(email, password);
}, [login]);
```

### 3.6. `FE/src/pages/auth/LoginPage.jsx`
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    const user = await login(email, password);
    if (user?.role === 'Admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate(from, { replace: true });
    }
  } catch (err) {
    setError(err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra email và mật khẩu!');
  } finally {
    setLoading(false);
  }
};
```

---

## 4. Các trường hợp biên bắt buộc phải xử lý
1. **Dữ liệu trả về có hoặc không có bọc `value`**:
   - Xử lý kép: `response.data?.value ?? response.data` đảm bảo tương thích kể cả khi API trả về raw object hoặc Result wrapper.
2. **`localStorage` bị nhiễm giá trị rác từ lần lỗi trước**:
   - Nếu `localStorage.getItem('token')` hoặc `'user'` là chuỗi `"undefined"` hoặc `"null"`, phải coi như `null`, xóa bỏ hoặc bỏ qua, không để `JSON.parse` bắn Exception hoặc token rác gửi lên header Bearer.
3. **`token` hoặc `user` bị null/undefined khi login thất bại hoặc thành công một phần**:
   - Kiểm tra `if (jwtToken)` và `if (userProfile)` trước khi ghi vào `localStorage` và cập nhật state. Tuyệt đối không ghi `"undefined"` vào `localStorage`.
4. **`user` null/undefined tại `LoginPage.jsx`**:
   - Sử dụng optional chaining `user?.role === 'Admin'`. Nếu `user` là undefined/null, biểu thức trả về `false`, ứng dụng chuyển sang nhánh else `navigate(from, { replace: true })` mà không bị crash Runtime error.
5. **Đăng ký tài khoản mới (`RegisterPage.jsx`)**:
   - Backend chỉ trả `Guid` (userId), `AuthContext.register` tự động login để người dùng có ngay token và session, sau đó chuyển hướng an toàn tới `/templates`.
6. **Phiên làm việc khi refresh trang (F5)**:
   - `useEffect` trong `AuthContext` gọi `authApi.getMe()`. Giá trị trả về được unwrap sạch sẽ thành `UserResponse`, cập nhật đúng `user` state và `localStorage`, giúp `isAdmin` và `ProtectedRoute` hoạt động chính xác.

---

## 5. Quy ước cần bám theo
1. **Quy ước unwrap API response**:
   - File mẫu: `FE/src/api/templateApi.js` (dòng 6, 11, 16, 21, 26, 31) và `FE/src/api/categoryApi.js`.
   - Cú pháp chuẩn: `response.data?.value ?? response.data`.
2. **Quy ước Auth Context & Storage**:
   - File mẫu: `FE/src/contexts/AuthContext.jsx`.
   - Khóa lưu trữ: `'token'` và `'user'`.
   - Đảm bảo tính nhất quán của các hook tiêu thụ: `useAuth` (`user`, `token`, `isAuthenticated`, `isAdmin`, `loading`, `login`, `register`, `logout`).
3. **Quy tắc thực thi dành cho Coder**:
   - Tuân thủ nghiêm ngặt `PromtAI/.gemini/agents/coder.md`: Không sửa code ngoài phạm vi kế hoạch, chỉ chỉnh sửa đúng 6 file được chỉ định, kiểm tra build FE (`npm run build`) và unit test BE sau khi hoàn thành.
