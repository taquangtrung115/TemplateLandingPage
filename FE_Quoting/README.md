# FE_Quoting

Ứng dụng báo giá độc lập trong monorepo `TemplateLandingPage`. Một `src` là một ứng dụng; không import source từ app `FE_TemplateLandingPage`.

Xem [OnePortal multi-tenancy](../_Docs/ONEPORTAL_MULTI_TENANCY.md) cho API canonical, membership, seed theo tenant, RSA và triển khai Gateway. Danh mục legacy bên dưới chỉ áp dụng `quoting-default`; tenant mới dùng dữ liệu nền tảng trung tính.

## Kiến trúc

- React 19, React Router 7, JavaScript, Vite 6, Tailwind 3; giữ cùng nền tảng React/Tailwind của source hiện tại.
- Astryx Core 0.7.11: import control trực tiếp từ `@astryxdesign/core/<Component>`. Dùng CSS/component đã biên dịch của thư viện. Không bật plugin source-build Astryx vốn yêu cầu Vite 8 trên app Vite 6 này.
- `src/api`: mọi HTTP request đi qua Axios client chung, JWT và chuẩn hóa Result/lỗi. Component không tự fetch hoặc đọc URL lưu trữ để tải file.
- `src/contexts`: xác thực dùng lại hệ thống BE, theme sáng/tối lưu tại `quoting.colorMode`.
- `src/pages`: dashboard, sản phẩm, khách hàng, lập/chi tiết báo giá, cấu hình mẫu, yêu cầu hỗ trợ.
- `src/components/common`: phối hợp control Astryx, không xây control HTML thay thế. CSS riêng chỉ phục vụ bố cục và responsive.
- Backend .NET 10, CQRS/MediatR/Result; PostgreSQL/EF Core. Quoting có API `/api/v1/quoting` và bảng riêng trong schema `quo`.

## Quy tắc nghiệp vụ

PDF gửi khách hàng là nguồn giá ưu tiên. Danh mục có 11 sản phẩm và ảnh từ hai tài liệu gốc; XQ-04 = 40.000đ, XQ-05 = 50.000đ. Seed khử trùng theo mã/tên chuẩn hóa, không ghi đè giá đã sửa hoặc hồi sinh dữ liệu xóa mềm. Không tạo khách hàng giả từ tài liệu.

Giá danh mục là giá mặc định. Khi chọn sản phẩm, đơn giá được sao chép vào dòng báo giá; người dùng được đổi giá đó theo từng khách hàng. Sửa danh mục hoặc mẫu sau này không thay đổi báo giá cũ. Mỗi báo giá giữ thông tin khách hàng/sản phẩm và phiên bản mẫu tại lúc lập.

Báo giá mới mặc định bỏ qua khách hàng, không cộng thêm VAT. PDF gốc có ghi giá đã gồm VAT. Chỉ khi bật **Thêm VAT** mới hiện thuế suất, tính và lưu thuế cộng thêm. Không chọn khách hàng thì không xuất khối thông tin khách hàng; không chọn VAT thì không xuất dòng VAT cộng thêm. Ghi chú VAT vốn có trong mẫu PDF được giữ lại.

Trang chi tiết có **Thêm VAT khi xuất**. Tùy chọn này cập nhật bản xem trước và tổng tiền của tệp xuất, không sửa giá trị báo giá đã lưu. Mỗi lần xuất lưu một tệp độc lập; tải lại tệp cũ giữ nguyên nội dung đã xuất. API export/preview hỗ trợ `taxPercent` tùy chọn: bỏ trường để dùng giá trị đã lưu, truyền `0` để không cộng thêm VAT.

Chỉ báo giá nháp được sửa. **Đánh dấu đã gửi** chỉ ghi nhận trạng thái, không tự gửi email. Các thao tác xóa có xác nhận và dùng xóa mềm. Sản phẩm/mẫu chỉ quản trị viên được thay đổi; BE kiểm tra quyền thực tế từ tài khoản.

