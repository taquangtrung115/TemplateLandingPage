# Review và chuẩn hóa Quoting — 08/11/2026

Source: `C:\Source\TemplateLandingPage`. Giữ React 19 / Tailwind 3 / Vite 6 / Astryx Core 0.7.11 và backend .NET 10 / CQRS / MediatR / EF Core / PostgreSQL. Các thay đổi không liên quan đang có trong workspace được giữ lại. Không commit, push, deploy hoặc migrate database thật trong lượt review này.

## Nghiệp vụ đã chốt và thực hiện

- PDF gửi khách hàng là nguồn giá ưu tiên. Seed 11 sản phẩm và ảnh thật, dùng 40.000đ cho XQ-04 và 50.000đ cho XQ-05; đối chiếu tên, mô tả, ĐVT với PDF/Excel. Khử trùng theo mã và tên chuẩn hóa. Không ghi đè giá danh mục đã sửa, không phục hồi bản ghi đã xóa mềm và không tạo khách hàng giả.
- Giá danh mục là giá mặc định; từng dòng báo giá có đơn giá riêng được phép sửa theo khách hàng. Thay giá trên báo giá không cập nhật sản phẩm. Sửa danh mục hoặc xuất lại không đổi đơn giá của báo giá đã lưu.
- Mặc định báo giá chung, không chọn khách hàng và không cộng thêm VAT. Chỉ khi chọn mới thêm thông tin khách hàng hoặc dòng VAT. Ghi chú giá đã gồm VAT vốn có trong PDF được giữ lại khi không cộng thêm thuế.
- Có công tắc **Thêm VAT** ở bước lập báo giá và **Thêm VAT khi xuất** ở trang chi tiết. Bản xem trước/tổng tiền tệp thay đổi theo tùy chọn xuất; giá trị báo giá đã lưu giữ nguyên. Không tự đặt hạn 30 ngày khi chưa chọn hạn.
- Lưu phiên bản mẫu riêng; báo giá cũ tiếp tục dùng đúng phiên bản đã chọn. Có Drawer tạo mẫu độc lập, không vô tình lưu vào mẫu khác.

## Lỗi chính đã sửa

| Vấn đề phát hiện | Kết quả sửa |
| --- | --- |
| FE đọc sai Result<Guid>, lồng object vào status/fileType gây 400 | Chuẩn hóa wrapper và DTO giữa BE/FE; service/consumer được kiểm tra contract thực tế |
| Dữ liệu mẫu xuất hiện khi API lỗi hoặc database rỗng | Bỏ fallback giả, thêm trạng thái lỗi, thử lại và EmptyState đúng tình trạng |
| Sửa dòng báo giá/thêm phiên bản mẫu bị EF nhận sai GUID đã gán | Mapping `ValueGeneratedNever`, giữ transaction cập nhật và lịch sử |
| Tạo nhiều báo giá cùng lúc bị trùng số | PostgreSQL sequence cấp số nguyên tử, kiểm tra 8 request đồng thời |
| Dashboard và danh sách chỉ tính dữ liệu trang đầu | Tổng hợp phía DB, phân trang/sắp xếp ổn định, kiểm tra dữ liệu quá 20 dòng |
| PDF tự ghi ASCII làm mất dấu, giới hạn một trang | PDFsharp + Noto Sans nhúng, ngắt dòng/trang, nhúng ảnh gốc, kiểm tra PDF bằng trình đọc chuẩn |
| Tải file qua URL không xác thực hoặc endpoint không tồn tại | Endpoint tải Blob có JWT, kiểm tra file thuộc báo giá, lưu local ngoài static root |
| Supabase lỗi làm mất/dispose stream trước fallback | Giữ stream của caller, khôi phục vị trí, kiểm tra đầy đủ bytes và cancellation; private route, chặn gửi service key sang origin/bucket khác |
| Form cấu hình không tải đúng phiên bản, hỗ trợ báo thành công giả | Hydrate đúng dữ liệu mẫu; yêu cầu hỗ trợ chỉ thành công sau khi lưu DB và có mã yêu cầu |
| Lỗi runtime Astryx RadioList khi chạy Vite | Dùng build đã biên dịch của Astryx; bỏ source-build plugin yêu cầu Vite 8 khỏi app Vite 6 |
| Button/icon thiếu nhãn, Field không liên kết textbox | Control Astryx, nhãn truy cập đầy đủ, liên kết Field/Input; màu theo hành động và tương phản chữ |
| Thông báo lỗi lẫn tiếng Anh/generic trống | Chuẩn hóa thông báo BE middleware sang tiếng Việt; xử lý errors rỗng, Blob lỗi, 401 và quyền truy cập |

## Giao diện

- Sáng: Neutral; tối: Gothic. Chuyển theme được lưu và đồng bộ giữa các tab; có công tắc tại login và layout.
- SideNav chia nhóm, chuyển sang menu mobile. Panel tóm tắt nằm bên phải ở desktop từ 1280px, xếp dọc trên màn hình nhỏ.
- Drawer cho tạo/sửa danh mục, Calendar cho ngày, phân trang mặc định 20, Skeleton, Toast, AlertDialog, EmptyState và animation của Astryx. Tôn trọng giảm chuyển động.
- Form đăng nhập không điền sẵn tài khoản/mật khẩu; dùng autocomplete phù hợp và quay lại route yêu cầu sau đăng nhập. BE vẫn quyết định quyền thực tế.
- Đã xem ảnh desktop sáng/tối, mobile và PDF render. Ảnh lấy từ database kiểm thử nên có các mẫu/khách hàng do test tạo.

