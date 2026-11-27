# KẾ HOẠCH TRIỂN KHAI CHI TIẾT: E-COMMERCE SHOP IN ẢNH & ẤN PHẨM HÌNH ẢNH (`FE_PhotoPrint` + Module `PhotoPrint`)

> **Mục tiêu**: Xây dựng mới Frontend E-commerce chuyên nghiệp cho **Shop In Ảnh & Ấn phẩm Hình ảnh** (`FE_PhotoPrint`, dev port `5177`, `appKey = "photoprint"`), tích hợp trọn vẹn vào nền tảng **OnePortal** (`.NET 10` Modular Monolith + `YARP Gateway` + `FE_Portal` + `FE_Tenant`), sử dụng **React 19 + Vite 6 + TailwindCSS 3.4** làm nền tảng chính, bộ control/UI tùy biến theo phong cách **Uiverse.io** và trình xem thử sản phẩm ảnh 3D tương tác bằng **Three.js**.

---

## 0. QUYẾT ĐỊNH KIẾN TRÚC & MẶC ĐỊNH ĐỀ XUẤT CHO CODEX

1. **Định vị Domain — Shop In Ảnh (Photo Printing Studio & E-commerce)**:
   - Khác với xưởng in bạt/biển hiệu ngoài trời, trọng tâm của hệ thống là **In ảnh cá nhân, gia đình, ảnh cưới, kỷ niệm & ấn phẩm hình ảnh decor/quảng cáo**:
     - *In ảnh lẻ cỡ chuẩn* (`6x9`, `9x12`, `10x15 / 4R`, `13x18 / 5R`, `15x21 / 6R`, `20x30 / A4`, `30x45`, `40x60`, `60x90 cm`) với lựa chọn giấy lụa/bóng/metallic/ép plastic.
     - *Ảnh Polaroid & Photostrip* (có viền trắng, nhập chữ caption kỷ niệm, set kẹp dây đèn).
     - *Ảnh Ép gỗ / HD Pha lê Tráng gương* & *Tranh Canvas / Khung ảnh để bàn & treo tường*.
     - *Photobook / Album ảnh mở phẳng 180°* (chọn số trang, loại bìa da/vải/cứng).
     - *Ảnh thẻ lấy liền* (`2x3`, `3x4`, `4x6`, Visa) & *Quà tặng / Poster – Standee hình ảnh*.
   - **Nghiệp vụ cốt lõi bắt buộc của Shop In Ảnh**: Upload nhiều ảnh một lượt (**Batch Photo Upload**), **Tự động kiểm tra độ phân giải DPI** so với cỡ ảnh đã chọn (cảnh báo ảnh mờ trước khi in), **Căn khung Fill / Fit (có viền trắng)** + ghi chú retouch từng tấm, và lưu thông số crop + link tải **file ảnh gốc chất lượng cao** cho thợ in trong trang Admin.
2. **Định danh App & Multi-tenant**:
   - Thư mục FE mới: `FE_PhotoPrint/` (dev port `5177`), `APP_KEY = 'photoprint'`, `DEFAULT_TENANT_KEY = 'photoprint-default'`.
   - Schema PostgreSQL riêng: **`photo`**.
3. **Truy cập Khách vãng lai (Guest Photo Shopper)**:
   - Khách vào xem Home, Dịch vụ, Upload ảnh & Tính giá, Demo 3D, Giỏ hàng, Đặt in, Tra cứu đơn và Gửi yêu cầu hỗ trợ **không cần đăng nhập** (AllowAnonymous trên public APIs).
   - Khu vực `/admin/*` yêu cầu JWT + role `Admin` của đúng tenant/app.
4. **Three.js tương thích React 19**:
   - Codebase dùng `react: ^19.0.0`. Dùng **`three` thuần** (`^0.172.0` + `OrbitControls`) bọc trong custom React wrapper (`ThreeStageCanvas.jsx`) để tránh xung đột peerDependency với `@react-three/fiber` v8, đảm bảo dọn GPU memory sạch sẽ và có **Fallback CSS 2.5D** trong môi trường không có WebGL / `jsdom`.
5. **Sinh mã QR nội bộ (Offline-first)**:
   - Dùng gói `qrcode` sinh QR DataURL/SVG trực tiếp từ link Messenger/Zalo đã cấu hình (không phụ thuộc `api.qrserver.com`), đồng thời cho phép Admin upload ảnh QR Zalo/Messenger tùy chỉnh (rất phổ biến tại Việt Nam khi shop dùng QR Zalo cá nhân nhận ảnh HD).

---

## 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG (ONEPORTAL INTEGRATION)

```mermaid
flowchart LR
  Portal[FE_Portal :5176] -->|iframe / deep-link| FE_PhotoPrint[FE_PhotoPrint :5177]
  FE_PhotoPrint -->|/t/{tenantKey}/api/v1/photoprint/...| Gateway[BE/src/Gateway :54612]
  Gateway --> API[BE/src/API :54611]
  API --> PhotoModule[Module PhotoPrint - Schema: photo]
  PhotoModule --> DB[(Shared PostgreSQL)]
  PhotoModule --> Storage[Storage: tenants/{tenantId}/photoprint/uploads & orders]
  FE_Tenant[FE_Tenant :5175] -->|Enable appKey=photoprint| Gateway
```

### Quy ước bắt buộc bám theo trong Codebase
- **Frontend Scope & Axios**: Theo chuẩn `FE_TemplateLandingPage/src/utils/tenantScope.js`, `FE_TemplateLandingPage/src/api/axios.js`, `FE_TemplateLandingPage/src/utils/portalNavigation.js`, `FE_TemplateLandingPage/src/utils/authStorage.js`, `FE_TemplateLandingPage/src/utils/safeUrl.js`.
  - Bắt buộc có `scopeRequest` và `assertCurrentScope` trong `FE_PhotoPrint/src/api/axios.js` để vượt qua `scripts/verify-frontend-architecture.mjs`.
  - Không import source file chéo giữa các thư mục `FE_*`.
- **Backend CQRS + Result Pattern + Tenancy**:
  - Theo chuẩn `BE/src/Presentation/APIs/Quoting/QuotingProductApi.cs`, `QuotingSupportApi.cs`, `BE/src/Persistence/Initialization/QuotingFoundationSeed.cs`, `BE/src/Persistence/Repositories/Tenancy/TenantStore.cs`, `BE/src/Persistence/ApplicationDbContext.cs`.
  - Mọi entity nghiệp vụ trong `OnePortal.Domain.Entities.PhotoPrint` phải kế thừa `AggregateRoot<Guid>` hoặc `TenantEntity<Guid>`.
  - Không reference chéo giữa `OnePortal.Application.UseCases.V1.PhotoPrint` với `Quoting`, `Templates`, `Customizations`, `Categories`.

---

## 2. CHI TIẾT TỪNG ĐẦU MỤC CHỨC NĂNG

