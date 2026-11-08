# FE_Quoting

Ứng dụng báo giá độc lập trong monorepo `TemplateLandingPage`. Một `src` là một ứng dụng; không import source từ app `FE`.

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

## Giao diện

Theme tối dựa trên Gothic, theme sáng dựa trên Neutral; màu nút theo hành động, badge trạng thái và nhãn tiếng Việt. SideNav chia nhóm nghiệp vụ/danh mục/cấu hình/hỗ trợ, chuyển thành điều hướng mobile. Drawer tạo/sửa danh mục; bảng dùng vùng cuộn ngang của Astryx, mặc định 20 dòng. Riêng sản phẩm trên mobile dùng thẻ hiển thị đủ mã, mô tả, nhóm, ĐVT, giá, trạng thái và thao tác. Tóm tắt báo giá ở bên phải từ 1280px, chuyển dưới nội dung trên màn hình hẹp. Control ngày dùng Calendar, thông báo dùng Toast, form có nhãn/validation/loading.

## Chạy local

```powershell
cd C:\Source\TemplateLandingPage\FE_Quoting
npm ci
npm run dev
```

FE mặc định cổng 5174, proxy `/api` đến `http://127.0.0.1:54611`. Có thể đặt `QUOTING_API_PROXY_TARGET` trước khi khởi động Vite hoặc `VITE_API_BASE_URL` cho API riêng. Không đưa secret vào biến `VITE_*`.

BE cần cấu hình `ConnectionStrings__DefaultConnection`, `Jwt__SecretKey`, issuer/audience theo môi trường. Áp dụng EF migrations bằng quy trình deploy của dự án. `SeedData__Enabled=true` chỉ dành cho development được bật rõ ràng; `SeedData__IncludeCatalog=false` tránh seed catalog landing page không liên quan. Review các tài khoản demo của seeder trước khi dùng ngoài môi trường kiểm thử.

HTML nhúng ảnh của các sản phẩm gốc thành data URI để mở offline. Ảnh URL ngoài vẫn cần kết nối mạng. PDF chuẩn hóa Unicode NFC để ký tự ghép dấu hiển thị đúng, dùng PDFsharp và font Noto Sans thường/đậm nhúng (kèm giấy phép OFL), giữ tiếng Việt, hình sản phẩm gốc và ngắt nhiều trang. Tệp báo giá được lưu ở thư mục riêng `App_Data/quotations` hoặc `Quoting:Storage:LocalPath`, tải qua endpoint JWT `/{quotationId}/files/{fileId}/download`. Không công khai thư mục xuất qua static files. Endpoint có xác thực đọc được file ở thư mục cũ `wwwroot/exports/quotations` (hoặc `Quoting:Storage:LegacyPath`); đường dẫn static mặc định của thư mục này bị chặn.

Supabase Storage được hỗ trợ nếu có `Supabase:Url`, `Supabase:ServiceRoleKey`, `Supabase:Bucket` phía BE. Khi chưa cấu hình hoặc upload lỗi, lưu local; file không bị mất bytes sau fallback. Dùng private bucket, service key chỉ ở BE. Cấu hình local được kiểm tra chưa có thông tin Supabase; chưa xác minh upload trên tài khoản cloud thực tế.

## Kiểm thử

```powershell
# FE unit/component và coverage
npm test
npm run test:coverage
npm run build

# BE: unit, architecture và API/DB thật
cd C:\Source\TemplateLandingPage\BE
dotnet test TemplateLandingPage.sln
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

Playwright dùng FE cổng 5184, kiểm tra desktop sáng/tối và mobile 320/375/390px, CRUD, tạo/sửa/xuất PDF, VAT tùy chọn, đăng nhập, phiên bản mẫu, overflow và Axe accessibility. Các request và dữ liệu đều là thật, không dùng mock API. E2E làm thay đổi dữ liệu nên chỉ chạy với database kiểm thử.

Bằng chứng và báo cáo nằm trong `PromtAI/.codex/results/fe-quoting-review-20261108`. Vitest là kiểm thử component, không được gọi là full E2E; bằng chứng full flow nằm ở Playwright và integration tests PostgreSQL.
