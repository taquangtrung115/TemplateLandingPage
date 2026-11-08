# Mobile, xuất file và Kanban hỗ trợ — 08/11/2026

## Đã thay đổi

### Danh mục sản phẩm trên mobile

Dưới 768px, danh mục dùng thẻ Astryx thay bảng rộng. Mỗi sản phẩm hiển thị mã, tên, ảnh, mô tả, nhóm, đơn vị tính, giá danh mục, trạng thái và nút sửa/xóa. Bộ lọc và phân trang 20 vẫn dùng dữ liệu thật. Desktop giữ bảng. Các bảng chung dùng vùng cuộn của Astryx, bỏ lớp cuộn lồng và min-width 720px trước đây.

Ảnh sản phẩm dạng `/api/...` được resolve theo host `VITE_API_BASE_URL` khi FE/BE nằm ở Vercel/Render khác domain; không sửa URL gốc đã lưu trong dữ liệu báo giá.

### HTML có ảnh khi tải về

Renderer nhúng ảnh 11 sản phẩm gốc vào HTML bằng data URI từ resource trong assembly, cache theo ảnh trong từng lần render. File mở offline không còn phụ thuộc `/api/...` của domain đang mở. Không tải URL bất kỳ từ server, tránh tạo SSRF. Ảnh URL ngoài do người dùng nhập vẫn dùng URL ngoài và cần mạng.

### PDF tiếng Việt

Đã tái hiện lỗi với Unicode dạng ghép dấu (NFD): dấu đặt lệch ở tên/mô tả sản phẩm. Sửa bằng chuẩn hóa NFC trước đo/vẽ chữ, nhúng đầy đủ Noto Sans Regular và Bold thật, dùng encoding Unicode và bản đồ ToUnicode. Không dựa vào font hệ điều hành hoặc giả lập đậm.

Probe trước sửa cho ảnh render NFC/NFD khác nhau; sau sửa hai ảnh render giống hoàn toàn theo pixel. Kiểm tra PDF xác nhận cả hai font được nhúng và có ToUnicode. Xem `pdf-verification.json`, thư mục `before`/`after` và các ảnh render.

Các file đã xuất và lưu trước đây giữ nguyên để bảo toàn lịch sử; sau khi deploy BE mới, cần xuất tệp mới để nhận ảnh/font đã sửa.

### Xử lý hỗ trợ

Route `/support`, menu **Xử lý hỗ trợ** chỉ dành cho Admin. Board gồm **Mới → Đang xử lý → Đã xử lý**, có đánh dấu hoàn tất trực tiếp và mở lại. Có tìm kiếm tên/email/chủ đề/nội dung, lọc mức ưu tiên, đếm và phân trang từng cột (20 yêu cầu). Drawer xem đầy đủ nội dung và liên hệ. Trên mobile chuyển cột qua thanh trạng thái.

API:
- `POST /api/v1/quoting/support-requests`: giữ luồng gửi yêu cầu hiện có cho người đã đăng nhập.
- `GET /api/v1/quoting/support-requests?status=New&page=1&pageSize=20`: Admin, phân trang/lọc tại DB.
- `PUT /api/v1/quoting/support-requests/{id}/status`: Admin, body `{ "status": "Resolved", "expectedRevision": 0 }`.

Lưu status, revision, người/thời điểm cập nhật, người/thời điểm hoàn tất. Trạng thái mở lại xóa thông tin hoàn tất hiện tại. ExpectedRevision và EF concurrency token ngăn ghi đè giữa các quản trị viên; thay đổi xung đột trả 409 và FE tải lại. Audit user lấy từ JWT đã xác thực, không lấy userId của client. Non-admin và token giả role Admin đều bị chặn.

## Triển khai

Có migration `20261108133804_AddQuotingSupportWorkflow`. Các yêu cầu đã lưu trước đó mặc định trạng thái Mới. Chạy migration qua quy trình triển khai hiện có rồi deploy BE/FE cùng thay đổi. File `support-workflow-migration.sql` là script idempotent từ migration `UseDomainAssignedQuotingIds`, giả định các migration trước đó đã áp dụng. Không chạy SQL này trên database production trong lượt làm việc.

Ảnh giao diện: `products-375.png`, `kanban-dark-1440.png`, `kanban-light-1440.png`, `kanban-light-375.png`. Toàn bộ là dữ liệu kiểm thử riêng, không phải dữ liệu khách hàng thật.

## Kiểm thử

Bằng chứng cuối cùng được tổng hợp tại `verification.json`. FE coverage tại `fe-coverage.log`, production build tại `fe-build.log`, BE tại `be-final.log`. Các test mới bao phủ Unicode NFC/NFD, ảnh HTML nhúng/mở offline, mobile đủ trường/thao tác, workflow hỗ trợ, quyền truy cập, revision và xử lý đồng thời, tìm kiếm/phân trang.

Playwright kiểm tra desktop sáng/tối 1440px và mobile 320/375/390px, bao gồm các luồng Quoting hiện có. Hai ca chỉ dành mobile được bỏ qua ở desktop. Lượt chạy ma trận đầu có hai test desktop chờ bảng trong danh sách rỗng; đã sửa điều kiện test để chờ đúng EmptyState và chạy lại. Nhật ký gốc và lượt chạy lại được giữ để phân biệt lỗi test với lỗi ứng dụng.

Chưa deploy Render/Vercel và chưa thay đổi database thật. Container Linux chưa được kiểm chứng ở lượt này; font/ảnh đều nhúng trong assembly nên không cần font cài trên máy chủ. Build FE còn cảnh báo chunk nền tảng lớn như trước.

Kết quả FE: **192 test đạt**, production build đạt; coverage V8 **84,29% dòng**, 80,82% statements, 69,54% branches, 73,45% functions. Tổng hợp E2E sau lượt kiểm tra EmptyState: **58 ca đạt trên 5 cấu hình, 2 ca mobile được bỏ qua ở desktop**, không còn ca lỗi chưa xử lý. Xem `browser-verification.json`; không che các kết quả lỗi của lần chạy cũ.

Kết quả BE: **531 test đơn vị + 7 architecture + 39 API/PostgreSQL = 577 đạt**. Publish Release đạt, chứa đủ hai font thường/đậm; EF xác nhận không có model chưa có migration. Đã dừng các dịch vụ kiểm thử local.
