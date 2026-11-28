# KẾ HOẠCH BỔ SUNG CHO CODEX — TENANT FULL CRUD, UNINSTALL APP, XÓA CÔNG TY & HEADER NAV MENU ROUTE

> **Mục tiêu**: Khắc phục toàn bộ khoảng trống nghiệp vụ và điều hướng trên `FE_Tenant` + module `Tenancy` (`BE`), đồng thời giữ đúng ngôn ngữ thiết kế **Tenant #01 (`01-command-rail.html`)** đã chốt.
> **File plan liên quan**: [plan-codex-implement-tenant-photo.md](file:///c:/Source/TemplateLandingPage/PromtAI/.gemini/results/plan-codex-implement-tenant-photo.md).

---

## 1. BẢNG ĐỐI CHIẾU HIỆN TRẠNG VS NHỮNG GÌ CẦN BỔ SUNG (ĐÃ RÀ SOÁT TỪ CODE)

| Nhóm chức năng | Hiện có trong `FE_Tenant` / `BE` (`Tenancy`) | Đang thiếu & Cần bổ sung |
|---|---|---|
| **Công ty (`Tenant`)** | Create (`POST /platform/tenants`), Read/Search (`GET /platform/tenants`), Update tên & khóa/mở (`PUT /platform/tenants/{tenantId}`). | **1) Read chi tiết (`GET .../tenants/{id}`) theo route**, **2) Delete công ty tạo nhầm (`DELETE /api/v1/platform/tenants/{tenantId}`)** có xác nhận nhập lại `key` & dọn sạch các bảng con có `DeleteBehavior.Restrict`. |
| **Ứng dụng (`AppStore` & `TenantApplication`)** | Install / Enable (`PUT .../applications/{appKey}` với `isEnabled: true`), Config `allowSelfRegistration`, Retry Provisioning. | **Nút `Uninstall / Gỡ cài đặt`** trong `AppStore.jsx` & `ApplicationSettings.jsx` + **Endpoint `DELETE /api/v1/platform/tenants/{tenantId}/applications/{appKey}`** với 2 tùy chọn (tắt quyền / gỡ sạch dữ liệu & membership của riêng app đó). |
| **Thành viên (`TenantMembership` & `User`)** | List (`GET .../members`), Create tài khoản + gán quyền (`POST .../members`), Update `role` & `isActive` (`PUT .../members`). | **1) Delete/Gỡ thành viên khỏi app (`DELETE .../members/{userId}`)** (giữ chốt chặn không gỡ Admin cuối cùng `TenancyErrors.LastAdmin`), **2) Sửa tên hiển thị / đặt lại mật khẩu tạm** cho thành viên từ UI. |
| **Điều hướng & Header (`FE_Tenant`)** | Dùng `useState` + `?tenant=...&view=store`; chưa cài `react-router-dom`; Header chỉ có Logo + nút `Đăng xuất`. | **Cập nhật Header dạng Nav Menu Route (`react-router-dom`)** với `<NavLink>` highlight theo URL (`/overview`, `/tenants`, `/tenants/:tenantKey/apps`, `/tenants/:tenantKey/members`, `/tenants/:tenantKey/settings`), giữ deep-link và nút Back/Forward. |

---

## 2. BACKEND CRUD BỔ SUNG (`BE` — MODULE `Tenancy`)

Tuân thủ `AGENTS.md` và `BE/test/Architecture.Tests/SolutionStructureTests.cs` (`Command.cs`, `Query.cs`, `Response.cs` trong `Contract`; `*Handler.cs` và `Validators/*Validator.cs` trong `Application`).

### 2.1. Bổ sung Contracts (`BE/src/Contract/Services/V1/Tenancy/`)
1. **`Query.cs`**:
   - `GetTenantDetailQuery(Guid TenantId) : IQuery<TenantDto>;` (trả chi tiết 1 công ty để route `/tenants/:tenantKey/...` hoạt động ổn định kể cả khi công ty nằm ngoài trang tìm kiếm hiện tại).