Yêu cầu hỗ trợ được lưu tại `quo.SupportRequests`, gắn người dùng đã xác thực. Quản trị viên xử lý tại `/support` bằng Kanban Mới → Đang xử lý → Đã xử lý, có thể mở lại; lưu người/thời điểm thay đổi và revision để ngăn ghi đè cập nhật đồng thời. Mỗi cột có tìm kiếm/lọc mức ưu tiên và phân trang 20. Trên mobile, chọn cột qua thanh trạng thái. Migration `AddQuotingSupportWorkflow` bổ sung dữ liệu trạng thái; các yêu cầu cũ mặc định Mới. Màn hình chỉ báo thành công sau khi API lưu; không tự gửi email hay cam kết thời gian xử lý.

## Nhóm sản phẩm và tùy chọn báo giá (2026-11-10)

Danh mục `/product-groups` quản lý mã, tên, mô tả, thứ tự (`sortOrder`) và trạng thái. Hai nhóm khởi tạo là **A/ DÒNG COMBO** và **B/ DÒNG SẢN PHẨM XIÊN QUE**. Sản phẩm chọn `groupId` từ danh mục; `category` được giữ trong contract để tương thích client cũ. API chỉ nhận nhóm hợp lệ; cập nhật cũ không gửi nhóm sẽ giữ nhóm hiện tại. Nhóm đang có sản phẩm chưa xóa không thể xóa. Nhóm ngưng dùng không được dùng để thêm sản phẩm hoặc chọn mới khi lập báo giá.

Bước Sản phẩm có picker tìm kiếm và thêm cả nhóm, không thêm trùng hoặc tự tăng số lượng khi chọn lại. Mỗi báo giá giữ tên và thứ tự nhóm tại lúc lập; đổi danh mục không làm đổi nội dung file của báo giá đã lưu.

Bốn cờ `showDiscount`, `showQuantity`, `showSubTotal`, `showGrandTotal` được lưu theo báo giá, mặc định **false** ở báo giá mới. Tắt số lượng dùng số lượng 1; tắt CK không gửi chiết khấu. `showGrandTotal` điều khiển cả Thành tiền và TỔNG CỘNG. Màn hình, HTML và PDF dùng cùng cấu hình. Preview ở bước Xác nhận tạo gọi `POST /api/v1/quoting/quotations/preview-draft`, dựng bằng renderer xuất thật mà không lưu bản nháp hay cấp số báo giá.

Migration **AddQuotingProductGroupsAndDisplayOptions** cần chạy trước khi triển khai BE mới. Migration chuyển nhóm nhập tay hiện có sang danh mục, liên kết sản phẩm và giữ cả 4 cờ **true** cho báo giá cũ để bảo toàn cách hiển thị. Client cũ sửa nháp mà không gửi bốn cờ sẽ giữ nguyên lựa chọn đã lưu. Không tự chạy migration lên production. Triển khai BE và FE cùng đợt; FE mới cần endpoint nhóm và preview mới.

### Seed danh mục bằng một lần migration

Migration dữ liệu `20261110102142_SeedQuotingProductCatalog` chạy tiếp sau migration cấu trúc nhóm. Từ `C:\Source\TemplateLandingPage`, dùng cấu hình kết nối migration hiện có (hoặc `TEMPLATE_MIGRATION_CONNECTION_STRING`) rồi chạy một lệnh:

```powershell
dotnet ef database update --project BE/src/Persistence --startup-project BE/src/API
```

Lệnh áp dụng toàn bộ migration chưa chạy và seed hai nhóm **COMBO** / **XIEN-QUE** cùng 11 sản phẩm chuẩn (6 Combo, 5 Xiên que); không cần gọi seeder riêng hoặc bật `SeedData__Enabled` cho hai danh mục này. Nếu migration cấu trúc nhóm đã chạy thì chỉ migration seed còn thiếu được áp dụng.

Seed chỉ thêm sản phẩm thiếu, đối chiếu cả mã và tên đã chuẩn hóa Unicode/khoảng trắng/hoa thường. Giữ giá, đơn vị, mô tả, ảnh upload, trạng thái ngưng dùng/xóa mềm và cấu hình nhóm đã sửa; nhóm riêng và báo giá cũ được giữ nguyên. Sản phẩm chuẩn chưa có nhóm được gắn nhóm tương ứng. Bản ghi seed được giữ khi rollback migration dữ liệu để tránh xóa các sản phẩm đã được sử dụng.

## Giao diện

