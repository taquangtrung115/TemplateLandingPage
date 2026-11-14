# OnePortal — kết quả triển khai và kiểm chứng

Ngày 2026-11-14. Không dùng skill ship; không commit, push hoặc deploy.

## Đã triển khai

- Backend solution/project/assembly/namespace đổi sang **OnePortal**, solution `BE/OnePortal.sln`.
- Ba frontend độc lập: **FE_TemplateLandingPage**, **FE_Quoting**, **FE_Tenant**; không import source chéo app.
- YARP Gateway độc lập, RSA public key, CORS, rate limit, trace, cluster platform/landing/quoting. Backend hiện là một modular monolith dùng chung PostgreSQL.
- Tenant theo công ty/workspace; bật ứng dụng và cấp Admin/User theo từng tenant/app. PlatformAdmin không tự có quyền nghiệp vụ mọi tenant.
- TenantId ở base nghiệp vụ, query filter/write guard, composite FK và unique index theo tenant. Identity/platform global có allowlist architecture test.
- Automatic migration/seed có version history, transaction, lock, idempotency và rollback/retry. Tenant lỗi trả 503 riêng; app khác/platform vẫn hoạt động.
- Ảnh/file xuất mới có storage prefix theo tenant. Chỉ tenant mặc định được fallback đọc file legacy. Draft/pending login action chia theo tenant; client loại response workspace cũ.

## Supabase đã áp dụng

Thực hiện đúng database Supabase được người dùng xác nhận, sau rehearsal trên database riêng chứa snapshot dữ liệu thật.

| Mục | Kết quả |
| --- | --- |
| Migration | `20261114080350_AddMultiTenantPlatform` |
| Dữ liệu gốc | Giữ 679 bản ghi ở 20 bảng, đối chiếu ID/field |
| Seed mới | 1 category General + 1 template Workspace starter; tổng 681 bản ghi trong các bảng cũ |
| Backfill | 19 bảng nghiệp vụ có TenantId đúng Landing/Quoting mặc định |
| Ứng dụng mặc định | landing và quoting: Ready, seed v1 |
| Membership | 10 membership từ 5 tài khoản cũ, giữ role/trạng thái |
| PlatformAdmin | `admin@template.com`, giữ mật khẩu |
| Audit dự kiến | Chỉ ModifiedAtUtc của tài khoản vừa được cấp quyền thay đổi |
| FK đã validate | 37 FK ở public/quo/platform |

Backup dữ liệu ứng dụng 20 bảng được nén và mã hóa **Windows DPAPI theo user hiện tại**, tại `runtime/supabase-before-multi-tenant.dpapi`. Đây không phải full backup Supabase auth/storage/roles. Manifest và SHA256 tại `backup-manifest.json`. Không ghi plaintext vào file backup; runtime/tool/binary/log/report chi tiết được Git ignore.

Bằng chứng: `rehearsal-verification.json`, `supabase-verification.json`, `supabase-initialization-summary.json`. Cập nhật audit khi cấp quyền được tách rõ; các field gốc còn lại, kể cả PasswordHash, không đổi.

## Kiểm thử cuối

| Bộ kiểm tra | Passed | Failed |
| --- | ---: | ---: |
| BE unit | 602 | 0 |
| BE PostgreSQL/API integration | 70 | 0 |
| BE architecture | 14 | 0 |
| FE_TemplateLandingPage | 179 | 0 |
| FE_Quoting | 226 | 0 |
| FE_Tenant | 5 | 0 |
| Browser desktop/mobile | 10 | 0 |

Tổng **686 test BE, 410 test FE, 10 E2E**. `verification-summary.json` đọc số liệu từ TRX/JSON cuối.

Solution build: 0 warning/error. API/Gateway publish Release thành công, development settings không vào output publish cuối. Cả ba frontend build thành công. `has-pending-model-changes` không lệch model/migration; architecture FE qua.