2. **`Command.cs`**:
   - `DeleteTenantCommand(Guid TenantId, string ConfirmKey, bool Force = false) : ICommand<Unit>;` (hoặc `Result` chuẩn hiện có của module Tenancy).
   - `UninstallTenantApplicationCommand(Guid TenantId, string AppKey, bool PurgeData = false) : ICommand<TenantDto>;`
   - `RemoveTenantMemberCommand(Guid TenantId, string AppKey, Guid UserId) : ICommand<Unit>;`
   - `UpdateTenantMemberProfileCommand(Guid TenantId, string AppKey, Guid UserId, string FullName, string? NewPassword) : ICommand<TenantMemberDto>;`

### 2.2. Xử lý Safe Cascade & Isolation trong `TenantStore.cs` (`BE/src/Persistence/Repositories/Tenancy/TenantStore.cs`)
> **Lưu ý kiến trúc quan trọng**: Trong `BE/src/Persistence/ApplicationDbContext.cs` (dòng 89), mọi `ITenantEntity` đều gắn FK tới `Tenant` với `DeleteBehavior.Restrict`. Nếu gọi `database.Tenants.Remove(tenant)` trực tiếp sẽ bị PostgreSQL chặn lỗi khóa ngoại (`23503`).

1. **`DeleteAsync(Guid tenantId, string confirmKey, bool force, CancellationToken ct)`**:
   - Tìm `tenant` theo `tenantId`; nếu không có trả `TenancyErrors.NotFound`.
   - Kiểm tra `string.Equals(confirmKey?.Trim(), tenant.Key, StringComparison.OrdinalIgnoreCase)` — nếu sai trả lỗi validation rõ ràng `"Mã xác nhận không khớp với mã workspace."`.
   - Trong `CreateExecutionStrategy()` + `BeginTransactionAsync()`:
     - Kiểm tra nếu công ty đã phát sinh đơn hàng/báo giá/bản xuất bản (`PhotoOrders`, `PhotoPaymentTransactions`, `Quotations`, `UserCustomizations`) và `force == false` -> trả `Conflict/Validation` yêu cầu tick xác nhận `"Xóa toàn bộ dữ liệu phát sinh"` (hoặc khóa thay vì xóa).
     - Xóa sạch theo đúng thứ tự **con -> cha** với `IgnoreQueryFilters()` lọc đúng `.Where(x => x.TenantId == tenantId)`:
       - **PhotoPrint**: `PhotoPaymentTransactions` -> `PhotoOrderItems` -> `PhotoOrders` -> `PhotoDemos` -> `PhotoProducts` -> `PhotoCategories` -> `PhotoSupportRequests` -> `PhotoContactConfigs`.
       - **Quoting**: `QuotationHistories` -> `QuotationItems` -> `QuotationFiles` -> `Quotations` -> `QuotationTemplateVersions` -> `QuotationTemplates` -> `QuotingCustomers` -> `QuotingProducts` -> `QuotingProductGroups` -> `QuotingSupportRequests`.
       - **Landing / Chung**: `CustomizationSlugAliases` -> `CustomizationVersions` -> `UserCustomizations`, `Products`, `Categories`, `NavigationMenus`, `Templates`, `RsvpEntries`, `GuestbookEntries`.
       - **Tenancy**: `TenantMemberships`, `TenantSeedHistory`, `TenantApplications`, cuối cùng xóa `Tenants`.
     - **Tuyệt đối không xóa `Users`** (tài khoản người dùng là `GlobalEntity`, có thể đang dùng ở công ty khác).