Theme sáng dựa trên Neutral và là mặc định khi chưa có lựa chọn hợp lệ; theme tối dựa trên Gothic. Lựa chọn sáng/tối đã lưu của người dùng được giữ lại. Màu nút theo hành động, badge trạng thái và nhãn tiếng Việt. SideNav chia nhóm nghiệp vụ/danh mục/cấu hình/hỗ trợ, chuyển thành điều hướng mobile. Drawer tạo/sửa danh mục; bảng desktop dùng Astryx, thao tác DropdownMenuItem cố định bên phải, mặc định 20 dòng. Các bảng trên mobile dùng thẻ; sản phẩm dùng thẻ hiển thị đủ mã, mô tả, nhóm, ĐVT, giá, trạng thái và thao tác. Tóm tắt báo giá ở bên phải từ 1280px, chuyển dưới nội dung trên màn hình hẹp. Control ngày dùng Calendar, thông báo dùng Toast, form có nhãn/validation/loading.

## Chạy local

```powershell
cd C:\Source\TemplateLandingPage\FE_Quoting
npm ci
npm run dev
```

FE mặc định cổng 5174, proxy `/api` và `/t/{key}/api` đến Gateway `http://127.0.0.1:54612`. Có thể đặt `QUOTING_API_PROXY_TARGET` trước khi khởi động Vite hoặc `VITE_API_BASE_URL` cho API riêng. Không đưa secret vào biến `VITE_*`.

### Routes và triển khai Vercel

Vercel project của app báo giá phải đặt **Root Directory = `FE_Quoting`**, framework **Vite**, build `npm run build`, output `dist`. File `FE_Quoting/vercel.json` phục vụ `index.html` khi mở trực tiếp/refresh các URL React Router, gồm `/login`, `/quotations`, `/quotations/create`, `/quotations/:id`, `/quotations/:id/edit`, `/products`, `/customers`, `/templates`, `/contact` và `/support`.

Đặt `VITE_API_BASE_URL` là URL Gateway Render (có thể kèm `/api/v1`) tại môi trường build Vercel. Proxy trong Vite chỉ dành cho local; SPA rewrite không thay thế backend API. Sau khi đổi source/cấu hình cần deploy lại frontend để bản đang chạy nhận thay đổi. Cấu hình này theo [hướng dẫn Vite SPA của Vercel](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas).

Các URL trang dùng `Cache-Control: no-store, max-age=0` để trình duyệt không lưu HTML trỏ vào bundle của bản deploy cũ. `/assets/` và `/api/` được loại khỏi SPA rewrite/header này; file JS/CSS bị thiếu phải trả lỗi thật thay vì `index.html`. Không xóa localStorage/cookie hoặc phiên đăng nhập để xử lý cache. Nếu máy đã giữ trang cũ từ trước thay đổi, mở một URL login có query mới để buộc tải lại, ví dụ `/login?verify=<mã bản deploy>`.

Mọi route nghiệp vụ vẫn kiểm tra phiên đăng nhập. Chưa đăng nhập/hết phiên → `/login`; đăng nhập thành công quay lại đầy đủ pathname, query và hash, kể cả sau khi refresh trang login. Phiên hợp lệ mở `/login` được đưa về trang nghiệp vụ. Backend tiếp tục kiểm tra JWT và quyền Admin như trước.

Login dùng lưới CSS có độ rộng rõ ràng, một cột trên màn hình ≤640px; form hiển thị trước phần giới thiệu. Không dùng container query để tính độ rộng form. Ô nhập trên mobile tối thiểu 16px để tránh iOS tự zoom khi focus.

BE cần cấu hình `ConnectionStrings__DefaultConnection`, `Jwt__PrivateKeyPem`, `Jwt__PublicKeyPem`, issuer/audience theo môi trường. Áp dụng EF migrations bằng quy trình deploy của dự án. `SeedData__Enabled=true` chỉ dành cho development được bật rõ ràng; `SeedData__IncludeCatalog=false` tránh seed catalog landing page không liên quan. Review các tài khoản demo của seeder trước khi dùng ngoài môi trường kiểm thử.

PDF và HTML lấy ảnh theo `ImageUrl` đã lưu trên dòng báo giá; không suy đoán ảnh theo `ProductCode`. Điều này giữ đúng ảnh khi mã sản phẩm khác tên file ảnh hoặc khi thay ảnh trong danh mục. Tệp đã xuất trước thay đổi là bản lưu lịch sử; cần xuất tệp mới để áp dụng bản sửa renderer.