### 2.1. Trang Home (`/`) — Photo Gallery Storefront & 3D Showcase
- **Mục tiêu**: Tạo cảm giác tinh tế của một studio/shop in ảnh hiện đại (Gallery Aesthetic), dẫn khách đi thẳng vào trải nghiệm tải ảnh, tính giá, xem trước khung ảnh 3D và nhắn Zalo gửi ảnh.
- **Thành phần giao diện & luồng hoạt động**:
  1. **Navbar & Sticky Header (Glassmorphism)**:
     - Logo + Tên Shop (đọc từ `ContactConfig` theo tenant), Thanh tìm kiếm nhanh sản phẩm in ảnh (`"10x15"`, `"Tráng gương"`, `"Photobook"`, `"Polaroid"`).
     - Menu: `Trang chủ` (`/`), `Sản phẩm & In ảnh` (`/services`), `Demo 3D` (`/demo`), `Tra cứu đơn` (`/orders/track`), `Hỗ trợ` (`/support`).
     - Cụm action phải: Badge **Giỏ hàng** (hiển thị số lượng item & tổng số ảnh), Nút **Messenger** / **Zalo QR** nhanh, Nút **Quản trị** (nếu đã login Admin) hoặc **Đăng nhập**.
  2. **3D Hero Showcase (Three.js + Uiverse CTA)**:
     - Cột trái: Badge nổi Uiverse (`"In Ảnh HD Chuẩn Màu Lab • Giao Nhanh Trong Ngày"`), Headline nổi bật, mô tả ngắn (In ảnh ép lụa, Ảnh tráng gương pha lê, Khung ảnh decor, Photobook mở phẳng), 2 nút CTA chính (`UiverseButton`): **"Tải ảnh & Đặt in ngay"** -> `/services` và **"Thử Khung & Demo 3D"** -> `/demo`.
     - Cột phải: **Canvas Three.js Studio Gallery** trưng bày 3D nổi: 1 Khung ảnh gỗ treo tường có bo viền + 1 xấp ảnh Polaroid nghiêng + hiệu ứng hạt ánh sáng studio ấm phản hồi parallax theo con trỏ chuột. Có nút chuyển nhanh 3 preset ngay trên góc canvas (`Khung Ảnh Decor` / `Ảnh Tráng Gương` / `Photobook Mở Phẳng`).
  3. **Dải Cam kết Chất lượng Lab In Ảnh (4 Glass Cards)**:
     - *Công nghệ in Laser/Inkjet 12 màu chuẩn Lab*, *Tự động kiểm tra DPI chống vỡ ảnh*, *Chỉnh sáng & retouch cơ bản miễn phí*, *Đóng gói chống sốc — In lại miễn phí nếu lỗi*.
  4. **Danh mục Sản phẩm Shop In Ảnh (`/services?category=...`)**:
     - Grid 6 nhóm sản phẩm lấy từ `GET /services/categories`:
       1. *In Ảnh Lẻ (4R, 5R, A4...)*
       2. *Ảnh Polaroid & Photostrip*
       3. *Ảnh Ép Gỗ & HD Tráng Gương*
       4. *Tranh Canvas & Khung Ảnh*
       5. *Photobook & Album Kỷ Niệm*
       6. *Ảnh Thẻ, Lịch & Ấn Phẩm Hình Ảnh*
     - Card sử dụng `UiverseCard` (viền gradient/spotlight khi hover).
  5. **Gói In Ảnh Bán Chạy & Bảng Giá Nhanh (`Featured Photo Products`)**:
     - Hiển thị 6–8 sản phẩm nổi bật (`isFeatured = true`) kèm giá khởi điểm (vd: *Ảnh 10x15 từ 2.500đ/tấm*, *Ảnh Tráng Gương 40x60 từ 240.000đ*), chất liệu giấy/bề mặt, nút **"Đặt in / Tải ảnh"** (`/services/:slug`) và **"Xem trên 3D"** (`/demo?serviceSlug=...`).
  6. **Thanh kéo So sánh Trực quan (`BeforeAfterSlider`)**:
     - Kéo trái/phải để xem sự khác biệt giữa: *Ảnh chụp điện thoại thiếu sáng vs Ảnh đã cân màu Lab & in Tráng gương*, hoặc *Ảnh thường vs Khung ảnh Bo viền Passepartout*.
  7. **Quy trình 4 bước Đặt In Ảnh & Footer Kèm QR Zalo**:
     - *1. Chọn dòng ảnh & kích thước -> 2. Tải ảnh từ điện thoại/PC & kiểm tra DPI -> 3. Xem thử 3D hoặc gửi Zalo HD -> 4. In chuẩn Lab & Giao tận nhà*.
     - Footer hiển thị thông tin tiệm/xưởng ảnh, giờ mở cửa, hotline và **QR Zalo nhận ảnh HD** ngay tại chân trang.

---

### 2.2. Trang Dịch vụ / Sản phẩm In Ảnh & Trình Upload Hàng loạt (`/services`, `/services/:slug`)
- **Mục tiêu**: Cho phép khách duyệt toàn bộ dòng sản phẩm in ảnh, chọn cỡ ảnh/chất liệu/khung, tải lên nhiều ảnh để xem trước crop + kiểm tra độ nét DPI, và tính giá minh bạch theo thời gian thực.

#### A. Trang Danh mục & Sản phẩm (`/services`)
- **Bộ lọc & Tìm kiếm**:
  - Tìm kiếm theo tên/kích thước (debounce 300ms).
  - Lọc theo Nhóm sản phẩm (`categorySlug`), Mục đích (*Kỷ niệm & Ví / Treo tường Decor / Quà tặng / Sự kiện & Quảng cáo*), Sắp xếp (*Nổi bật / Giá thấp -> cao / In lấy liền*).
  - Server-side pagination (`page`, `pageSize = 12`), tự reset về trang 1 khi đổi filter.

