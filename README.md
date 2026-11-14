# OnePortal

Nền tảng nhiều công ty/workspace, dùng chung backend .NET và PostgreSQL.

| Source | Trách nhiệm | Dev port |
| --- | --- | --- |
| `FE_TemplateLandingPage` | Template, customizer, bản nháp, xuất bản | 5173 |
| `FE_Quoting` | Danh mục, báo giá, PDF | 5174 |
| `FE_Tenant` | PlatformAdmin quản lý tenant, ứng dụng, thành viên | 5175 |
| `BE/src/Gateway` | YARP public entry point, xác thực JWT, routing, rate limit | 54612 |
| `BE/src/API` | OnePortal API dùng chung | 54611 |

Mỗi frontend là một app độc lập. Đọc [kiến trúc và hướng dẫn vận hành](_Docs/ONEPORTAL_MULTI_TENANCY.md) để cấu hình DB, RSA, migration/seed tự động, Vercel và Render.

```powershell
dotnet restore BE/OnePortal.sln
dotnet build BE/OnePortal.sln
dotnet run --project BE/src/API -- --initialize-database
dotnet run --project BE/src/API
dotnet run --project BE/src/Gateway
```

Trong từng thư mục frontend: `npm ci`, `npm run dev`. Cấu hình DB và JWT bằng biến môi trường hoặc user secrets trước khi chạy; không đưa secret vào frontend/Git.

Kiểm tra: `dotnet test BE/OnePortal.sln`, `npm test` và `npm run build` cho cả ba frontend, `node scripts/verify-frontend-architecture.mjs`. Integration tests cần PostgreSQL riêng tại các biến `TEMPLATE_TEST_PGHOST`, `TEMPLATE_TEST_PGPORT`, `TEMPLATE_TEST_PGUSER`, `TEMPLATE_TEST_PGPASSWORD`; các test chỉ tạo/xóa database có tên riêng do fixture tạo.