2. **`UninstallApplicationAsync(Guid tenantId, string appKey, bool purgeData, CancellationToken ct)`**:
   - Kiểm tra `tenant` & `TenantApplication` tương ứng.
   - Nếu `purgeData == false` (gỡ nhẹ / tắt cài đặt): cập nhật `application.Configure(isEnabled: false, allowSelfRegistration: false)` hoặc xóa `TenantApplication` + `TenantMemberships` của `(tenantId, appKey)` để `AppStore` hiển thị lại trạng thái **`Chưa cài`** (và không để sót thành viên truy cập app đã gỡ).
   - Nếu `purgeData == true` (gỡ cài đặt & xóa sạch dữ liệu app): dùng `IgnoreQueryFilters()` xóa các bảng thuộc riêng module `appKey` đó (`photoprint` / `quoting` / `landing`) + `TenantSeedHistory` có `TenantId == tenantId && AppKey == appKey` + `TenantMemberships` + `TenantApplication`. Các app khác cùng công ty không bị ảnh hưởng.

3. **`RemoveMembershipAsync(Guid tenantId, string appKey, Guid userId, CancellationToken ct)` & `UpdateMemberProfileAsync(...)`**:
   - Dùng advisory lock `pg_advisory_xact_lock` giống `SetMembershipAsync` (dòng 138 `TenantStore.cs`).
   - Nếu thành viên bị gỡ đang là `Admin` hoạt động duy nhất của `(tenantId, appKey)`, trả `TenancyErrors.LastAdmin`.
   - Ngược lại xóa dòng `TenantMembership` khỏi DB (không xóa `User` toàn cục).
   - `UpdateMemberProfileAsync`: cho phép Platform Admin cập nhật `FullName` (hoặc đặt lại mật khẩu băm mới nếu nhập `NewPassword >= 8` ký tự) cho `User` thuộc member của tenant/app đó.

### 2.3. Endpoints mới trong `TenantApi.cs` (`BE/src/Presentation/APIs/Tenancy/TenantApi.cs`)
Trên group `platform = app.MapGroup("/api/v1/platform/tenants").RequireAuthorization("PlatformAdmin")`:
- `GET /{tenantId:guid}` -> `GetTenantDetailQuery`
- `DELETE /{tenantId:guid}` -> `DeleteTenantCommand` (nhận `confirmKey` & `force` qua body/query)
- `DELETE /{tenantId:guid}/applications/{appKey}` -> `UninstallTenantApplicationCommand` (nhận `purgeData`)
- `PUT /{tenantId:guid}/applications/{appKey}/members/{userId:guid}` -> `UpdateTenantMemberProfileCommand`
- `DELETE /{tenantId:guid}/applications/{appKey}/members/{userId:guid}` -> `RemoveTenantMemberCommand`

---

## 3. FRONTEND `FE_Tenant` — HEADER NAV MENU ROUTE & FULL CRUD UI

### 3.1. Cài đặt Router & Cấu trúc Header Nav Menu Route (`FE_Tenant/`)
1. **Cài `react-router-dom` (`^7.2.0`)** vào `FE_Tenant/package.json`, bọc `<BrowserRouter>` trong `FE_Tenant/src/main.jsx`.
2. **Định nghĩa Routes trong `FE_Tenant/src/routes/paths.js` & `AppRoutes.jsx`**:
   - `/overview` (và `/` redirect sang `/overview`) -> Trang **Tổng quan Bento** (Workspace Switcher, trạng thái hệ thống, App Matrix, tác vụ nhanh).
   - `/tenants` -> Trang **Quản lý Công ty** (Danh sách tìm kiếm `GET /platform/tenants`, tạo mới, đổi tên, khóa/mở, **Xóa công ty**).
   - `/tenants/:tenantKey/apps` (hoặc `/apps` theo tenant đang chọn) -> **`AppStore.jsx`** (Cài mới, Cấu hình, Mở quản trị, **`Uninstall / Gỡ cài đặt`**).
   - `/tenants/:tenantKey/members` -> **`MemberPanel.jsx`** (Thêm mới / gán user, sửa vai trò, khóa/mở quyền, sửa họ tên/mật khẩu, **Xóa khỏi app**).
   - `/tenants/:tenantKey/settings` -> **`ApplicationSettings.jsx`** (Bật/tắt tự đăng ký, chạy lại seed, đổi tên/khóa công ty, và **Vùng nguy hiểm: Gỡ ứng dụng & Xóa công ty**).
   - Giữ tương thích ngược query string `?tenant=...&view=store`: tự điều hướng sang `/tenants/:tenantKey/apps` nếu có param cũ.