HTML nhúng ảnh của các sản phẩm gốc và ảnh upload thành data URI để mở offline. Ảnh URL ngoài cũ (Unsplash) cũng được tải và nhúng vào cả HTML/PDF theo đúng `ImageUrl` snapshot, nên file mở offline vẫn có ảnh. Bộ tải chỉ chấp nhận HTTPS cổng 443, không theo redirect, không gửi khóa storage; mặc định cho phép `images.unsplash.com` và host Supabase đã cấu hình. CDN khác cần khai báo từng hostname trong `Quoting:Images:AllowedRemoteHosts` (biến môi trường ví dụ `Quoting__Images__AllowedRemoteHosts__0=cdn.example.com`). Giới hạn mỗi ảnh 5 MB/16 MP, cạnh tối đa sau chuẩn hóa 1600 px; các lượt tải được gom theo URL, song song tối đa 4 và có thời hạn 45 giây cho tài liệu. Khi ảnh đã lưu không tải được, preview/export trả `Quotation.ImageUnavailable`, không tạo tệp thiếu ảnh. Không cần migration dữ liệu cho bản sửa này. PDF chuẩn hóa Unicode NFC để ký tự ghép dấu hiển thị đúng, dùng PDFsharp và font Noto Sans thường/đậm nhúng (kèm giấy phép OFL), giữ tiếng Việt, hình sản phẩm gốc/ảnh upload và ngắt nhiều trang. Tệp báo giá được lưu ở thư mục riêng `App_Data/quotations` hoặc `Quoting:Storage:LocalPath`, tải qua endpoint JWT `/{quotationId}/files/{fileId}/download`. Không công khai thư mục xuất qua static files. Endpoint có xác thực đọc được file ở thư mục cũ `wwwroot/exports/quotations` (hoặc `Quoting:Storage:LegacyPath`); đường dẫn static mặc định của thư mục này bị chặn.

Đối với **tệp báo giá xuất**, Supabase Storage được hỗ trợ nếu có `Supabase:Url`, `Supabase:ServiceRoleKey`, `Supabase:Bucket` phía BE. Mặc định thiếu cấu hình hoặc upload lỗi sẽ trả lỗi, không ghi file vào replica local. Chỉ Development một replica mới nên bật `Quoting__Storage__AllowLocalFallback=true`. Dùng private bucket, service key chỉ ở BE. Khi deploy Render, cần Supabase hoặc persistent disk cho tệp báo giá local.

## Upload ảnh sản phẩm trên Render

Quản trị viên mở **Danh mục sản phẩm → Thêm/Sửa sản phẩm → Ảnh sản phẩm**, chọn ảnh trên máy/điện thoại, xem trước rồi **Lưu sản phẩm**. FE dùng `FileInput` Astryx; không yêu cầu nhập URL hay đăng nhập Supabase. Ảnh chỉ upload khi lưu. Lỗi upload giữ nguyên file đang chọn; lỗi lưu sản phẩm sau khi upload cho phép lưu lại mà không upload trùng.

Cấu hình một lần trong **Render → backend service → Environment**, sau đó redeploy backend và frontend đã cập nhật:

| Biến backend | Giá trị |
| --- | --- |
| `Quoting__Images__SupabaseUrl` | `https://<project-ref>.supabase.co` |
| `Quoting__Images__SecretKey` | Secret key `sb_secret_...` của project, chỉ nhập trong Render |
| `Quoting__Images__Bucket` | `product-images` (mặc định, có thể bỏ qua) |