#### B. Trang Chi tiết & Trình Đặt In Ảnh (`ServiceDetailPage.jsx`)
- **Bố cục 2 khu vực chính**:
  1. **Khu vực Xem mẫu & Tải ảnh Hàng loạt (`BatchPhotoUploader` + Gallery)**:
     - Tab 1 (**Ảnh mẫu sản phẩm**): Gallery ảnh thực tế bề mặt giấy (lụa, bóng, ánh kim), cạnh khung gỗ/tráng gương, bảng so sánh kích thước thực tế (đặt cạnh chiếc điện thoại/ghế sofa để khách dễ hình dung cỡ `10x15` vs `40x60`!).
     - Tab 2 (**Tải ảnh của bạn lên để kiểm tra & in** — dành cho các dòng ảnh lẻ, Polaroid, khung ảnh, tráng gương, canvas):
       - Kéo thả / chọn **nhiều ảnh cùng lúc** (tối đa 50 ảnh/lần hoặc cấu hình theo sản phẩm).
       - **Kiểm tra chất lượng DPI tự động tại Client (`photoQuality.js`)**:
         - Đọc `naturalWidth x naturalHeight` của từng ảnh và tính DPI theo kích thước `(widthCm, heightCm)` đang chọn:
           - `>= 250 DPI`: Badge xanh lá (**"Rất nét — In đẹp"**)
           - `150 - 249 DPI`: Badge vàng (`"Đạt chuẩn — In ổn"`)
           - `< 150 DPI`: Badge đỏ cam (`"Ảnh hơi mờ cho cỡ này — Khuyên chọn cỡ nhỏ hơn hoặc gửi ảnh gốc qua Zalo"`)
       - **Chế độ Căn khung trên từng ảnh (`Crop & Fit Editor`)**:
         - Chọn `Fill (Tràn khung)` (cho phép kéo chọn vùng lấy nét `focalX, focalY` theo đúng tỷ lệ `widthCm : heightCm` để không bị cắt mất đầu người!) hoặc `Fit (Giữ nguyên 100% ảnh, thêm viền trắng)`.
         - Với **Ảnh Polaroid / Photostrip**: Có ô nhập **Caption chữ dưới chân ảnh** + chọn font chữ + màu nền viền (Trắng, Kem, Đen).
         - Chỉnh số lượng bản in riêng từng tấm (`qty`) và nút **"Áp dụng cỡ/chất liệu cho tất cả ảnh"**.
       - Tùy chọn thay thế: Tick *"Tôi sẽ gửi album ảnh gốc (HD) qua Zalo / Google Drive sau khi đặt đơn"* (khi khách có quá nhiều ảnh hoặc muốn gửi file RAW/Google Drive).
  2. **Khu vực Cấu hình & Bảng tính Giá tự động (`PhotoPriceConfigurator`)**:
     - **Chọn Kích thước (`printSizes`)**: Grid nút chọn nhanh các cỡ chuẩn của sản phẩm (vd `10x15 cm`, `13x18 cm`, `15x21 cm`, `20x30 cm`) hoặc nhập kích thước tùy chỉnh nếu sản phẩm hỗ trợ `PerSqm`.
     - **Chọn Chất liệu / Bề mặt (`paperOrSurfaceOptions`)**: Radio cards Uiverse (vd: *Giấy Fujifilm Bóng*, *Giấy Lụa Mờ*, *Giấy Metallic Ánh Kim*, *Ép Gỗ Laminate*, *Tráng Gương Pha Lê 5mm*, *Vải Canvas*).
     - **Tùy chọn Gia công & Khung (`finishingOptions` — `UiverseCheckbox`)**:
       - Ví dụ: *Khung gỗ sồi tự nhiên*, *Khung hợp kim đen mảnh*, *Bo viền trắng Passepartout*, *Cán màng bảo vệ chống ẩm*, *Bo tròn 4 góc*, *Đóng hộp quà tặng + Thiệp*.
     - **Số lượng (`quantity`)**: Tự động đồng bộ theo tổng số bản in của các ảnh đã upload (hoặc nhập trực tiếp nếu gửi qua Zalo/Drive), kèm thanh thông báo mốc giảm giá tiếp theo (vd: *"Thêm 4 tấm nữa để được giá sỉ từ 20 tấm: 3.000đ/tấm"*).
     - **Chế độ Lấy hàng (`turnaroundMode`)**: `Tiêu chuẩn (1–2 ngày)` vs `In nhanh lấy liền (2–4 giờ)`.
     - **Bảng Tóm tắt Giá Realtime (`decimal.js`)**: Hiển thị đơn giá theo bậc số lượng, phụ phí bề mặt/khung/bo viền, phụ phí lấy liền, tổng chiết khấu, **Thành tiền tạm tính**.
     - **Hành động**:
       - **"Thêm vào Giỏ hàng"** (upload các file ảnh đã chọn lên `POST /uploads/photos` hoặc lưu metadata crop vào giỏ hàng — thực hiện upload ngay khi add cart hoặc lúc checkout có progress bar mượt mà!).
       - **"Thử ảnh này trên Khung 3D"** (mở `/demo` mang theo ảnh đầu tiên khách vừa upload + kích thước đã chọn!).
       - **"Gửi ảnh qua Zalo / Hỏi thợ chỉnh ảnh"** (mở `SocialConnectModal` kèm thông số đơn đang cấu hình).

---

### 2.3. Giỏ hàng, Checkout Đặt In & Tra cứu Tiến độ (`/cart`, `/checkout`, `/orders/track`)
- **Giỏ hàng (`/cart`)**:
  - Lưu bền vững trong `localStorage` scope theo `tenantKey` (`photoprint_cart:${tenantKey}`), đồng bộ qua `CartContext` (không lưu blob file nặng vào localStorage — ảnh đã upload lưu `photoFileUrl` + `thumbnailUrl` từ server, hoặc giữ `File` trong memory của `CartContext` và tự động upload khi bấm Đặt hàng nếu khách chưa upload trước!).
  - Hiển thị danh sách từng dòng sản phẩm in ảnh (thumbnail các ảnh đã chọn, cỡ, chất liệu, khung, số lượng bản, cảnh báo nếu có ảnh DPI thấp).
- **Checkout Đặt in (`/checkout`)**:
  - Nhập thông tin: `customerName`, `customerPhone`, `customerEmail` (tùy chọn), `deliveryAddress`, `deliveryMethod` (*Nhận tại tiệm ảnh / Giao nhanh nội thành / Ship COD toàn quốc*), `paymentMethod` (*Chuyển khoản VietQR / Tiền mặt khi nhận / Đặt cọc*), `notes` (vd: *"Nhờ thợ làm sáng da nhẹ giúp em"*).
  - Nếu trong giỏ có ảnh local chưa upload, chạy batch upload lên `POST /api/v1/photoprint/uploads/photos` có thanh tiến độ trước khi gửi `POST /api/v1/photoprint/orders`.
  - Backend **tính lại toàn bộ giá từ DB** (`PhotoPricingCalculator`) và lưu `PrintOrder` + `PrintOrderItems` (gồm từng ảnh/cấu hình crop `CropMetadataJson` + `OriginalFileUrl` để thợ tải về in đúng chuẩn!).
  - Màn hình **Đặt in thành công**: Hiển thị `OrderCode` (`PA-YYYYMMDD-XXXX`) + nút **Copy mã đơn** + nút **"Gửi mã đơn & ảnh gốc qua Zalo"** / **"Nhắn Messenger xác nhận đơn"**.
- **Tra cứu Đơn hàng (`/orders/track`)**:
  - Khách nhập `OrderCode` + `Số điện thoại` -> `GET /api/v1/photoprint/orders/track` -> Timeline 6 trạng thái của tiệm ảnh:
    `Pending` (*Đã nhận đơn*) -> `FileChecking` (*Đang kiểm tra & chỉnh màu ảnh*) -> `Printing` (*Đang in Lab*) -> `Finishing` (*Đang ép gỗ / Lắp khung*) -> `Shipped` (*Đang giao / Sẵn sàng lấy tại tiệm*) -> `Completed` (*Hoàn tất*).

---

### 2.4. Trang Demo Tương tác & 3D Photo Studio (`/demo`)
- **Mục tiêu**: Cho phép khách hàng nhìn trước bức ảnh của mình khi lên **Khung treo tường, Ảnh Tráng gương, Tranh Canvas, Polaroid hay Photobook** dưới các góc nhìn và ánh sáng phòng khác nhau trước khi đặt in!

#### A. Khu vực 1: Thư viện Demo Ấn phẩm Ảnh (Filterable Gallery)
- Lọc theo nhóm: `Tất cả`, `Khung Ảnh Decor`, `Ảnh Tráng Gương`, `Tranh Canvas`, `Bộ Ảnh Polaroid`, `Photobook Mở Phẳng`, `Poster & Standee`.
- Lấy dữ liệu từ `GET /api/v1/photoprint/demos`. Bấm **"Thử trên Studio 3D"** để nạp ngay vào trình 3D bên cạnh/bên trên.

