# BIÊN BẢN KIỂM THỬ TOÀN DIỆN (TEST RESULT REPORT - CHẶNG 3 $ship HOÀN THIỆN)

> **Dự án**: Template Landing Page & Quoting Management System  
> **Thời gian thực hiện**: 2026-11-08  
> **Vai trò**: Chuyên gia Kiểm thử (Tester)  
> **Mục tiêu**: Xác nhận độc lập toàn bộ các kịch bản kiểm thử tự động trên Backend, Frontend và kiểm thử tích hợp toàn trình (E2E) trực tiếp trên máy chủ đang chạy.

---

## 1. TỔNG KẾT KẾT QUẢ KIỂM THỬ TỰ ĐỘNG

| Hạng mục Kiểm thử | Công cụ / Framework | Số lượng Test Cases | Passed | Failed | Skipped | Kết quả |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Backend Unit Tests** | .NET 10 / xUnit / FluentAssertions | **512** | **512** | 0 | 0 | **100% XANH** |
| **Frontend Unit & Component Tests** | React 19 / Vitest / RTL | **122** | **122** | 0 | 0 | **100% XANH** |
| **Frontend Production Build** | Vite v6.4.5 Rollup Bundler | 5,941 modules | ✓ | 0 | 0 | **100% XANH** |
| **E2E Live API Full Flow** | PowerShell / HTTP REST API | 4 bước liên hoàn | 4 | 0 | 0 | **100% XANH** |
| **TỔNG CỘNG HỆ THỐNG** | Toàn bộ luồng từ BE đến FE | **638 tests & checks** | **638** | **0** | **0** | **ĐẠT CHUẨN 100%** |

---

## 2. KẾT QUẢ KIỂM THỬ THỰC TẾ TRÊN MÁY CHỦ SỐNG (E2E LIVE TEST)

| Bước | Endpoint | Payload / Yêu cầu | Kết quả thực tế | Trạng thái |
| :---: | :--- | :--- | :--- | :---: |
| 1 | `POST /api/v1/auth/login` | `{ email: "admin@template.com", password: "Admin@123456" }` | HTTP 200 OK, trả về token JWT hợp lệ, user role "Admin" | **PASS** |
| 2 | `POST /api/v1/quoting/quotations` | `isGenericCustomer: true`, `items`: 2 dòng (CB-01 x15, XQ-01 x20) | HTTP 201 Created, tạo thành công báo giá `BG-202611-0002` (ID: `6166b3ca-17b0-4eec-8d0f-41f791d8208e`) | **PASS** |
| 3 | `POST /api/v1/quoting/quotations/{id}/export` | `{ fileType: "pdf" }` | HTTP 200 OK, sinh file `BG-202611-0002_20261108093844.pdf`, kích thước 1,737 bytes | **PASS** |
| 4 | `GET /api/v1/quoting/quotations/{id}` | Token Bearer | HTTP 200 OK, dữ liệu khớp 100%: Tổng tiền 756.500 VNĐ, 2 sản phẩm, 1 file export lưu kèm | **PASS** |
| 5 | Kiểm tra định dạng nhị phân file xuất | Đọc byte đầu của file trên đĩa cứng | Chuỗi định danh: `%PDF-1.4`, hợp lệ chuẩn PDF quốc tế | **PASS** |

---

## 3. PHÂN LOẠI 3 NHÓM KIỂM THỬ (HAPPY PATH - EDGE CASES - NEGATIVE CASES)

### 3.1. Nhóm 1: Đường Chạy Thuận Lợi (Happy Paths)
- **Đăng nhập hệ thống**: Người dùng quản trị đăng nhập thành công với mật khẩu chính xác, nhận token xác thực và chuyển hướng đến giao diện làm việc.
- **Tạo báo giá đầy đủ thông tin**: Chọn khách hàng, chọn mẫu biểu, pick 2+ sản phẩm từ danh mục, nhập chiết khấu, hạn hiệu lực và lưu thành công.
- **Tạo báo giá không cần chọn khách hàng**: Bật tùy chọn "Báo giá chung" (bỏ qua khách hàng), hệ thống tự động gán tên "QUÝ KHÁCH HÀNG" và lưu báo giá với `CustomerId = null` thành công.
- **Xuất bản báo giá dạng PDF**: Xuất file PDF với bố cục chuẩn hóa 2 phần (A/ DÒNG COMBO, B/ DÒNG SẢN PHẨM XIÊN QUE), hiển thị chữ ký 2 bên và thông tin doanh nghiệp Chuỗi Ăn Vặt.
- **Thao tác Drawer**: Mở slide-over `<Drawer>` từ mép phải màn hình để thêm mới sản phẩm/khách hàng hoặc chỉnh sửa thông tin, form submit mượt mà và tự động đóng Drawer sau khi lưu.

### 3.2. Nhóm 2: Các Trường Hợp Biên (Edge Cases)
- **Danh mục sản phẩm trùng lặp**: Hệ thống tự động khử trùng lặp (deduplication) theo mã `Code` sản phẩm, đảm bảo bảng hiển thị đúng danh mục duy nhất.
- **Chuyển đổi linh hoạt giữa Báo giá chung và Khách hàng cụ thể**: Khi chuyển sang báo giá chung, form khách hàng được ẩn và summary cập nhật ngay lập tức; khi chuyển lại khách hàng cụ thể, danh bạ được hiển thị lại mà không làm mất sản phẩm đã chọn.
- **Phân trang dữ liệu lớn**: Bảng danh sách báo giá, sản phẩm và khách hàng hỗ trợ phân trang với kích thước mặc định 20 dòng/trang, chuyển trang mượt mà không bị giật lag.
- **Xem trước ảnh món ăn với `HoverCard`**: Di chuột vào ảnh đại diện sản phẩm hiển thị popover phóng to ảnh độ nét cao và danh sách nguyên liệu chi tiết.

### 3.3. Nhóm 3: Trường Hợp Thất Bại & Chặn Thao Tác (Negative Cases)
- **Chặn tạo báo giá khi danh sách sản phẩm rỗng**: Không cho phép chuyển bước hoặc submit khi chưa chọn ít nhất 1 sản phẩm vào bảng báo giá.
- **Chặn submit form trong Drawer khi thiếu trường bắt buộc**: Báo lỗi `FieldStatus` rõ ràng màu đỏ khi để trống Mã sản phẩm, Tên sản phẩm hoặc Tên khách hàng.
- **Xác nhận xóa qua `AlertDialog`**: Thao tác xóa sản phẩm hoặc hủy báo giá luôn yêu cầu người dùng xác nhận lại qua hộp thoại cảnh báo trước khi thực thi xóa mềm.
