# KẾ HOẠCH TRIỂN KHAI PRODUCTION CHO CODEX — CHỐT TENANT #01 & PHOTO #01

> **Tài liệu này là spec bàn giao cho Codex để code trực tiếp vào `FE_Tenant`, `FE_PhotoPrint`, và `BE`** dựa trên 2 bản thiết kế UI đã được người dùng duyệt và kiểm thử trên trình duyệt.
> **Không sửa chéo thư mục workspace của agent khác**: đọc tài liệu này từ `PromtAI/.gemini/results/` và triển khai vào mã nguồn `FE_Tenant/`, `FE_PhotoPrint/`, `BE/`.

---

## 0. BẢN MẪU HTML ĐÃ CHỐT (NGUỒN THAM CHIẾU GIAO DIỆN 1:1)

1. **`FE_Tenant` -> Mẫu #01 (Command Rail & Bento)**:
   - File tham chiếu: `PromtAI/.gemini/results/ui-previews/tenant/01-command-rail.html`
   - Định hướng: Dark Raycast theme (`#09090f` canvas, `#13131c` surface, `#1b1b28` subtle, `#262636` line, `#8b5cf6` violet accent), thanh rail dọc `68px` bên trái, thanh Command Search `⌘K`, chip chuyển nhanh công ty (`cr-switcher`), lưới Bento 12 cột (`5 + 7 + 12`), hiệu ứng radial glow `--mx / --my` và modal top-layer (`<dialog>`).
2. **`FE_PhotoPrint` -> Mẫu #01 (Stride 3D Print Board & VietQR Edition)**:
   - File tham chiếu: `PromtAI/.gemini/results/ui-previews/photo/01-stride-3d-travelling.html`
   - Định hướng nghiệp vụ **Tiệm In ảnh & Photocopy Việt Nam**:
     - Nhóm dịch vụ trọng tâm tại quầy: **In ảnh thẻ lấy liền 15p** (3×4 / 4×6 / Visa / hộ chiếu cắt sẵn + gửi file mềm Zalo), **In ảnh lụa 4R & khổ lớn** (`Fujicolor 260gsm`, từ `3.000đ/tấm` / gói 10 tấm `30.000đ`), **Polaroid & Ép Plastic chống ẩm**, **In màu Laser & Photocopy A4** (Scan PDF, đóng cuốn lò xo, ép dẻo).
     - Nhóm mở rộng đặt trước (`1–2 ngày`): **Khung gỗ sồi & Tranh pha lê** được sắp ở tầng bổ sung (`ĐẶT TRƯỚC`), không che lấp dịch vụ cốt lõi.
     - Hình học 3D & thẻ hiển thị: **Bỏ hoàn toàn dáng túi kẹo dài có mép hàn**, dùng tỉ lệ bảng/thẻ ảnh phẳng vát mép **`1 : 1.36`** (`width : height`), mặt trước là ảnh trong khung giấy `Fujicolor`, mặt sau là bảng thông số & đơn giá quầy khi lật `180°`.
     - Thanh toán & đối soát: Tích hợp **Chuyển khoản Ngân hàng VietQR** + **Ghi nhận giao dịch & Lịch sử giao dịch** (`Transaction Ledger`) từ Storefront tới Admin.

---

## 1. QUY TẮC KIẾN TRÚC BẮT BUỘC KHI CODEX CHỈNH SỬA

1. **Ranh giới Backend (`BE/test/Architecture.Tests/SolutionStructureTests.cs`)**:
   - `BE/src/Contract/Services/V1/<Module>/<Nghiệp vụ>/`: CHỈ được dùng tên file `Command.cs`, `Query.cs`, `Response.cs` (tuyệt đối không đặt tên file khác trong cây `Contract/Services/`).
   - `BE/src/Application/UseCases/V1/Commands/<Module>/<Nghiệp vụ>/` và `.../Queries/<Module>/<Nghiệp vụ>/`: Handler bắt buộc kết thúc bằng `*Handler.cs` (độ sâu thư mục 3 hoặc 4 từ `V1`); Validator bắt buộc kết thúc bằng `*Validator.cs` và nằm trong thư mục con `Validators/` (độ sâu 4 hoặc 5 từ `V1`).
   - `BE/src/Domain/Entities/<Module>/`: Không đặt file `.cs` ở root `Domain/Entities/`. Giữ nguyên tenant scope trên `ApplicationDbContext` (`BE/src/Persistence/ApplicationDbContext.cs`).
2. **Giữ tương thích Test & Accessibility hiện hữu**:
   - Trong `FE_Tenant`, bảo toàn toàn bộ nhãn/role đang được `FE_Tenant/test/app.test.jsx` kiểm tra (`Thêm công ty`, `Tìm công ty`, `Tên công ty`, `Mã workspace`, `Tạo công ty`, `Người dùng`, `Cấu hình`, `Store`, `Cho phép tự đăng ký`, `Lưu cấu hình`, `Thêm người dùng`, `Tạo & cấp quyền`, `Tài khoản đã có`, `Cấp quyền`, `Khóa công ty`, `Xác nhận khóa`, `Chưa có người dùng`, `Đã tạo công ty và khởi tạo dữ liệu nền tảng.`).
   - Trong `FE_PhotoPrint`, bảo toàn khả năng fallback CSS 2.5D của `ThreeStageCanvas.jsx` khi WebGL không khả dụng (được `FE_PhotoPrint/test/interaction.test.jsx` kiểm tra) và `expectedRevision` khi xử lý `409 Conflict` ở `StateEditor.jsx`.
   - Tuân thủ `@media (prefers-reduced-motion: reduce)` trên mọi chuyển động CSS/WebGL.