#### B. Khu vực 2: 3D Photo Studio (Three.js Interactive Stage)
- **5 Mô hình 3D chuyên biệt cho Shop In Ảnh** dựng từ hình học Three.js (`PrintMeshFactory.js`):
  1. `framed_photo` — **Khung Ảnh Treo Tường / Để Bàn**: Khung viền nổi 3D (Gỗ sồi / Đen nhám / Vàng Champagne / Trắng), tùy chọn bật/tắt **Bo viền trắng Passepartout** bao quanh ảnh, đổ bóng mềm lên mặt tường gallery phía sau.
  2. `crystal_mirror` — **Ảnh Ép Gỗ / HD Pha Lê Tráng Gương**: Tấm ảnh dày cạnh viền vàng/đen sang trọng, sử dụng `MeshPhysicalMaterial` với `clearcoat: 1.0`, `clearcoatRoughness: 0.08` tạo hiệu ứng bóng gương phản chiếu ánh sáng đèn studio cực chân thực!
  3. `canvas_wrap` — **Tranh Canvas Căng Khung Gỗ**: Khối tranh dày `3cm`, bề mặt nhám vải canvas (`roughness: 0.85`), cạnh viền tràn ảnh hoặc trắng tinh tế.
  4. `polaroid_card` — **Bộ Ảnh Polaroid & Photostrip Kỷ Niệm**: Hiển thị tấm ảnh Polaroid viền trắng dưới dày trên nền bàn gỗ/decor, **nhập text caption** trực tiếp để render chữ viết tay lên mặt trước `CanvasTexture` ngay lập tức!
  5. `photobook_open` — **Cuốn Photobook Mở Phẳng 180°**: Mô phỏng trang đôi trái/phải mở phẳng trên bàn, cho phép tải ảnh trang trái & trang phải hoặc lật xem demo.
- **Bảng điều khiển Studio (Sidebar Uiverse Controls)**:
  - **Chọn Kiểu Thành Phẩm 3D** (5 mẫu trên).
  - **Tải ảnh của bạn lên xem thử** (`PNG/JPG/WebP`) hoặc chọn ảnh mẫu từ Gallery -> tự động check tỷ lệ khung hình ảnh!
  - **Tùy chỉnh Cỡ ảnh (`10x15`, `20x30`, `40x60`, `60x90`, hoặc kéo slider)** -> mô hình 3D thay đổi tỷ lệ chiều rộng/cao theo thời gian thực.
  - **Tùy chỉnh Khung & Bo viền**: Màu khung (Gỗ Sồi / Đen / Vàng Gold / Trắng), Bật/tắt Bo viền trắng (`Passepartout`).
  - **Chế độ Ánh sáng Phòng (`UiverseToggle`)**:
    - *Phòng Sáng Ban Ngày (Daylight Studio)*
    - *Đèn Vàng Gallery Ấm Áp (Warm Spotlight)* — chiếu rọi trực diện lên bức ảnh tráng gương/khung tranh.
  - **Điều khiển Camera**: Xoay 360° / Zoom (`OrbitControls`), Auto-Rotate, Reset góc nhìn.
  - **Hành động**:
    - **"Chụp ảnh Mockup 3D (.PNG)"** (`canvas.toDataURL('image/png')`) để lưu về gửi bạn bè/gia đình duyệt trước.
    - **"Đặt in mẫu này ngay"** -> chuyển sang `/services/:linkedServiceSlug` mang theo ảnh, kích thước và màu khung đã chọn!
- **WebGL Fallback**: Khi trình duyệt không hỗ trợ WebGL hoặc trong test `jsdom`, tự động dùng `<Fallback25DViewer>` (CSS 3D perspective + shadow) để đảm bảo giao diện luôn đẹp và không crash.

---

### 2.5. Trang Yêu cầu hỗ trợ (`/support`) & Admin Support Board (`/admin/support`)
- **Public Support (`/support`)**:
  - **3 Thẻ hỗ trợ đặc thù Shop In Ảnh**: *Nhờ Chỉnh Màu / Retouch / Xóa Phông*, *Kiểm Tra Độ Nét File Ảnh Trước Khi In*, *Đặt In Gấp & Khiếu Nại / Đổi Trả Khung*.
  - **Form Gửi Yêu cầu**: `fullName`, `phone` (bắt buộc), `email` (tùy chọn), `topic` (chip Uiverse: *Chỉnh sửa & Retouch ảnh*, *Kiểm tra độ nét / DPI file*, *Tư vấn chọn cỡ & khung ảnh*, *Đơn hàng in gấp*, *Bảo hành / Đổi trả*, *Hỗ trợ khác*), `priority` (`normal` / `high` / `urgent`), `orderCode` (tùy chọn), `attachmentUrl` (tùy chọn upload ảnh cần nhờ chỉnh/ảnh lỗi `<= 10MB`), `message`.
  - Trả về **Mã Ticket (`SUP-YYYYMMDD-XXXX`)** + nút **Tra cứu trạng thái ticket** ngay trên `/support` + nút **"Nhắn trực tiếp Zalo / Messenger kèm mã ticket"**.
- **Admin Support Board (`/admin/support`)**:
  - Kanban 3 cột (`New` -> `InProgress` -> `Resolved`) theo mẫu `FE_Quoting/src/pages/support/SupportBoardPage.jsx`, nâng cấp UI bằng **TailwindCSS + Uiverse Cards**, có Drawer chi tiết xem ảnh đính kèm, nhập `adminNote` phản hồi và optimistic concurrency (`expectedRevision`).

---

### 2.6. Tích hợp Facebook Messenger & Zalo (Auto-link theo cấu hình + QR Code)
- **Mục tiêu**: Kết nối khách hàng với Facebook Page Messenger và Zalo (Cá nhân hoặc Zalo OA) đã được cấu hình riêng cho từng tiệm ảnh, hỗ trợ gửi ảnh chất lượng HD và hỏi tư vấn cực nhanh.
- **Cấu hình động theo từng Tenant (`/admin/settings` <-> `photo."ContactConfigs"`)**:
  - `brandName`, `hotline`, `email`, `address`, `workingHours`.
  - **Facebook Messenger**: `messengerEnabled`, `messengerPageIdOrUsername`, `messengerLinkOverride`, `messengerPrefillText`, `messengerQrImageUrl` (ảnh QR tùy chỉnh optional), `fbCustomerChatEnabled`, `fbAppId`.
  - **Zalo**: `zaloEnabled`, `zaloAccountName`, `zaloPhoneOrOaId`, `zaloLinkOverride`, `zaloPrefillText`, `zaloQrImageUrl` (ảnh QR Zalo cá nhân/OA do shop tự upload, nếu null thì tự động sinh QR từ `https://zalo.me/...`).
- **Hành vi thông minh (`socialLinks.js` + `FloatingSocialDock.jsx` + `SocialConnectModal.jsx`)**:
  - **Auto-link an toàn**: Chuẩn hóa số điện thoại / username / URL qua `getSafeHttpUrl()` + whitelist host (`m.me`, `messenger.com`, `facebook.com`, `zalo.me`, `oa.zalo.me`), chặn XSS tuyệt đối.
  - **Modal QR Nội bộ (thư viện `qrcode`)**:
    - Trên Desktop: Click **Zalo** mở `SocialConnectModal` hiển thị **Mã QR Zalo sắc nét** kèm lời nhắc *"Mở Zalo quét mã để gửi ảnh chất lượng gốc (HD)"*, hiển thị SĐT/Tên tài khoản (Copy 1-click), hộp nội dung tư vấn tự động điền sẵn (tên dịch vụ/cỡ ảnh/mã đơn đang xem) và nút **Tải ảnh QR** / **Mở Zalo Web**.
    - Trên Mobile: Click **Zalo** hoặc **Messenger** deep-link thẳng sang app Zalo / Messenger trên điện thoại (vẫn có nút nhỏ mở xem QR).
  - **Admin Live Preview**: Trong `/admin/settings`, khi Admin gõ SĐT Zalo hoặc Page ID Messenger, hệ thống tự render link đích và mã QR thử nghiệm ngay bên cạnh để kiểm tra trước khi lưu.

---

