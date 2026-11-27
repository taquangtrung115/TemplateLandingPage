# OnePortal

Nền tảng nhiều công ty/workspace, dùng chung backend .NET và PostgreSQL.

| Source | Trách nhiệm | Dev port |
| --- | --- | --- |
| `FE_TemplateLandingPage` | Template, customizer, bản nháp, xuất bản | 5173 |
| `FE_Quoting` | Danh mục, báo giá, PDF | 5174 |
| `FE_Tenant` | PlatformAdmin quản lý tenant, ứng dụng, thành viên | 5175 |
| `FE_Portal` | Portal quản trị, chọn workspace và mở app đã cài | 5176 |
| `FE_PhotoPrint` | Tiệm in ảnh, kiểm tra DPI, đặt in và Studio 3D | 5177 |
| `BE/src/Gateway` | YARP public entry point, xác thực JWT, routing, rate limit | 54612 |
| `BE/src/API` | OnePortal API dùng chung | 54611 |

Mỗi frontend build và deploy độc lập. Khách mở website của từng app. Quản trị viên vào `FE_Portal` để chọn workspace và mở app đã cài. Các frontend dùng chung control React từ `@oneportal/uiverse-ui`. Đọc [kiến trúc và hướng dẫn vận hành](_Docs/ONEPORTAL_MULTI_TENANCY.md) để cấu hình DB, RSA, Portal, Vercel và Render.

```powershell
dotnet restore BE/OnePortal.sln
dotnet build BE/OnePortal.sln
dotnet run --project BE/src/API -- --initialize-database
dotnet run --project BE/src/API
dotnet run --project BE/src/Gateway
```

Trong từng thư mục frontend, chạy `npm ci` và `npm.cmd run dev -- --host 127.0.0.1 --strictPort` trên PowerShell. Mở `http://127.0.0.1:5176`, nhập mã workspace hoặc mở thẳng `/t/<tenant-key>/<app-key>`. Cấu hình DB và JWT qua biến môi trường hoặc user secrets trước khi chạy.

Chạy `npm run dev:demo` tại `FE_PhotoPrint` để xem dữ liệu mẫu cục bộ. Chạy `npm run dev` để kết nối Gateway và PostgreSQL.

Kiểm tra bằng `dotnet test BE/OnePortal.sln`, `npm test` và `npm run build` trong năm frontend, cùng `node scripts/verify-frontend-architecture.mjs`. Integration tests cần PostgreSQL riêng qua các biến `TEMPLATE_TEST_PGHOST`, `TEMPLATE_TEST_PGPORT`, `TEMPLATE_TEST_PGUSER`, `TEMPLATE_TEST_PGPASSWORD`. Fixture quản lý database thử nghiệm riêng cho mỗi lần chạy.