Integration kiểm tra dữ liệu/role hai công ty, header/token giả quyền, reference/FK chéo tenant, signup theo app, disable tenant, seed giữ chỉnh sửa/tombstone, rollback/retry, migration/bootstrap đồng thời, không tự cấp lại quyền đã thu hồi và ảnh chéo tenant. Các test cũ về quotation/version/RSVP/guestbook/catalog/PDF vẫn được chạy.

Browser chạy Chromium desktop và viewport iPhone 13 (không phải Safari/iPhone thật), ba Vite app, Gateway, PostgreSQL và hai API process thật. Flow gồm tạo/seed workspace qua FE_Tenant; đổi workspace/role; guest draft cách ly; login rồi lưu server/create version; tạo báo giá/PDF; tải từ replica khác; tenant khác nhận 404; kiểm tra JWT/CORS/trace và chống giả quyền qua Gateway.

Đã chạy browser từ setup tool mới, không cần SQL thủ công. VerificationSeed từ chối host ngoài loopback hoặc database ngoài tên `oneportal_e2e` trước khi kết nối.

Production-mode smoke: RSA login/health 200; tenant Failed nhận 503, app khác vẫn 200; initializer retry khôi phục về 200. Kết quả trong `production-startup-verification.json`, dùng database synthetic local.

```powershell
dotnet build BE/OnePortal.sln
dotnet test BE/test/UnitTests/OnePortal.UnitTests.csproj --no-build
dotnet test BE/test/IntegrationTests/OnePortal.IntegrationTests.csproj --no-build
dotnet test BE/test/Architecture.Tests/OnePortal.Architecture.Tests.csproj --no-build
dotnet ef migrations has-pending-model-changes --project BE/src/Persistence --startup-project BE/src/API --no-build
node scripts/verify-frontend-architecture.mjs
# Trong mỗi frontend:
node node_modules/vitest/vitest.mjs run --maxWorkers=1
npm run build
```

Setup E2E: `scripts/initialize-oneportal-verification.ps1`, `scripts/start-oneportal-verification.ps1`, rồi `npm run test:e2e` trong FE_Tenant. Setup reset riêng database disposable local. Stop bằng `scripts/start-oneportal-verification.ps1 -Stop`.

## Cấu hình và giới hạn

- **Chưa deploy BE/Gateway/ba FE.** Database đã đổi schema; backend cũ không ghi được vì TenantId bắt buộc. Cần cutover sang OnePortal mới trước khi tiếp tục ghi. Không rollback binary cũ đơn lẻ; Down migration không bảo toàn dữ liệu tenant mới.
- Cấu hình Supabase hiện tại được giữ ở `BE/src/API/appsettings.Development.json` (ignored). Tracked appsettings.json đã bỏ credential. RSA local riêng; Gateway development chỉ có public key. Git history trước đây không được sửa.
- Render/Vercel config đã chuẩn bị. Đổi Vercel Landing Root Directory sang FE_TemplateLandingPage; VITE_API_BASE_URL trỏ Gateway. Production cần DB runtime/migration, RSA và shared storage qua environment secrets.
- Storage fixture kiểm chứng prefix/cách ly/nhiều replica; chưa kiểm chứng bucket/file cloud thật hoặc file nằm trên ổ Render cũ. File local legacy cần chuyển sang shared storage trước scale; schema migration không chuyển file vật lý.
- Docker daemon không khả dụng, chưa build/run container Linux. Đã kiểm tra Dockerfile/project path, Release publish và Production process trên Windows.
- Gateway limiter hiện per-process; nhiều Gateway cần WAF/distributed limiter và trusted proxy config. Tách microservices/DB riêng là bước tiếp theo; Gateway đã có cluster để chuyển tuyến.
- FE build còn cảnh báo chunk lớn; unit UI còn cảnh báo act/jsdom/Astryx test environment. Tất cả assertion qua.

Tài liệu: `_Docs/ONEPORTAL_MULTI_TENANCY.md` và README root. Thay đổi source còn trong working tree.

Đã dừng API/Gateway/storage fixture/PostgreSQL kiểm thử và xóa ba database disposable local của task. Giữ backup mã hóa và báo cáo; không xóa database Supabase.