### 2.7. Khu vực Quản trị Shop In Ảnh (`/admin/...`)
Bảo vệ bởi `ProtectedRoute` + `AdminRoute` (chuẩn JWT + `Role == "Admin"` theo tenant):
1. **`/admin` (`AdminDashboardPage`)**: Thống kê đơn đặt in hôm nay, đơn chờ kiểm tra file, tổng số ảnh cần in, ticket hỗ trợ mới, doanh thu tạm tính.
2. **`/admin/services` (`AdminServicesPage`)**: CRUD Sản phẩm & Dịch vụ in ảnh (upload ảnh mẫu, cấu hình danh sách cỡ ảnh, chất liệu giấy, bảng chiết khấu theo số lượng tấm, tùy chọn khung/gia công, gắn model 3D mặc định).
3. **`/admin/demos` (`AdminDemosPage`)**: CRUD Thư viện Demo & Preset 3D Studio.
4. **`/admin/orders` (`AdminOrdersPage`)**: Danh sách đơn hàng in ảnh:
   - Xem từng item, xem **số lượng tấm ảnh**, **thông số Crop (`Fill`/`Fit`, `focalX/Y`, `caption`)**, cảnh báo **DPI** của từng ảnh khách gửi.
   - Nút **"Tải ảnh gốc chất lượng cao"** (hoặc tải toàn bộ danh sách link ảnh của đơn) để thợ đưa vào máy in Lab!
   - Cập nhật trạng thái sản xuất (`Pending` -> `FileChecking` -> `Printing` -> `Finishing` -> `Shipped` -> `Completed` / `Cancelled`) + `adminNote` + `expectedRevision`.
5. **`/admin/support` (`AdminSupportBoardPage`)**: Bảng Kanban xử lý ticket hỗ trợ & xem ảnh khách nhờ retouch.
6. **`/admin/settings` (`AdminContactSettingsPage`)**: Cấu hình Messenger, Zalo, Upload ảnh QR tùy chỉnh, Hotline, Địa chỉ tiệm, kèm tab Thành viên (`WorkspaceMembers`) và Tự đăng ký (`RegistrationSettings`).

---

## 3. HỆ THỐNG UI: TAILWINDCSS + UIVERSE.IO + THREE.JS

### 3.1. Phong cách Thẩm mỹ ("Modern Photo Lab & Gallery")
- **Theme Dual Mode (`darkMode: 'class'`)**:
  - **Gallery Light (Mặc định)**: Nền trắng ấm/kem sáng (`#fafaf9` / `#ffffff`) tôn màu sắc rực rỡ của ảnh chụp, kết hợp viền mảnh thanh lịch và đổ bóng mềm như triển lãm ảnh.
  - **Studio Dark Mode**: Nền tối (`#09090b` / `#18181b`) giúp khách xem ảnh Tráng gương / Demo 3D nổi bật tối đa độ tương phản.
- **Bảng màu điểm nhấn**: Cyan-Indigo (`#0891b2` -> `#4f46e5`) kết hợp Rose-Amber (`#e11d48` / `#f59e0b`) cho badge ưu đãi/hỏa tốc.
- **Typography**: `Plus Jakarta Sans` (UI), `Playfair Display` hoặc `Space Grotesk` (Display/Polaroid caption), `JetBrains Mono` (Mã đơn, DPI, Kích thước cm).

### 3.2. Bộ Control Uiverse.io (`FE_PhotoPrint/src/components/uiverse/` + `src/styles/uiverse.css`)
Đóng gói sạch sẽ trong `@layer components` của Tailwind, có prefix `.uv-*`, hỗ trợ `prefers-reduced-motion` và keyboard `focus-visible`:
- `UiverseButton.jsx`: Variants `glow` (CTA chính), `push3d` (nút Đặt in nổi khối), `shine` (hiệu ứng quét sáng khi hover), `outline`.
- `UiverseCard.jsx`: Variants `gradient-border`, `glass`, `spotlight` (thẻ sản phẩm, thẻ demo, thẻ cam kết).
- `UiverseInput.jsx`: Floating label + animated border glow khi focus.
- `UiverseToggle.jsx`: Công tắc Day/Gallery Light 3D switch & pill toggle.
- `UiverseCheckbox.jsx`: Tile checkbox cho chọn gia công/khung ảnh & bo viền.
- `UiverseLoader.jsx`: Loader animation cho quá trình dựng model 3D và upload hàng loạt ảnh.
- `UiverseBadge.jsx`: Badge phát sáng/pulse cho trạng thái DPI, trạng thái đơn hàng, tag "Lấy liền 2h".
- `UiverseSocialDock.jsx`: Floating Action Dock góc phải dưới cho Messenger, Zalo QR, Hotline, Support.

### 3.3. Kiến trúc Three.js (`FE_PhotoPrint/src/components/three/`)
- `webglSupport.js`: Kiểm tra `isWebGLAvailable()` an toàn trong try/catch.
- `PhotoMeshFactory.js`: Tạo 5 mô hình (`framed_photo`, `crystal_mirror`, `canvas_wrap`, `polaroid_card`, `photobook_open`), hỗ trợ:
  - `applyPhotoTexture(meshGroup, imageUrlOrElement, fitMode, captionText)` -> vẽ lên `CanvasTexture` khi có viền Polaroid/caption hoặc bo passepartout.
  - `updatePhysicalFinish(meshGroup, modelType)` -> áp dụng `MeshPhysicalMaterial` (`clearcoat: 1`) cho tráng gương pha lê và `MeshStandardMaterial` (`roughness: 0.85`) cho canvas/giấy lụa.
  - `updateDimensions(meshGroup, widthCm, heightCm)` & `updateFrameColor(meshGroup, hex)`.
- `ThreeStageCanvas.jsx`: Khởi tạo `WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })`, `OrbitControls`, `ResizeObserver`, dispose toàn bộ `geometry/material/texture` khi đổi ảnh hoặc unmount, hỗ trợ `captureSnapshot()`.
- `Fallback25DViewer.jsx`: Preview CSS 3D perspective an toàn khi không có WebGL hoặc khi chạy unit test `jsdom`.

---

## 4. ĐẶC TẢ CHI TIẾT BACKEND (.NET 10)