---

## 2. TRACK A — NÂNG CẤP `FE_Tenant` THEO MẪU #01 (`Command Rail & Bento`)

> **Bổ sung chuyên sâu cho Tenant CRUD, Uninstall App, Xóa công ty & Header Nav Menu Route**: Xem thêm file **[plan-codex-tenant-crud-and-nav-routes.md](file:///c:/Source/TemplateLandingPage/PromtAI/.gemini/results/plan-codex-tenant-crud-and-nav-routes.md)** để triển khai đồng bộ cùng Track A bên dưới.
> *(Lưu ý Backend PhotoPrint: Thư mục `BE` đã có sẵn entity `PhotoPaymentTransaction`, `PhotoPrintStore.Payments.cs` và `PhotoPaymentsApi.cs` — khi code BE Track B hãy rà soát và giữ/bổ sung cấu hình ngân hàng trên `PhotoContactConfig` + seed tiệm photo thay vì tạo trùng file).*

### 2.1. Design Tokens & Layout (`FE_Tenant/src/portal.css` & `FE_Tenant/src/styles.css`)
- Bổ sung bộ biến giao diện từ `01-command-rail.html`:
  - `color-scheme: dark`, `--color-canvas: #09090f`, `--color-paper: #13131c`, `--color-subtle: #1b1b28`, `--color-ink: #f4f4f5`, `--color-muted: #a1a1aa`, `--color-rule: #262636`, `--color-accent: #8b5cf6`, `--color-focus: #a78bfa`, `--radius: 12px`.
  - Trạng thái badge: `ready` (`#10b98122` / `#10b981`), `init` / `portal-pending` (`#f59e0b22` / `#f59e0b`), `locked` / `failed` (`#ef444422` / `#ef4444`).
- Layout `Command Rail`:
  - `.cr-shell`: `grid-template-columns: 68px minmax(0, 1fr)` trên desktop; chuyển sang thanh rail ngang trên mobile (`<= 860px`).
  - `.bento-box`: bo góc `16px`, viền `1px solid var(--line)`, hiệu ứng radial glow `--mx / --my` khi rê chuột (`opacity: 0 -> 1` và tắt nếu `prefers-reduced-motion: reduce`).
  - Đảm bảo `html, body { overflow-x: clip; }` trên mọi breakpoint (`1440px`, `768px`, `390px`, `320px`).

### 2.2. Cấu trúc Component & Điều hướng (`FE_Tenant/src/App.jsx` + `FE_Tenant/src/components/`)
- Tạo / cập nhật các module gọn nhẹ để tách phần trình bày khỏi state trong `App.jsx`:
  1. **`FE_Tenant/src/components/CommandRail.jsx`**: Thanh rail cố định `68px` chứa logo `1P`, nút chuyển section (`Tổng quan Bento`, `Người dùng`, `Cấu hình`, `Store`), nút mở modal `+ Thêm công ty`, và nút `Đăng xuất`.
  2. **`FE_Tenant/src/components/TenantSwitcher.jsx`**: Hàng chip chuyển công ty ngang (`.cr-switcher`) hiển thị tên công ty, mã workspace (`mono`), số người dùng/ứng dụng đang bật, `aria-current="true"` cho công ty đang chọn.
  3. **Bố cục Bento trong `FE_Tenant/src/App.jsx` & `AppStore.jsx`**:
     - Hàng trên bên trái (`5/12` cột): Thẻ **Thông tin Workspace đang chọn** (trạng thái khóa/mở, badge provisioning, nút chuyển nhanh sang `Cấu hình` / `Khóa công ty`).
     - Hàng trên bên phải (`7/12` cột): **`AppStore.jsx` dạng ma trận ứng dụng (`app-matrix`)** cho phép chuyển đổi nhanh giữa `quoting`, `photoprint`, `landing`, cài mới / thử khởi tạo lại, và mở link quản trị.
     - Hàng dưới (`12/12` cột): Khu vực chi tiết cho tab `Người dùng` (`MemberPanel.jsx`), `Cấu hình` (`ApplicationSettings.jsx`), hoặc `Store` (`AppStore.jsx`).
  4. **Command Bar (`⌘K`)**: Thanh tìm kiếm công ty gắn phím tắt `Ctrl+K` / `⌘K` để focus input `Tìm công ty`, giữ nguyên debounce `300ms` gọi `tenantApi.list(...)`.
  5. **Dialog Top-Layer (`FE_Tenant/src/components/Modal.jsx`)**: Đồng bộ style dark surface với `<dialog>` chuẩn (`overscroll-behavior: contain` khi `:modal`, backdrop blur) cho modal `Thêm công ty mới`, `Thêm người dùng`, và `Xác nhận khóa công ty`.

---

## 3. TRACK B — BACKEND `PhotoPrint` CHO DỊCH VỤ TIỆM ẢNH & VIETQR (`BE/`)

> Mục tiêu: Hiện thực hóa phần ghi nhận giao dịch VietQR & cấu hình tài khoản ngân hàng của tiệm (vốn đang là mock state trong bản HTML preview) thành API thật có tenant-isolation.

### 3.1. Domain Entities & Database (`BE/src/Domain/Entities/PhotoPrint/` & `BE/src/Persistence/`)
1. **Mở rộng `PhotoContactConfig.cs`**:
   - Bổ sung cấu hình thanh toán ngân hàng của tiệm:
     - `public bool VietQrEnabled { get; set; }`
     - `public string? BankCode { get; set; }` (vd: `VCB`, `MB`, `TCB`)
     - `public string? BankName { get; set; }`
     - `public string? BankAccountNumber { get; set; }`
     - `public string? BankAccountName { get; set; }`
     - `public string? BankBranch { get; set; }`
   - Cập nhật `PhotoContactConfigConfiguration.cs` (maxLength phù hợp, giá trị mặc định an toàn).
2. **Mở rộng `PhotoOrder.cs`**:
   - Bổ sung trường theo dõi trạng thái thanh toán: `public string PaymentStatus { get; set; } = "Unpaid";` (`Unpaid` | `PendingVerify` | `Paid` | `Refunded`) và `public DateTime? PaidAtUtc { get; set; }`.
3. **Tạo Entity mới `BE/src/Domain/Entities/PhotoPrint/PhotoPaymentTransaction.cs`**:
   - `Id (Guid)`, `OrderId (Guid?)`, `OrderCode (string)`, `TransactionCode (string)` (duy nhất dạng `MTPyyyyMMddXXXX` hoặc `MTP...`), `BankCode (string)`, `BankName (string)`, `BankAccountNumber (string)`, `Amount (decimal)`, `TransferMemo (string)`, `CustomerPhone (string?)`, `Note (string?)`, `Status (string)` (`PendingVerify` | `Verified` | `Rejected`), `VerifiedByUserId (Guid?)`, `CreatedAtUtc (DateTime)`, `VerifiedAtUtc (DateTime?)`, `Revision (int)`.
   - Tạo `BE/src/Persistence/Configurations/PhotoPrint/PhotoPaymentTransactionConfiguration.cs`, đăng ký `DbSet<PhotoPaymentTransaction> PhotoPaymentTransactions => Set<PhotoPaymentTransaction>();` trong `ApplicationDbContext.cs` (kèm tenant query filter/interceptor chuẩn của module PhotoPrint).
   - Tạo EF Core Migration mới trong `BE/src/Persistence/Migrations/` (vd: `AddPhotoVietQrTransactions`).

### 3.2. Cập nhật Dữ liệu Nền Tiệm Ảnh (`BE/src/Persistence/Initialization/PhotoPrintFoundationSeed.cs`)
- Điều chỉnh thứ tự ưu tiên `SortOrder` & sản phẩm mặc định đúng mô hình **tiệm Photocopy & In ảnh lấy liền Việt Nam**:
  - Đưa **Ảnh thẻ lấy liền (`anh-the`)** và **In ảnh lẻ / lụa 4R (`in-anh-10x15`)** lên nhóm ưu tiên đầu (`SortOrder` 1–2, đánh dấu `IsFeatured = true`).
  - Bổ sung danh mục/sản phẩm **In màu & Photocopy A4 (`in-mau-photo-a4`)** (gói in màu laser, photo A4, scan PDF gửi Zalo, đóng cuốn lò xo, ép dẻo/plastic — `ProductionTimeLabel = "Lấy liền 15p"`).
  - Giữ **Polaroid & Ép Plastic (`anh-polaroid`)** ở nhóm lấy trong ngày.
  - Giữ **Khung gỗ sồi**, **Ảnh tráng gương pha lê**, **Tranh canvas**, **Photobook mở phẳng** là nhóm sản phẩm đặt trước (`1–2 ngày`, `IsFeatured` tùy cấu hình, không che dịch vụ lấy liền).
- Seed mặc định thông tin ngân hàng mẫu cho `PhotoContactConfig` khi khởi tạo tenant `photoprint` (ví dụ `MB Bank` / `Vietcombank` để giao diện VietQR chạy được ngay sau provisioning).

### 3.3. Contracts, UseCases & Endpoints (`BE/`)
Tuân thủ tuyệt đối quy ước tên file của `SolutionStructureTests.cs`:
1. **`BE/src/Contract/Services/V1/PhotoPrint/Contact/Response.cs`**:
   - Cập nhật `PhotoContactInput` nhận thêm các trường `VietQrEnabled`, `BankCode`, `BankName`, `BankAccountNumber`, `BankAccountName`, `BankBranch`.
2. **`BE/src/Contract/Services/V1/PhotoPrint/Payments/`**:
   - `Command.cs`:
     - `ConfirmVietQrPaymentCommand(ConfirmVietQrPaymentInput Input) : ICommand<object>;`
     - `VerifyPhotoPaymentCommand(Guid Id, VerifyPhotoPaymentInput Input) : ICommand<object>;`
   - `Query.cs`:
     - `GetPhotoPaymentsQuery(PhotoPaymentFilter Filter) : IQuery<object>;`
   - `Response.cs`:
     - `ConfirmVietQrPaymentInput(string OrderCode, string BankCode, decimal Amount, string TransferMemo, string? CustomerPhone, string? Note)`
     - `VerifyPhotoPaymentInput(string Status, string? StaffNote, int ExpectedRevision)`
     - `PhotoPaymentFilter(string? Search, string? Status, int Page = 1, int PageSize = 20)`
3. **`BE/src/Application/UseCases/V1/`**:
   - Thêm method vào `BE/src/Application/Abstractions/IPhotoPrintStore.cs` và implement trong partial class mới **`BE/src/Persistence/Repositories/PhotoPrint/PhotoPrintStore.Payments.cs`**:
     - `CreateVietQrPaymentAsync`: kiểm tra `OrderCode` hợp lệ trong `PhotoOrders`, kiểm tra `Amount > 0` (khớp `order.GrandTotal` hoặc quy tắc đặt cọc nếu `PaymentMethod == "Deposit"`), sinh mã `TransactionCode`, tạo `PhotoPaymentTransaction` với `Status = "PendingVerify"`, đồng thời cập nhật `order.PaymentStatus = "PendingVerify"`.
     - `GetPaymentsAsync`: chỉ `Admin`, trả danh sách phân trang + thống kê KPI tổng hợp (`totalCount`, `pendingCount`, `verifiedAmount`, `totalRecordedAmount`).
     - `VerifyPaymentAsync`: chỉ `Admin`, kiểm tra `ExpectedRevision` tránh đụng độ đồng thời (`409`), khi chuyển sang `"Verified"` thì cập nhật đồng bộ `order.PaymentStatus = "Paid"` và `order.PaidAtUtc`.
   - Handlers & Validators:
     - `Commands/PhotoPrint/Payments/ConfirmVietQrPaymentCommandHandler.cs` + `Validators/ConfirmVietQrPaymentCommandValidator.cs`
     - `Commands/PhotoPrint/Payments/VerifyPhotoPaymentCommandHandler.cs` + `Validators/VerifyPhotoPaymentCommandValidator.cs`
     - `Queries/PhotoPrint/Payments/GetPhotoPaymentsQueryHandler.cs`
4. **`BE/src/Presentation/APIs/PhotoPrint/PhotoPaymentsApi.cs`**:
   - Map group `/api/v1/photoprint`:
     - `POST /payments/vietqr-confirm` (`AllowAnonymous`, rate-limit / validate theo `OrderCode`)
     - `GET /payments` (`RequireAuthorization(AuthorizationPolicies.AdminOnly)`)
     - `PUT /payments/{id:guid}/verify` (`RequireAuthorization(AuthorizationPolicies.AdminOnly)`)
   - Đảm bảo `GetContactConfigAsync` trả về cả thông tin ngân hàng công khai (`BankCode`, `BankName`, `BankAccountNumber`, `BankAccountName`, `BankBranch`, `VietQrEnabled`) để Storefront render QR thật theo từng tenant.

---

## 4. TRACK C — NÂNG CẤP `FE_PhotoPrint` THEO MẪU #01 (`01-stride-3d-travelling.html`)

### 4.1. Hình học 3D & Bảng ảnh `1:1.36` (`FE_PhotoPrint/src/components/three/`)
- **`FE_PhotoPrint/src/components/three/PhotoMeshFactory.js` & `photoCanvas.js`**:
  - Chuẩn hóa mô hình thẻ/bảng ảnh phẳng tỉ lệ mặc định **`1 : 1.36`** (bỏ hoàn toàn dáng túi kẹo dài hoặc viền hàn miệng túi).
  - Bổ sung hàm dựng geometry **bảng ảnh vát mép nhẹ (`makePrintBoardGeometry`)** với độ dày cạnh tinh gọn, hỗ trợ 2 mặt (`front` + `back`):
    - Mặt trước: nền giấy ảnh `#fcfaf6`, badge dịch vụ (`LẤY LIỀN 15P`, `BÁN CHẠY NHẤT`, `ÉP PLASTIC`, `PHOTOCOPY`, `ĐẶT TRƯỚC`), ảnh thật chiếm ~65% diện tích khung, tên dịch vụ + đơn giá rõ nét.
    - Mặt sau: nền giấy backprint `Fujicolor`, bảng quy cách & đơn giá tại quầy, quy trình gia công và mã tham chiếu quầy.
- **`FE_PhotoPrint/src/components/three/Hero3DShowcase.jsx` & `ThreeStageCanvas.jsx`**:
  - Chuyển preset mặc định Hero sang nhóm dịch vụ trọng tâm tiệm Việt Nam (`Ảnh thẻ 15p`, `Ảnh lụa 4R`, `Polaroid & Ép Plastic`, `In màu & Photo A4`, `Khung & Pha lê (Đặt trước)`).
  - Thêm chế độ **vòng cung 3D tương tác (Hero Arc)** cho phép bấm/kéo chuyển dịch vụ, chuyển màu nền theo vòng tròn tản mềm (`radial mask reveal`), và nút **Lật 180° xem bảng giá mặt sau** ngay trên sân khấu 3D (hạ cấp êm sang `Fallback25DViewer.jsx` nếu WebGL lỗi hoặc tắt bởi `prefers-reduced-motion`).

### 4.2. Design Tokens, Layout & Hệ thống Form đồng bộ toàn `FE_PhotoPrint` (`FE_PhotoPrint/src/index.css` & Layouts)

> Toàn bộ `FE_PhotoPrint` hiện đang dùng bảng màu cũ (`#faf9f4` + xanh rêu `#21564f` + font `Georgia` serif) và style nút 3D vuông. Cần chuyển đồng bộ sang ngôn ngữ thiết kế của **Mẫu #01 (`01-stride-3d-travelling.html`)** trên tất cả trang con, hộp thoại, và biểu mẫu (`@oneportal/uiverse-ui` qua các biến `--uv-*`).

1. **Hệ thống màu sắc & Typography (`FE_PhotoPrint/index.html`, `FE_PhotoPrint/src/index.css`)**:
   - Đổi biến `:root` (chế độ sáng mặc định):
     - `--paper: #f0e8e0` (nền studio kem ấm đồng bộ khu vực Shop ở Home), `--surface: #fcfaf6` (nền card/panel trắng ấm giấy ảnh Fujicolor), `--subtle: #e7dfd5`, `--ink: #1c1a1f`, `--muted: #5e5964`, `--line: #ddd4c8`, `--dark: #191a1e`.
     - Accent chính: `--accent: #1c1a1f`, `--raised: #0f0e12`, `--uv-on-accent: #fcfaf6`, kèm 5 màu pastel theo nhóm dịch vụ (`--flav-mint: #94bdb4` Ảnh thẻ, `--flav-rose: #d396a7` Ảnh lụa 4R, `--flav-lilac: #ab9ac4` Polaroid, `--flav-gold: #d1ad6c` Photo A4, `--flav-oak: #b79474` Khung/Đặt trước).
   - Chế độ tối (`:root.dark`): `--paper: #141418`, `--surface: #1d1d23`, `--subtle: #272730`, `--ink: #f4f1ed`, `--muted: #b0abb6`, `--line: #31313d`, `--accent: #d396a7`, `--uv-on-accent: #1c1a1f`.
   - Font chữ: Nạp `Be Vietnam Pro` (700/800/900 cho heading/`.disp`), `Inter` (400–700 cho nội dung & label), `JetBrains Mono` (`tabular-nums` cho giá tiền, DPI, mã đơn, mã giao dịch VietQR). Thay thế toàn bộ `Georgia` serif cũ bằng `Be Vietnam Pro`.

2. **Chuẩn hóa Hệ thống Form & Shared UI Controls (`FE_PhotoPrint/src/index.css` ghi đè token `--uv-*` từ `packages/uiverse-ui/src/styles.css`)**:
   - Override `--uv-radius: 14px`, `--uv-accent: var(--accent)`, `--uv-surface: var(--surface)`, `--uv-subtle: var(--subtle)`, `--uv-ink: var(--ink)`, `--uv-line: var(--line)`, `--uv-focus: var(--focus)`:
     - **Nút bấm (`.uv-button`)**: Đổi toàn bộ CTA chính (`.uv-button--push3d`, `.uv-button--glow`, `.uv-button--shine`) sang **Studio Pill Button** (`border-radius: 999px`, hover `translateY(-1px)`, active `scale(0.98)`), nút `.uv-button--outline` viền `1.5px solid var(--line)` bo `999px` đồng nhất với `#pay-dlg`, `#cart-dlg`, `#buy` trên Home.
     - **Trường nhập liệu (`.uv-field :is(input, select, textarea)`)**: Bo góc `12px`, `min-height: 44px`, viền `1.5px solid var(--line)`, nền `#ffffff` (dark `#141418`), hover/focus sắc nét không nhảy layout; chuẩn hóa cả `input[type="file"]::file-selector-button` dạng nút pill gọn thay cho nút chọn file thô mặc định của trình duyệt.
     - **Checkbox & Switch (`.uv-check`, `.uv-switch`)**: Bo `12px`, padding `0.5rem 0.75rem`, làm nổi viền `--accent` khi `:has(input:checked)` để người dùng chọn bề mặt giấy / gia công / tự đăng ký trực quan.
     - **Khung Panel, Notice & Tab (`.panel`, `.notice`, `.tabs`, `.tab`, `.modal`)**: `.panel` bo `22px` nền `--surface`; `.tabs` dạng pill container `#ebe4db` giống `.pay-tabs` của Mẫu #01 và `.tab[aria-pressed="true"]` / `.tab.active` chuyển sang nền `#1c1a1f` chữ `#fcfaf6`; `.notice[role="status"]` đồng bộ màu xanh xác nhận của `#pay-toast` (`#dcfce7` / `#166534`), `.notice-error` đỏ gạch rõ nét; `.modal` bo `22px` nền `--surface` kèm nút `Đóng` dạng pill ở góc phải.

3. **Khung dùng chung (`Navbar.jsx`, `Footer.jsx`, `PageHeading.jsx`, `StorefrontLayout.jsx`)**:
   - **`Navbar.jsx`**: Chuyển sang **Floating Pill Navigation** đồng bộ Home (trái: logo tròn đen + tên tiệm; giữa: `.pill` kính mờ chứa link `Trang chủ`, `Sản phẩm`, `Studio 3D`, `Tra cứu đơn`, `Hỗ trợ` và kính lúp tìm kiếm; phải: chip **`Zalo HD`**, nút **`QR Ngân hàng`** / **`Giao dịch`**, theme toggle, tài khoản, và giỏ hàng `#basket-badge`). Mobile `< 820px` giữ drawer gọn hoặc thanh pill nổi đáy màn hình không che nội dung.
   - **`PageHeading.jsx`**: Dùng heading `.disp` (`Be Vietnam Pro`), breadcrumb dạng pill tag `mono` gọn (`Trang chủ / ...`).
   - **`Footer.jsx`**: Nền tối `#191a1e` chữ kem `#f0e8e0` nối tiếp mượt với section Combo 3 ở đáy Home; hiển thị link đặt in, thông tin tiệm, **QR Zalo nhận ảnh HD** và **QR / STK Ngân hàng VietQR mặc định** (khi `vietQrEnabled`).

### 4.3. Trang Home & Danh mục Sản phẩm (`HomePage.jsx`, `ServicesPage.jsx`, `ProductCard.jsx`)
- **`FE_PhotoPrint/src/api/demoCatalog.js` & `FE_PhotoPrint/src/models/photoPrint.js`**:
  - Cập nhật catalog demo khớp với `PhotoPrintFoundationSeed.cs` mới: ưu tiên `Ảnh thẻ lấy liền 15p` (`25.000đ`), `In ảnh lụa 4R` (`3.000đ/tấm` / gói 10 tấm `30.000đ`), `Polaroid ép Plastic` (`45.000đ`), `In màu & Photo A4` (`20.000đ`), xếp `Khung ảnh gỗ sồi` / `Tranh pha lê` vào nhóm `Đặt trước`.
- **`FE_PhotoPrint/src/pages/HomePage.jsx`**:
  - Tái cấu trúc trang chủ 4 tầng theo đúng Mẫu #01:
    1. **Hero Arc 3D (`#flavors`)**: Đổi màu nền theo dịch vụ đang chọn bằng circle wipe, tiêu đề `.disp`, nút next/autoplay.
    2. **Quy trình & Lật mặt sau 180° (`#inside`)**: 4 bước thực tế (`In ảnh & Ảnh thẻ 15p` -> `Bảng giá & Quy cách 180°` -> `Ép Plastic & Photo A4` -> `Thanh toán VietQR 24/7`).
    3. **Bảng giá dịch vụ nhanh (`#shop`)**: Lưới 5 thẻ tỉ lệ **`1 : 1.36`**, có tag thời gian lấy, nút **`+` thêm nhanh vào giỏ**, cùng nút **`Thanh toán VietQR`** và **`Gửi file qua Zalo`**.
    4. **Ghép Combo 3 tiết kiệm 15% (`#range`)**: Nền `#191a1e`, chọn 3 dịch vụ phổ biến vào 3 ô tỏa sáng và thêm combo vào giỏ.
  - Giữ các section bổ trợ (`BeforeAfterSlider`, đường dẫn upload file chi tiết tại `/services`) gọn phía sau mà không phá nhịp Hero.
- **`FE_PhotoPrint/src/components/common/ProductCard.jsx`**:
  - Chuẩn hóa toàn bộ thẻ sản phẩm dùng lại ở `/services` và trang chủ theo cùng tỉ lệ ảnh **`1 : 1.36`** (bỏ `aspect-ratio: 1.19`), bổ sung **accent header stripe / badge pill** (`LẤY LIỀN 15P` / `ĐẶT TRƯỚC`), giá `mono tabular-nums`, nút `Đặt in` dạng pill + icon xem `3D`.
- **`FE_PhotoPrint/src/pages/ServicesPage.jsx` (`/services`)**:
  - Thay `.filter-bar` cứng thành thanh **Category Pastel Filter Chips** (chọn nhanh `Tất cả`, `Ảnh thẻ 15p`, `In ảnh lụa 4R`, `Polaroid & Plastic`, `Photo & In A4`, `Khung & Đặt trước`) + ô tìm kiếm / sắp xếp đồng bộ chiều cao `44px`.

### 4.4. Đồng bộ các trang Chi tiết, Upload, Studio 3D, Giỏ hàng, Checkout, Tra cứu & Auth
1. **`FE_PhotoPrint/src/pages/ServiceDetailPage.jsx` + `BatchPhotoUploader.jsx` + `PhotoCropModal.jsx`**:
   - Khung trái (`.detail-media`): Tab chuyển đổi pill (`Ảnh mẫu` / `Ảnh của bạn`), hộp kéo thả ảnh `BatchPhotoUploader` bo `18px` viền dashed theo màu dịch vụ, danh sách `photo-row` bo `14px` hiển thị badge DPI sắc nét + input số bản in gọn + nút sửa cắt ảnh.
   - `PhotoCropModal.jsx`: Khung kéo ảnh giữ `aspect-ratio` thực tế, toàn bộ thanh trượt `range`, select `Fit/Fill`, select phông/viền Polaroid và textarea `Ghi chú retouch` dùng chuẩn form token mới bo `12px`, nút áp dụng dạng pill `#1c1a1f`.
   - Khung phải (`form.configurator`): Card bo `22px` nền `#fcfaf6`, bộ chọn cỡ ảnh (`10×15`, `3×4`, `4×6`...) dùng `.tab` kiểu pill, bảng tính giá `.price-summary` thiết kế theo thẻ spec mặt sau của Mẫu #01 (`tabular-nums`), nút `Thêm vào giỏ` pill đen kèm nút `Gửi file Zalo`.
2. **`FE_PhotoPrint/src/pages/DemoStudioPage.jsx` (`/demo`)**:
   - Đưa canvas 3D lên thẻ `.studio-stage` bo `22px` nền gradient `#f0e8e0` (hoặc `#191a1e` khi bật đèn vàng), toolbar trên/dưới dạng pill bar, form cấu hình bên phải (`aside.panel.form-stack`) bo `22px` đồng bộ `ServiceDetailPage`, bổ sung công tắc **Lật mặt sau xem thông số 180°**, lưới thư viện mẫu bên dưới dùng thẻ tỉ lệ `1 : 1.36`.
3. **`FE_PhotoPrint/src/pages/CartPage.jsx` (`/cart`)**:
   - Danh sách `cart-item` dạng thẻ bo `18px`, thumbnail tỉ lệ `1:1.36`, cảnh báo ảnh `< 150 DPI`, ô summary bên phải đồng nhất cấu trúc `#cart-dlg` của Mẫu #01 với CTA pill **`Tiếp tục đặt in & VietQR`**.
4. **`FE_PhotoPrint/src/pages/CheckoutPage.jsx` (`/checkout`) & `OrderTrackingPage.jsx` (`/orders/track`)**:
   - Form `CheckoutPage` chia nhóm field gọn (`Thông tin khách`, `Cách nhận ảnh`, `Phương thức thanh toán` mặc định nhấn mạnh **`Chuyển khoản VietQR`**), card `Đơn in của bạn` căn phải chuẩn `tabular-nums`. Khi đặt đơn chọn `VietQr`, chuyển mượt ngay sang `VietQrPaymentPanel` để quét QR và ghi nhận giao dịch.
   - `OrderTrackingPage.jsx`: Form tra cứu `Mã đơn` + `Số điện thoại` đồng bộ panel bo `22px`; vùng kết quả bổ sung badge **`Trạng thái thanh toán VietQR`** (`Unpaid` / `PendingVerify` / `Paid`) và nút mở **`Thanh toán VietQR`** nếu đơn chưa ghi nhận thanh toán.
5. **`FE_PhotoPrint/src/pages/SupportPage.jsx`, `CredentialsPage.jsx`, `NotFoundPage.jsx`**:
   - `SupportPage.jsx`: 3 thẻ cam kết bo `18px`, form `Gửi yêu cầu` (kèm upload ảnh lỗi) & form `Tra cứu yêu cầu hỗ trợ` dùng panel bo `22px` + nút pill, FAQ accordion hairline bo góc gọn.
   - `CredentialsPage.jsx`: Card `.auth-panel` căn giữa đẹp (logo tròn `MINH TÂM`, tiêu đề `.disp`, input bo `12px`, nút `Đăng nhập` / `Đăng ký` / `Vào quản trị demo` pill `#1c1a1f`, giữ nguyên 100% nhãn form hiện có).

### 4.5. Thành phần Thanh toán VietQR & Ghi nhận Giao dịch (`FE_PhotoPrint/`)
1. **API Client mới `FE_PhotoPrint/src/api/photoPaymentApi.js`**:
   - `confirmVietQr(payload)` -> `POST /api/v1/photoprint/payments/vietqr-confirm` (có fallback sang `photoDemoApi` / localStorage trong `--mode demo` như `demoTransport.js`).
   - `list(params, signal)` -> `GET /api/v1/photoprint/payments`
   - `verify(id, payload)` -> `PUT /api/v1/photoprint/payments/{id}/verify`
2. **Component VietQR dùng chung `FE_PhotoPrint/src/components/payment/VietQrPaymentPanel.jsx`**:
   - Tái hiện giao diện `#pay-dlg` từ Mẫu #01: gồm segmented tabs (`1. Quét mã VietQR` · `2. Biên lai đã ghi nhận`), hàng bank pills (`Vietcombank`, `MB Bank`, `Techcombank`), khung QR dùng thư viện `qrcode` (`^1.5.4`) render từ cấu hình ngân hàng `ContactConfigContext.jsx`, các dòng copy **`Chép STK`** / **`Chép mã`** nội dung chuyển khoản (`orderCode + IN ANH`), ô nhập SĐT Zalo & ghi chú.
   - Nút **`Xác nhận đã chuyển khoản & Ghi nhận giao dịch`** gọi `photoPaymentApi.confirmVietQr(...)`, hiện banner xác nhận xanh và biên lai giao dịch mới (`PendingVerify`).

### 4.6. Đồng bộ Hệ thống Admin & Form Quản trị (`FE_PhotoPrint/src/pages/admin/`)
- **`AdminLayout.jsx` & `SettingsNavigation.jsx`**:
  - Đồng bộ sidebar quản trị theo style pill/card (`#f0e8e0` nền, `.admin-sidebar` bo `20px` nền `#fcfaf6`, link đang chọn bôi đen pill `#1c1a1f` chữ `#fcfaf6`), bổ sung mục menu **`Giao dịch QR` (`/admin/payments`)** vào `menus`.
- **`AdminDashboardPage.jsx`**:
  - Nâng cấp 4+ thẻ KPI `.metric` theo Bento card bo `20px` số `mono` cỡ lớn, bổ sung KPI **Tổng thu VietQR** và **Giao dịch chờ đối soát** cùng danh sách rút gọn.
- **`AdminOrdersPage.jsx` & `StateEditor.jsx`**:
  - Hiển thị thêm badge `PaymentStatus` trên từng dòng đơn in; trong modal `StateEditor.jsx` (bo `22px`), hiển thị kèm thông tin biên lai VietQR (nếu có) ngay phía trên form cập nhật trạng thái (`expectedRevision`).
- **`AdminPaymentsPage.jsx` (Trang mới + route `/admin/payments`)**:
  - Tái hiện trọn vẹn tab `2. Lịch sử giao dịch` từ Mẫu #01 cho nhân viên quầy: thẻ KPI `Tổng giao dịch / Chờ đối soát / Tổng doanh thu VietQR`, thanh lọc theo trạng thái & tìm kiếm mã GD / SĐT, nút **`Đánh dấu đã đối soát & hoàn tất`** (`photoPaymentApi.verify(...)` kèm `expectedRevision` xử lý xung đột 409).
- **`AdminCatalogPage.jsx` (`CatalogEditor`), `AdminSupportBoardPage.jsx`, `AdminContactSettingsPage.jsx`, `AdminWorkspacePage.jsx`**:
  - `CatalogEditor` & `Rows`: Form thêm/sửa sản phẩm, danh mục và mẫu 3D giữ nguyên logic validation, nâng cấp `.editor-row` bo `14px` rõ ràng ranh giới từng hàng cỡ ảnh / bề mặt / gia công / bậc giảm giá và nút `Thêm dòng` / `Xóa dòng` pill nhỏ.
  - `AdminContactSettingsPage.jsx`: Bổ sung form nhóm **Cấu hình VietQR & Ngân hàng nhận tiền** (`VietQrEnabled`, `BankCode`, `BankName`, `BankAccountNumber`, `BankAccountName`, `BankBranch`) xem thử QR ngay trong form song song với form Zalo / Messenger.
  - `AdminSupportBoardPage.jsx` & `AdminWorkspacePage.jsx`: Thẻ Kanban ticket, danh sách thành viên và form `Members` / `RegistrationForm` thừa hưởng toàn bộ `.panel` bo `22px`, pill badge trạng thái và nút bấm chuẩn Mẫu #01.

---

## 5. THỨ TỰ THỰC THI KHUYẾN NGHỊ CHO CODEX

1. **Bước 1 — Backend Schema & Contracts (`BE`)**:
   - Cập nhật `PhotoContactConfig`, `PhotoOrder`, thêm `PhotoPaymentTransaction`, EF Configuration, DbContext & Migration.
   - Thêm Contracts + Handlers + Validators + `PhotoPaymentsApi.cs` tuân thủ `SolutionStructureTests.cs`.
   - Cập nhật `PhotoPrintFoundationSeed.cs` ưu tiên Ảnh thẻ, In ảnh 4R, Polaroid, In màu & Photo A4.
2. **Bước 2 — `FE_Tenant` (#01 Command Rail & Bento)**:
   - Cập nhật `portal.css`, `App.jsx`, `AppStore.jsx`, thêm `CommandRail.jsx` & `TenantSwitcher.jsx`. Chạy test đảm bảo không vỡ selector của `test/app.test.jsx`.
3. **Bước 3 — `FE_PhotoPrint` Design System, Form Controls & Shell**:
   - Cập nhật font trong `FE_PhotoPrint/index.html` (`Be Vietnam Pro`, `Inter`, `JetBrains Mono`) và hệ tokens + `--uv-*` form overrides trong `FE_PhotoPrint/src/index.css` (nút pill `#1c1a1f`, input/select/textarea/file `44px` bo `12px`, panel bo `22px`, tabs pill, notice/error/modal).
   - Đồng bộ `Navbar.jsx` (Floating Pill Nav + badge `Giao dịch`/`Zalo HD`), `Footer.jsx` (nền tối `#191a1e`), `PageHeading.jsx`, `Modal.jsx`, `ProductCard.jsx` (`1:1.36`).
4. **Bước 4 — `FE_PhotoPrint` Trang Home 3D (`1:1.36`) & Đồng bộ Trang Storefront + Form**:
   - Nâng cấp `PhotoMeshFactory.js`, `photoCanvas.js`, `Hero3DShowcase.jsx`, `HomePage.jsx`, `demoCatalog.js` theo Mẫu #01.
   - Đồng bộ giao diện & form các trang con: `ServicesPage.jsx` (Category Pastel Chips), `ServiceDetailPage.jsx` + `BatchPhotoUploader.jsx` + `PhotoCropModal.jsx`, `DemoStudioPage.jsx` (kèm nút lật 180°), `CartPage.jsx`, `CheckoutPage.jsx` + `VietQrPaymentPanel.jsx`, `OrderTrackingPage.jsx`, `SupportPage.jsx`, `CredentialsPage.jsx`, `NotFoundPage.jsx`.
5. **Bước 5 — `FE_PhotoPrint` Trang Admin & Đối soát Giao dịch VietQR**:
   - Thêm `photoPaymentApi.js`, `AdminPaymentsPage.jsx` + route `/admin/payments`.
   - Đồng bộ UI & form của `AdminLayout.jsx`, `SettingsNavigation.jsx`, `AdminDashboardPage.jsx`, `AdminOrdersPage.jsx` + `StateEditor.jsx`, `AdminCatalogPage.jsx` (`CatalogEditor` + `.editor-row`), `AdminContactSettingsPage.jsx` (khối ngân hàng VietQR), `AdminSupportBoardPage.jsx`, `AdminWorkspacePage.jsx`.
6. **Bước 6 — Cập nhật & bổ sung Test**:
   - `BE`: UnitTest + ArchitectureTest + IntegrationTest (`PhotoPrintFlowIntegrationTests.cs`) phủ case confirm VietQR, lệch số tiền, admin verify & conflict `409`.
   - `FE_Tenant`: Bổ sung test `CommandRail` + `⌘K` search + `AppStore` matrix vào `FE_Tenant/test/app.test.jsx`.
   - `FE_PhotoPrint`: Bổ sung test `VietQrPaymentPanel` + luồng xác nhận giao dịch checkout + `AdminPaymentsPage` verify + giữ nguyên khả năng fallback WebGL của `ThreeStageCanvas` trong `FE_PhotoPrint/test/interaction.test.jsx`.

---

## 6. LỆNH KIỂM CHỨNG SAU KHI CODEX HOÀN TẤT

```powershell
# 1. Kiểm tra Backend (Build + Architecture Tests + Unit Tests)
cd c:\Source\TemplateLandingPage\BE
dotnet build OnePortal.sln
dotnet test test\Architecture.Tests\OnePortal.Architecture.Tests.csproj
dotnet test test\UnitTests\OnePortal.UnitTests.csproj

# 2. Kiểm tra FE_Tenant (Unit Test + Production Build)
cd c:\Source\TemplateLandingPage\FE_Tenant
npm test
npm run build

# 3. Kiểm tra FE_PhotoPrint (Unit Test + Production Build)
cd c:\Source\TemplateLandingPage\FE_PhotoPrint
npm test
npm run build
```

> **Lưu ý kiểm tra trực quan (Visual & Responsive QA)**: Sau khi build, kiểm tra không tràn ngang (`scrollWidth <= innerWidth`) ở `1440px`, `768px`, `390px`, `320px` trên toàn bộ route (`/`, `/services`, `/services/:slug`, `/demo`, `/cart`, `/checkout`, `/orders/track`, `/support`, `/login`, `/admin/*`); kiểm tra chế độ Sáng/Tối (`:root.dark`), trạng thái focus/error/success trên mọi form (`UiverseInput`, `select`, `file`, `modal`), thẻ 3D `1:1.36` và luồng VietQR -> Lịch sử giao dịch Admin.