3. **Cập nhật Header Tenant dạng Nav Menu Route (`FE_Tenant/src/components/PortalHeader.jsx` + `CommandRail.jsx` giữ tinh thần Mẫu #01)**:
   - Thanh **Top Header Bar (`.portal-header`)** bố trí thành 3 vùng cân đối (giữ nền `#0c0c12` / viền `#262636` chuẩn Mẫu #01):
     - **Trái**: Brand logo `OnePortal` + Badge chọn nhanh **Workspace hiện tại** (click mở nhanh danh sách đổi tenant).
     - **Giữa — Nav Menu Route (`<nav aria-label="Điều hướng quản trị">`)**: Các `<NavLink>` pill bo tròn highlight mục đang đứng theo route thật:
       - `Tổng quan` (`/overview`)
       - `Công ty` (`/tenants`)
       - `App Store` (`/tenants/${key}/apps`)
       - `Thành viên` (`/tenants/${key}/members`)
       - `Cấu hình` (`/tenants/${key}/settings`)
     - **Phải**: Ô tìm nhanh `⌘K`, nút `+ Tạo công ty`, nút `Đăng xuất`.
   - **Kết hợp với `CommandRail` bên trái (`68px` desktop, ẩn gọn hoặc thu ngang trên mobile `< 860px`)** để toàn giao diện khớp 100% thiết kế #01 mà vẫn có thanh Nav Menu Route ở Header đúng yêu cầu người dùng.

### 3.2. Cập nhật `FE_Tenant/src/api/tenantApi.js`
Bổ sung các hàm gọi API mới:
- `detail: (tenantId, signal) => client.get("/platform/tenants/" + tenantId, { signal })`
- `remove: (tenantId, payload) => client.delete("/platform/tenants/" + tenantId, { data: payload })`
- `uninstall: (tenantId, appKey, purgeData = false) => client.delete("/platform/tenants/" + tenantId + "/applications/" + appKey, { params: { purgeData } })`
- `updateMemberProfile: (tenantId, appKey, userId, value) => client.put("/platform/tenants/" + tenantId + "/applications/" + appKey + "/members/" + userId, value)`
- `removeMember: (tenantId, appKey, userId) => client.delete("/platform/tenants/" + tenantId + "/applications/" + appKey + "/members/" + userId)`

### 3.3. Nâng cấp Đầy đủ CRUD trên các Màn hình UI (`FE_Tenant/src/components/` & Pages)
1. **`AppStore.jsx` — Bổ sung nút `Uninstall / Gỡ cài đặt`**:
   - Với ứng dụng đang bật/đã cài (`record?.isEnabled`):
     - Giữ nút **`Cấu hình`**, **`Mở quản trị`**.
     - Bổ sung nút **`Gỡ cài đặt`** (outline danger `#ef4444` rõ ràng).
     - Khi bấm `Gỡ cài đặt` -> mở **`Modal` xác nhận**:
       - Hiển thị tên app & tên công ty.
       - Checkbox tùy chọn: *"Xóa luôn toàn bộ dữ liệu nghiệp vụ & thành viên của ứng dụng này (`PurgeData`)"*.
       - Yêu cầu xác nhận -> gọi `tenantApi.uninstall(...)`, hiện thông báo `"Đã gỡ cài đặt <tên app>."` và cập nhật lại thẻ app về trạng thái `Chưa cài` + nút `Cài ứng dụng`.
2. **Xóa công ty khi đã tạo nhầm (`ApplicationSettings.jsx` + `TenantsPage.jsx`)**:
   - Thêm card **Vùng nguy hiểm — Xóa công ty** ở đáy mục `Cấu hình` (và nút `Xóa` trên danh sách công ty ở `/tenants`).
   - Khi bấm **`Xóa công ty`**: mở **`Modal` xác nhận 2 bước**:
     - Cảnh báo công ty sẽ bị xóa vĩnh viễn kèm ứng dụng, phân quyền thành viên và tùy chọn xóa dữ liệu phát sinh (`Force`).
     - Bắt buộc gõ chính xác **mã workspace (`tenant.key`)** vào input `Nhập lại mã workspace để xác nhận`; nút **`Xác nhận xóa công ty`** chỉ enabled khi khớp chính xác.
     - Sau khi xóa thành công: xóa khỏi state danh sách, tự chuyển sang công ty kế tiếp (hoặc trạng thái rỗng `+ Thêm công ty`), điều hướng mượt về `/tenants`.
   - Giữ nguyên luồng **`Khóa công ty` -> `Xác nhận khóa`** hiện có để không phá test `app.test.jsx`.
3. **`MemberPanel.jsx` — Hoàn thiện Member CRUD (Thêm / Sửa / Khóa / Xóa)**:
   - Trên mỗi dòng `.member-row`, bên cạnh `<select>` đổi vai trò (`User` / `Admin`) và nút `Khóa quyền` / `Mở quyền`, bổ sung:
     - Nút **`Sửa`**: mở modal sửa `Họ tên` & tùy chọn `Đặt lại mật khẩu mới`.
     - Nút **`Xóa`** (gỡ khỏi app): mở modal xác nhận gỡ thành viên khỏi ứng dụng hiện tại (hiển thị lỗi rõ nếu server trả `TenancyErrors.LastAdmin`).

---

## 4. TEST & KIỂM CHỨNG CHO CODEX

1. **Backend (`BE/test/`)**:
   - `Architecture.Tests`: Xác nhận `DeleteTenantCommandHandler`, `UninstallTenantApplicationCommandHandler`, `RemoveTenantMemberCommandHandler` & `Validators/` qua được `SolutionStructureTests.cs` và `TenantArchitectureTests.cs`.
   - `UnitTests` & `IntegrationTests` (`BE/test/IntegrationTests/TenantWorkflowIntegrationTests.cs`):
     - Test cài ứng dụng -> uninstall (`PurgeData = false` và `PurgeData = true`) -> cài lại thành công, không ảnh hưởng app khác.
     - Test tạo công ty nhầm -> xóa công ty (sai `ConfirmKey` trả 400, đúng `ConfirmKey` xóa sạch không dính lỗi FK `Restrict` từ bảng con và không xóa global `User`).
     - Test gỡ thành viên cuối cùng có role `Admin` bị chặn 400/409, gỡ `User` thường thành công.
2. **Frontend (`FE_Tenant/test/app.test.jsx` & `e2e/multi-tenant.spec.js`)**:
   - Đảm bảo **toàn bộ 8+ test case hiện có trong `app.test.jsx` vẫn PASS 100%** (mock thêm `remove`, `uninstall`, `updateMemberProfile`, `removeMember` và bọc router `MemoryRouter` trong helper render test).
   - Bổ sung test mới:
     - Chuyển tab/route trên **Header Nav Menu Route** cập nhật URL và active `aria-current="page"`.
     - Cài xong app hiện nút **`Gỡ cài đặt`**, bấm xác nhận gọi `tenantApi.uninstall`.
     - Xóa công ty chỉ bật nút xác nhận khi gõ đúng `tenant.key` và gọi `tenantApi.remove`.
     - Xóa thành viên gọi `tenantApi.removeMember`.

```powershell
# Chạy kiểm tra sau khi triển khai
cd c:\Source\TemplateLandingPage\BE
dotnet build OnePortal.sln
dotnet test test\Architecture.Tests\OnePortal.Architecture.Tests.csproj
dotnet test test\UnitTests\OnePortal.UnitTests.csproj

cd c:\Source\TemplateLandingPage\FE_Tenant
npm test
npm run build
```