### 4.1. Entities mới (`BE/src/Domain/Entities/PhotoPrint/`, Schema PostgreSQL: `photo`)
Mọi entity kế thừa `AggregateRoot<Guid>` hoặc `TenantEntity<Guid>` (`ITenantEntity`):
1. `PhotoCategory` (`photo."Categories"`): `Id`, `TenantId`, `Name`, `Slug` (unique per tenant), `Description`, `IconName`, `SortOrder`, `IsActive`, `IsDeleted`.
2. `PhotoProduct` (`photo."Products"`): `Id`, `TenantId`, `CategoryId`, `Code`, `Name`, `Slug`, `ShortDescription`, `Description`, `ThumbnailUrl`, `GalleryJson`, `PricingMode` (`PerPrintSizeTier` | `PerUnit` | `PerSqm`), `BasePrice`, `MinBillableAreaSqm`, `SupportsBatchUpload` (`bool`), `ProductionTimeLabel`, `RushSurchargePercent`, `PrintSizesJson` (mảng `{ label, widthCm, heightCm, priceDeltaOrBase }`), `PaperOrSurfaceOptionsJson` (mảng `{ name, finishType, pricePerUnitOrSqm, description }`), `FinishingOptionsJson` (mảng `{ name, price, mode }`), `DiscountTiersJson` (mảng `{ minQty, discountPercent }`), `DefaultModel3DType`, `IsFeatured`, `IsActive`, `IsDeleted`, `CreatedAtUtc`, `ModifiedAtUtc`.
3. `PhotoDemo` (`photo."Demos"`): `Id`, `TenantId`, `LinkedProductId` (`Guid?`), `Title`, `StyleCategory`, `Description`, `PreviewImageUrl`, `TextureImageUrl`, `Model3DType`, `WidthCm`, `HeightCm`, `FrameColor`, `HasMatboard`, `IsFeatured`, `IsActive`, `IsDeleted`, `CreatedAtUtc`.
4. `PhotoOrder` (`photo."Orders"`): `Id`, `TenantId`, `OrderCode` (unique per tenant, `PA-YYYYMMDD-XXXX`), `CustomerName`, `CustomerPhone`, `CustomerEmail`, `DeliveryAddress`, `DeliveryMethod`, `PaymentMethod`, `Notes`, `SubTotal`, `DiscountTotal`, `GrandTotal`, `TotalPhotoCount`, `Status` (`Pending` | `FileChecking` | `Printing` | `Finishing` | `Shipped` | `Completed` | `Cancelled`), `AdminNote`, `Revision`, `CreatedByUserId` (`Guid?`), `CreatedAtUtc`, `UpdatedAtUtc`, collection `Items` (`PhotoOrderItem`).
5. `PhotoOrderItem` (`photo."OrderItems"`): `Id`, `TenantId`, `OrderId`, `ProductId` (`Guid?`), `ProductName`, `SizeLabel`, `WidthCm`, `HeightCm`, `SurfaceName`, `FinishingSummary`, `TurnaroundMode`, `Quantity`, `UnitPrice`, `LineTotal`, `PhotoFilesJson` (mảng các ảnh khách gửi in: `{ fileUrl, originalFileName, widthPx, heightPx, computedDpi, fitMode, focalX, focalY, caption, printQty, note }`).
6. `PhotoSupportRequest` (`photo."SupportRequests"`): `Id`, `TenantId`, `TicketCode` (`SUP-YYYYMMDD-XXXX`), `CreatedByUserId` (`Guid?`), `FullName`, `Phone`, `Email`, `Topic`, `Priority`, `OrderCode`, `AttachmentUrl`, `Message`, `Status` (`New` | `InProgress` | `Resolved`), `AdminNote`, `Revision`, `CreatedAtUtc`, `UpdatedAtUtc`, `ResolvedAtUtc`, `UpdatedByUserId`, `ResolvedByUserId`.
7. `PhotoContactConfig` (`photo."ContactConfigs"`): `Id`, `TenantId`, `BrandName`, `Hotline`, `Email`, `Address`, `WorkingHours`, `MessengerEnabled`, `MessengerPageIdOrUsername`, `MessengerLinkOverride`, `MessengerPrefillText`, `MessengerQrImageUrl`, `FbCustomerChatEnabled`, `FbAppId`, `ZaloEnabled`, `ZaloAccountName`, `ZaloPhoneOrOaId`, `ZaloLinkOverride`, `ZaloPrefillText`, `ZaloQrImageUrl`, `UpdatedAtUtc`.

### 4.2. Cập nhật Tenancy & Platform Wiring (`BE/`)
- `BE/src/Domain/Entities/Tenancy/TenantDefaults.cs`:
  - Thêm `PrintPhotoId` / `PhotoPrintId = Guid.Parse("6ba7809b-1af1-42ad-80e7-a2da9d58c004")` (hoặc `003`), cập nhật `ApplicationKeys = ["landing", "quoting", "photoprint"]` và thêm helper `IsSupportedApplication(string? appKey)`.
- `BE/src/Application/Services/Tenancy/TenantContext.cs` + 6 Handlers Tenancy (`CreateTenantCommandHandler`, `ConfigureTenantApplicationCommandHandler`, `ConfigureRegistrationCommandHandler`, `CreateTenantMemberCommandHandler`, `SetTenantMembershipCommandHandler`, `GetTenantContextsQueryHandler`): dùng `TenantDefaults.IsSupportedApplication(...)` để chấp nhận `"photoprint"`.
- `BE/src/Persistence/ApplicationDbContext.cs`: Thêm `DbSet<>` cho 7 entity `PhotoPrint` và cập nhật `ApplicationFor(Type)` ánh xạ `.PhotoPrint` -> `"photoprint"`.
- `BE/src/Persistence/Initialization/`: Tạo `PhotoPrintFoundationSeed.cs` (`AppKey => "photoprint"`, `Version => 1`) seed sẵn 6 `PhotoCategory`, 8 `PhotoProduct` chuẩn shop in ảnh (Ảnh 10x15, 13x18, 20x30, Polaroid, Tráng gương, Canvas, Photobook, Ảnh thẻ), 5 `PhotoDemo`, và `PhotoContactConfig` mặc định; đăng ký trong `DatabaseInitializer.cs`.
- **EF Migration mới (`AddPhotoPrintModuleSchema`)**: Tạo schema `photo`, 7 bảng, thêm `'photoprint'` vào `platform."Applications"` và tenant mặc định `'photoprint-default'` vào `platform."Tenants"` + `platform."TenantApplications"`.
- `BE/src/API/Middlewares/TenantRoutingMiddleware.cs`: Hỗ trợ `/t/{tenantKey}/api/v1/photoprint/...`, chặn cross-module remainder, rewrite `/api/v1/photoprint/...`, fallback legacy `/api/v1/photoprint` -> `"photoprint-default"`.
- `BE/src/Gateway/appsettings.json` & `Program.cs` (API + Gateway): Thêm cluster & route `"photoprint"`, thêm `"http://localhost:5177"` vào `Cors:AllowedOrigins`.
- `BE/test/Architecture.Tests/TenantArchitectureTests.cs`: Bổ sung rule `PhotoPrintModule_DoesNotCallLandingOrQuotingUseCases()`.

### 4.3. Danh sách Endpoints Minimal APIs (`BE/src/Presentation/APIs/PhotoPrint/`)

| Group | Method & Route | Auth | Mô tả |
| :--- | :--- | :--- | :--- |
| **Products** | `GET /api/v1/photoprint/categories` | `AllowAnonymous` | Danh sách nhóm sản phẩm in ảnh |
| | `GET /api/v1/photoprint/products` | `AllowAnonymous` | Tìm kiếm, lọc theo nhóm, featured, phân trang |
| | `GET /api/v1/photoprint/products/{slug}` | `AllowAnonymous` | Chi tiết sản phẩm + cỡ ảnh + giấy + khung + discount tiers |
| | `POST/PUT/DELETE /api/v1/photoprint/products...` | `AdminOnly` | CRUD sản phẩm & danh mục |
| **Uploads** | `POST /api/v1/photoprint/uploads/photos` | `AllowAnonymous` (rate-limit) | Upload ảnh khách gửi in / ảnh mẫu (`<= 15MB`/file, chỉ `png/jpg/webp`, chặn SVG), lưu scoped `tenants/{tenantId:N}/photoprint/uploads/` |
| | `GET /api/v1/photoprint/uploads/{fileName}` | `AllowAnonymous` | Phục vụ file ảnh với `X-Content-Type-Options: nosniff` (và `?download=true` cho thợ tải gốc) |
| **Demos** | `GET /api/v1/photoprint/demos` | `AllowAnonymous` | Thư viện mẫu demo 3D theo kiểu thành phẩm |
| | `POST/PUT/DELETE /api/v1/photoprint/demos...` | `AdminOnly` | CRUD mẫu demo 3D |
| **Orders** | `POST /api/v1/photoprint/orders` | `AllowAnonymous` | Tạo đơn đặt in ảnh (server tính lại giá & lưu `PhotoFilesJson` + `OrderCode`) |
| | `GET /api/v1/photoprint/orders/track` | `AllowAnonymous` | Tra cứu tiến độ theo `orderCode` + `phone` |
| | `GET /api/v1/photoprint/orders` | `AdminOnly` | Danh sách đơn hàng in ảnh cho Admin/thợ in |
| | `PUT /api/v1/photoprint/orders/{id:guid}/status` | `AdminOnly` | Cập nhật tiến độ xử lý & `adminNote` (`expectedRevision`) |
| **Support** | `POST /api/v1/photoprint/support-requests` | `AllowAnonymous` | Khách gửi ticket (nhờ retouch, check DPI, khiếu nại...) |
| | `GET /api/v1/photoprint/support-requests/track` | `AllowAnonymous` | Tra cứu ticket theo `ticketCode` + `contact` |
| | `GET /api/v1/photoprint/support-requests` | `AdminOnly` | Admin search Kanban 3 cột |
| | `PUT /api/v1/photoprint/support-requests/{id:guid}/status` | `AdminOnly` | Đổi trạng thái & trả lời ticket (`expectedRevision`) |
| **Contact** | `GET /api/v1/photoprint/contact-config` | `AllowAnonymous` | Lấy cấu hình Messenger, Zalo, Hotline, QR |
| | `PUT /api/v1/photoprint/contact-config` | `AdminOnly` | Cập nhật link Messenger, Zalo, QR tùy chỉnh, thông tin tiệm ảnh |