Ảnh: [desktop sáng](ui-desktop-light.png), [desktop tối](ui-desktop-dark.png), [danh mục sản phẩm](ui-products-dark.png), [mobile sáng](ui-mobile-light.png).

## Kiểm thử

| Lớp kiểm tra | Kết quả |
| --- | --- |
| BE unit | 528 đạt |
| BE architecture | 7 đạt |
| BE API + PostgreSQL thật | 30 đạt |
| FE Vitest/component/contract | 180 đạt |
| Playwright toàn bộ ma trận | 45 đạt trên 5 cấu hình viewport/theme |
| FE production build | Đạt; thêm 4 ca browser trên bản production build đã đạt; còn cảnh báo chunk nền tảng >500 KB |
| EF migration/model | Không có thay đổi model chưa có migration |
| `git diff --check` phần BE/FE | Đạt |

Ma trận E2E: desktop 1440px sáng/tối, mobile tối 375px, mobile sáng 390px và 320px. Bao gồm đăng nhập không lộ tài khoản, chuyển/lưu theme, các route, CRUD Drawer, giá theo khách hàng, sửa nháp, template độc lập, bỏ qua khách hàng, VAT tùy chọn, xuất/tải PDF và đổi trạng thái. Axe kiểm tra lỗi serious/critical theo WCAG 2 A/AA và 2.1 AA trên các trang chính; đây không phải tuyên bố chứng nhận accessibility đầy đủ.

BE tích hợp kiểm tra JWT thật, 401, User không thể giả Admin, validation/paging/giá/độ chính xác/null item, file không thuộc báo giá, snapshot giá/mẫu, sửa sau trạng thái đã gửi, số báo giá đồng thời, tổng hợp nhiều trang và lưu yêu cầu hỗ trợ theo user thật. Storage unit dùng HTTP transport giả lập; không gọi Supabase thật.

Coverage FE đo bằng V8: **80,75% statements; 69,56% branches; 72,96% functions; 83,69% lines**. Chưa phải 100% coverage. E2E bổ sung các đường chạy browser/Blob/download không phản ánh hết trong coverage Vitest.

Bằng chứng: `be-verification-final.log`, `fe-coverage-final.log`, `fe-build-final.log`, `playwright-full-matrix.json`, `browser-matrix-final.log`. Lượt bổ sung kiểm tra bảng đã tải đủ dữ liệu và xuất file: `browser-loaded-pages-final.log`, `playwright-loaded-pages.json` (20/20 đạt). Lượt production build: `browser-production-final.log`, `playwright-results.json` (4/4 đạt).

PDF mẫu: [11 sản phẩm, 2 trang](quotation-base.pdf), [40 dòng/mô tả dài, 7 trang](quotation-multipage.pdf). Chữ tiếng Việt, ảnh và sản phẩm cuối đã được kiểm tra bằng pypdf và render Poppler. [Kết quả đọc PDF](pdf-verification.json).

## Migration và vận hành

- Quoting dùng schema `quo`; có migration bổ sung nullable CustomerId, bảng SupportRequests, sequence QuotationNumbers và metadata GUID do domain cấp.
- [SQL migration idempotent](quoting-migrations.sql) được tạo từ sau VersionedPublishing đến migration Quoting mới nhất. Chỉ chạy trên database đích theo quy trình triển khai của dự án; chưa chạy SQL này trên dữ liệu thật.
- Supabase hiện chưa có cấu hình URL/key/bucket khả dụng trong cấu hình local được kiểm tra. Code hỗ trợ private Storage, có fallback local và test hợp đồng/bảo mật; chưa xác minh bucket hoặc upload cloud thực tế.
- PDF nhúng ảnh của 11 sản phẩm gốc. Với sản phẩm tự thêm có ảnh URL ngoài, UI/HTML dùng URL đó; việc tải/nhúng ảnh URL ngoài vào PDF chưa có trong renderer này.
- Tệp xuất local cần volume lưu trữ bền vững và backup khi deploy. File mới tải qua API có xác thực; đường dẫn static mặc định của file cũ được chặn, còn endpoint có xác thực đọc được thư mục cũ để giữ tương thích. Nên chuyển tệp cũ sang volume riêng khi vận hành.
- Dữ liệu/seeder thật chưa được sửa trong lượt test; database và file kiểm thử dùng không gian riêng. Seed thêm bản ghi còn thiếu, giữ giá đang có để bảo toàn chỉnh sửa của người dùng.

Hướng dẫn cấu hình/chạy test: `FE_Quoting/README.md`. Runtime PostgreSQL, database, browser artifacts và baseline phục vụ kiểm thử local được loại khỏi source bằng .gitignore.

Đã dừng API/Vite/PostgreSQL do lượt kiểm thử này khởi chạy; giữ nguyên tiến trình Vite có sẵn của người dùng. [Tổng hợp kiểm chứng](verification.json).