Lấy URL từ Connect và secret key từ **Supabase → Settings → API Keys**. Không dùng publishable/anon key, không đưa secret vào `VITE_*` hoặc chat. Secret key chỉ gửi qua `apikey`; service_role JWT cũ vẫn được hỗ trợ qua `Quoting__Images__ServiceRoleKey`. Có thể dùng lại cấu hình `Supabase:Url` và `Supabase:ServiceRoleKey` hiện hữu. Tham khảo [API keys của Supabase](https://supabase.com/docs/guides/getting-started/api-keys).

BE tự tạo bucket riêng tư khi upload đầu tiên; không cần mở policy upload cho trình duyệt. `POST /api/v1/quoting/products/images` yêu cầu Admin thực tế. BE nhận JPG/PNG tối đa 5 MB, kiểm tra nội dung thật và giới hạn 16 triệu pixel, xoay theo EXIF, bỏ metadata, thu nhỏ cạnh dài về tối đa 1600px. Chưa cấu hình/lỗi storage trả 503 với thông báo dễ hiểu; không báo upload thành công và không fallback sang ổ đĩa tạm.

URL lưu vào sản phẩm là `/api/v1/quoting/product-images/uploads/<guid>.png` hoặc `.jpg`; FE tự dùng API origin đã cấu hình. Bucket vẫn riêng tư; **ảnh sản phẩm** được đọc công khai qua BE để hiển thị trên báo giá. Tệp báo giá có thông tin khách hàng vẫn tải qua JWT như trước. Thay/xóa ảnh khỏi sản phẩm không xóa object cũ, để báo giá đã lưu giữ đúng ảnh. Export chỉ đọc object thuộc bucket đã cấu hình, không fetch URL ngoài tùy ý; ảnh bị thiếu làm export thất bại thay vì xuất nhầm ảnh.

Cloud Supabase thật chưa được xác minh do backend Render chưa có cấu hình; integration/E2E dùng giao thức storage mô phỏng, DB và API ứng dụng thật.

## Kiểm thử

```powershell
# FE unit/component và coverage
npm test
npm run test:coverage
npm run build

# BE: unit, architecture và API/DB thật
cd C:\Source\TemplateLandingPage\BE
dotnet test OnePortal.sln
```

Integration tests tạo và xóa database riêng. Cấu hình `TEMPLATE_TEST_PGHOST`, `TEMPLATE_TEST_PGPORT`, `TEMPLATE_TEST_PGUSER`, `TEMPLATE_TEST_PGPASSWORD` cho PostgreSQL kiểm thử được phép tạo database; mặc định 127.0.0.1:55432, user `template_test`. Không dùng database production.

```powershell
cd C:\Source\TemplateLandingPage\FE_Quoting
npx playwright install chromium
$env:QUOTING_E2E_EMAIL='<tài khoản kiểm thử>'
$env:QUOTING_E2E_PASSWORD='<mật khẩu kiểm thử>'
# Chạy BE trên database riêng và cổng 54611 trước.
npm run test:e2e
```

Playwright dùng FE cổng 5184, kiểm tra desktop sáng/tối, mobile 320/375/390px và iPhone 11 trên WebKit sáng/tối (screen 414×896, viewport 414×715 có thanh trình duyệt). Bao gồm CRUD, tạo/sửa/xuất PDF, VAT tùy chọn, đăng nhập, phiên bản mẫu, overflow và Axe accessibility. `routes-auth-mobile.spec.js` kiểm tra 10 route trực tiếp/refresh, chặn khách chưa đăng nhập, đăng nhập lại sau 401, menu cảm ứng, logout/back, độ rộng form và các bước báo giá có dữ liệu. WebKit mô phỏng không thay thế kiểm tra trên iPhone thật, nhất là phiên bản iOS cũ. API ứng dụng và database chạy thật. E2E làm thay đổi dữ liệu nên chỉ chạy với database kiểm thử. Khi local `.env` trỏ API production, đặt `VITE_API_BASE_URL=/api/v1` trước khi chạy Vite/Playwright để dùng proxy kiểm thử.

Để chạy thêm E2E ảnh upload mà không dùng cloud: chạy `node e2e/fixtures/storage-server.mjs` ở terminal riêng, cấu hình BE kiểm thử `Quoting__Images__SupabaseUrl=http://127.0.0.1:55440` và `Quoting__Images__ServiceRoleKey=synthetic-image-key`, sau đó đặt `QUOTING_E2E_IMAGE_STORAGE=1` trước khi chạy Playwright. Fixture chỉ nghe loopback và lưu trong bộ nhớ. Khi không bật biến này, riêng ca upload được skip. Với máy hạn chế tài nguyên, chạy Vitest bằng `node node_modules/vitest/vitest.mjs run --maxWorkers=2 --coverage`.

Bằng chứng và báo cáo nằm trong `PromtAI/.codex/results/fe-quoting-review-20261108`. Vitest là kiểm thử component, không được gọi là full E2E; bằng chứng full flow nằm ở Playwright và integration tests PostgreSQL.