---

## 5. ĐẶC TẢ CHI TIẾT FRONTEND (`FE_PhotoPrint/`)

### 5.1. Cấu trúc Thư mục Dự kiến
```text
FE_PhotoPrint/
├── index.html
├── package.json              # react 19, react-router-dom 7, axios, lucide-react, decimal.js, three, qrcode, tailwindcss 3.4, vitest
├── postcss.config.js
├── tailwind.config.js        # darkMode: 'class', font Plus Jakarta Sans / Playfair Display / JetBrains Mono
├── vercel.json               # Rewrite SPA /t/:key/* giữ nguyên /api và /t/:key/api
├── vite.config.js            # port: 5177, proxy ^/t/[^/]+/api/ và /api -> http://127.0.0.1:54612
└── src/
    ├── main.jsx              # BrowserRouter basename={workspaceBasename()}
    ├── App.jsx               # AuthProvider -> ThemeProvider -> ContactConfigProvider -> CartProvider -> WorkspaceGate
    ├── index.css
    ├── styles/
    │   └── uiverse.css       # @layer components cho .uv-*
    ├── api/
    │   ├── axios.js          # scopeRequest + assertCurrentScope
    │   ├── authApi.js
    │   ├── workspaceApi.js
    │   ├── photoProductApi.js
    │   ├── photoDemoApi.js
    │   ├── photoOrderApi.js
    │   ├── photoSupportApi.js
    │   └── contactConfigApi.js
    ├── contexts/
    │   ├── AuthContext.jsx
    │   ├── ThemeContext.jsx
    │   ├── ContactConfigContext.jsx
    │   └── CartContext.jsx            # Giỏ hàng scoped theo workspaceKey()
    ├── utils/
    │   ├── tenantScope.js    # APP_KEY = 'photoprint', DEFAULT_TENANT_KEY = 'photoprint-default'
    │   ├── portalNavigation.js
    │   ├── authStorage.js
    │   ├── safeUrl.js
    │   ├── socialLinks.js    # resolveMessengerUrl, resolveZaloUrl, generateQrDataUrl
    │   ├── photoQuality.js   # calculateImageDpi, getDpiQualityBadge, computeDefaultCrop
    │   └── photoPricing.js   # calculatePhotoPrintPrice dùng decimal.js
    ├── components/
    │   ├── common/
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── WorkspaceGate.jsx
    │   │   ├── WorkspaceMembers.jsx
    │   │   ├── ToastViewport.jsx
    │   │   └── BeforeAfterSlider.jsx
    │   ├── photo/
    │   │   ├── BatchPhotoUploader.jsx   # Kéo thả nhiều ảnh + check DPI real-time
    │   │   └── PhotoCropModal.jsx       # Chỉnh Fill/Fit, pan vùng lấy nét, caption Polaroid
    │   ├── uiverse/
    │   │   ├── UiverseButton.jsx
    │   │   ├── UiverseCard.jsx
    │   │   ├── UiverseInput.jsx
    │   │   ├── UiverseToggle.jsx
    │   │   ├── UiverseCheckbox.jsx
    │   │   ├── UiverseLoader.jsx
    │   │   ├── UiverseBadge.jsx
    │   │   └── UiverseSocialDock.jsx
    │   ├── social/
    │   │   ├── FloatingSocialDock.jsx
    │   │   ├── SocialConnectModal.jsx   # Tab Zalo QR (gửi ảnh HD) / Messenger QR + copy nội dung
    │   │   └── FacebookChatBridge.jsx
    │   └── three/
    │       ├── webglSupport.js
    │       ├── PhotoMeshFactory.js
    │       ├── ThreeStageCanvas.jsx
    │       ├── Hero3DShowcase.jsx
    │       └── Fallback25DViewer.jsx
    ├── layouts/
    │   ├── StorefrontLayout.jsx
    │   └── AdminLayout.jsx
    ├── pages/
    │   ├── HomePage.jsx
    │   ├── ServicesPage.jsx
    │   ├── ServiceDetailPage.jsx
    │   ├── DemoStudioPage.jsx
    │   ├── CartPage.jsx
    │   ├── CheckoutPage.jsx
    │   ├── OrderTrackingPage.jsx
    │   ├── SupportPage.jsx
    │   ├── NotFoundPage.jsx
    │   ├── auth/
    │   │   ├── LoginPage.jsx
    │   │   └── RegisterPage.jsx
    │   └── admin/
    │       ├── AdminDashboardPage.jsx
    │       ├── AdminProductsPage.jsx
    │       ├── AdminDemosPage.jsx
    │       ├── AdminOrdersPage.jsx      # Kèm xem thông số Crop/DPI & tải ảnh gốc của khách
    │       ├── AdminSupportBoardPage.jsx
    │       ├── AdminContactSettingsPage.jsx
    │       ├── AdminMembersPage.jsx
    │       └── AdminRegistrationPage.jsx
    └── routes/
        └── AppRoutes.jsx
```

### 5.2. Hợp đồng Hàm lõi Frontend (Interfaces chính xác)

```javascript
// 1. src/utils/photoQuality.js
/**
 * Tính mật độ điểm ảnh (DPI) khi in kích thước cm từ kích thước pixel gốc.
 * @returns {{ dpi: number, level: 'high'|'medium'|'low', label: string }}
 */
export function evaluatePhotoPrintQuality(widthPx, heightPx, targetWidthCm, targetHeightCm) { /* ... */ }

// 2. src/utils/photoPricing.js (dùng decimal.js)
/**
 * Tính giá in ảnh hỗ trợ 3 chế độ: theo cỡ + bậc số lượng (PerPrintSizeTier), theo sản phẩm (PerUnit), hoặc theo m² (PerSqm).
 */
export function calculatePhotoPrintPrice({
  pricingMode,
  basePrice,
  sizePrice,
  surfacePrice,
  surfacePricingUnit, // 'PerUnit' | 'PerSqm'
  widthCm,
  heightCm,
  minBillableAreaSqm,
  quantity,
  selectedFinishing,
  discountTiers,
  rushSurchargePercent,
}) { /* ... */ }

// 3. src/utils/socialLinks.js
export function resolveMessengerUrl(config, prefillMessage = '') { /* ... */ }
export function resolveZaloUrl(config) { /* ... */ }
export async function generateQrDataUrl(targetUrl, options = { width: 320, margin: 2 }) { /* ... */ }
```

---

## 6. CÁC TRƯỜNG HỢP BIÊN BẮT BUỘC PHẢI XỬ LÝ (EDGE CASES & BẢO MẬT)

1. **Ảnh xoay dọc (Portrait) vs Ảnh ngang (Landscape) khi kiểm tra DPI & Crop**:
   - Ảnh kích thước `3000x4000` (dọc) in cỡ `10x15` phải tự động khớp chiều `10` với cạnh ngắn `3000` và chiều `15` với cạnh dài `4000` (`auto-orientation`), tránh báo sai DPI chỉ vì người dùng chọn `10x15` thay vì `15x10`!
2. **Upload nhiều ảnh lớn cùng lúc & Quản lý bộ nhớ ObjectURL**:
   - Revoke mọi `URL.createObjectURL(file)` khi xóa ảnh khỏi uploader hoặc unmount component để không tràn RAM trình duyệt khi khách chọn 50–100 tấm ảnh.
   - Upload lên server tuần tự theo lô nhỏ (concurrency = 3) kèm retry và progress bar rõ ràng.
   - Backend chỉ nhận `image/png`, `image/jpeg`, `image/webp` cho ảnh đặt in/QR (chặn SVG để tránh Stored XSS), kiểm tra magic bytes, phục vụ qua header `X-Content-Type-Options: nosniff`.
3. **Bảo mật URL & XSS trên cấu hình Messenger / Zalo**:
   - Lọc mọi link qua `getSafeHttpUrl()` + whitelist host (`m.me`, `messenger.com`, `facebook.com`, `zalo.me`, `oa.zalo.me`). FluentValidation ở BE kiểm tra định dạng trước khi lưu.
4. **Tránh lệch giá Client vs Server khi Checkout**:
   - Server luôn tính lại giá từ bảng `PhotoProducts` theo `TenantId`, không dùng giá gửi từ client.
5. **WebGL Context Loss & Memory Leak trên Three.js**:
   - Dispose `CanvasTexture`, `Geometry`, `Material`, `Renderer` mỗi lần khách thay ảnh hoặc chuyển mẫu 3D; fallback mượt sang `Fallback25DViewer` nếu thiếu WebGL hoặc trong `jsdom`.
6. **Cách ly Multi-tenant & Chuyển Workspace**:
   - Giỏ hàng `localStorage` scope theo `workspaceKey()`; `WorkspaceGate` chỉ chặn các route cần auth (`/admin/*`), giữ toàn bộ storefront mở cho khách vãng lai.
7. **Optimistic Concurrency & Double-Submit**:
   - Đổi trạng thái đơn in & support ticket bắt buộc gửi `expectedRevision` (`409 Conflict` khi đụng độ); khóa nút khi đang submit/upload.

---

## 7. TÍCH HỢP VÀO HỆ SINH THÁI ONEPORTAL (CHECKLIST FILE CẦN SỬA)

- `FE_Portal/src/applications.js`: Thêm `photoPrintOrigin = readAppOrigin(import.meta.env.VITE_PHOTOPRINT_ORIGIN, '5177')` và entry `{ key: 'photoprint', name: 'Photo Print Shop', description: 'Đặt in ảnh trực tuyến, kiểm tra DPI & Demo khung 3D', origin: ... }`.
- `FE_Tenant/src/App.jsx` & `FE_Tenant/src/components/MemberPanel.jsx`: Cập nhật danh sách appKey hỗ trợ `"photoprint"`.
- `scripts/verify-frontend-architecture.mjs`: Thêm `'FE_PhotoPrint'` vào `apps` và kiểm tra `scopeRequest` & `assertCurrentScope`.
- `_Docs/ONEPORTAL_MULTI_TENANCY.md` & `README.md`: Cập nhật thêm `FE_PhotoPrint` (port `5177`).
- `render.yaml` / `render-free.yaml` / `BE/src/Gateway/appsettings.json`: Cập nhật `Cors:AllowedOrigins` và route cluster `photoprint`.

---

## 8. LỘ TRÌNH TRIỂN KHAI THEO CHẶNG (EXECUTION PHASES CHO CODEX)

1. **Chặng 1 — Backend Tenancy Wiring + Domain `PhotoPrint` + Migration**:
   - Cập nhật `TenantDefaults`, `TenantContext`, Tenancy handlers, `TenantRoutingMiddleware`, `Gateway`, `ApplicationDbContext`, `PhotoPrintFoundationSeed`, Migration `AddPhotoPrintModuleSchema`, và `TenantArchitectureTests`.
   - Verify: `dotnet build BE/OnePortal.sln && dotnet test BE/OnePortal.sln --filter Architecture`.
2. **Chặng 2 — Backend Minimal APIs, UseCases (CQRS) & Tests**:
   - Triển khai `PhotoProductApi`, `PhotoUploadApi`, `PhotoDemoApi`, `PhotoOrderApi`, `PhotoSupportApi`, `PhotoContactConfigApi` + Unit & Integration tests.
   - Verify: `dotnet test BE/OnePortal.sln`.
3. **Chặng 3 — Khởi tạo `FE_PhotoPrint` + Tailwind/Uiverse Design System + OnePortal Shell**:
   - Tạo `FE_PhotoPrint/` (port `5177`), cài `axios`, `react-router-dom`, `lucide-react`, `decimal.js`, `three`, `qrcode`, `tailwindcss`.
   - Viết `tenantScope.js`, `axios.js`, `portalNavigation.js`, `safeUrl.js`, `authStorage.js`, `CartContext`, `ContactConfigContext`, bộ `src/components/uiverse/*`.
   - Cập nhật `FE_Portal`, `FE_Tenant`, `scripts/verify-frontend-architecture.mjs`.
4. **Chặng 4 — Engine Nghiệp vụ Ảnh (`photoQuality.js`, `photoPricing.js`) + Social QR + Three.js**:
   - Implement `BatchPhotoUploader`, `PhotoCropModal`, `socialLinks.js`, `FloatingSocialDock`, `SocialConnectModal` (QR Zalo gửi ảnh HD + Messenger), `PhotoMeshFactory` + `ThreeStageCanvas` + `Fallback25DViewer`.
5. **Chặng 5 — Toàn bộ Pages Storefront & Admin**:
   - `HomePage`, `ServicesPage`, `ServiceDetailPage`, `DemoStudioPage`, `CartPage`, `CheckoutPage`, `OrderTrackingPage`, `SupportPage`, và đầy đủ `/admin/*` (bao gồm xem crop/DPI & tải ảnh gốc của đơn).
6. **Chặng 6 — Kiểm thử Toàn diện & Nghiệm thu**:
   - Vitest + React Testing Library (`FE_PhotoPrint/test/`) đầy đủ 3 nhóm Happy Paths / Edge Cases / Negative Cases (DPI auto-orientation, batch upload & crop metadata, tính giá bậc số lượng, Zalo/Messenger URL & QR modal, WebGL fallback, Admin Kanban/Order concurrency).
   - Chạy `dotnet test BE/OnePortal.sln`, `node scripts/verify-frontend-architecture.mjs`, `npm test && npm run build` trên tất cả FE.
