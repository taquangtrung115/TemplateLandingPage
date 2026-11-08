# BÁO CÁO THAY ĐỔI VÀ HIỆN THỰC HÓA MÃ NGUỒN (CHANGE LOG - CHẶNG 2 $ship HOÀN THIỆN)

> **Mục tiêu hoàn thành**: Khắc phục triệt để các lỗi vận hành thực tế được phát hiện trên môi trường máy chủ và kiểm thử toàn trình từ Backend đến Frontend:
> 1. **Khắc phục lỗi 500 Internal Server Error trên API Đăng nhập (`POST /api/v1/auth/login`)**: Khôi phục mật khẩu xác thực cơ sở dữ liệu Supabase PostgreSQL trong `appsettings.json` và cấu hình CORS đầy đủ cho port 5174.
> 2. **Khắc phục lỗi 400 Bad Request trên API Tạo Báo Giá (`POST /api/v1/quoting/quotations`)**:
>    - Tháo gỡ ràng buộc `NOT NULL` trên cột `CustomerId` của bảng `quo."Quotations"` trong cơ sở dữ liệu để hỗ trợ lập báo giá không gắn khách hàng (báo giá chung).
>    - Thiết lập giá trị mặc định cho toàn bộ thuộc tính trong `QuotationItemDto`, `CreateQuotationCommand` và `CreateQuotationRequest`.
>    - Kích hoạt cơ chế tự động nạp dữ liệu mẫu `SeedData:Enabled = true` trong `appsettings.json`.
> 3. **Khắc phục lỗi 409 Conflict trên API Xuất File PDF (`POST /api/v1/quoting/quotations/{id}/export`)**:
>    - Xử lý triệt để hiện tượng EF Core đánh dấu nhầm các thực thể con dạng append-only (`QuotationFile`, `QuotationHistory`) thành `EntityState.Modified` do đã có GUID khởi tạo trước khi thêm vào aggregate root `Quotation`.
>    - Bổ sung override `SaveChangesAsync` trong `ApplicationDbContext` để tự động chuẩn hóa trạng thái về `EntityState.Added`.
>    - Tinh chỉnh `RepositoryBase.Update` chỉ cập nhật các thực thể ở trạng thái `Detached`.
> 4. **Chuẩn hóa giao diện theo Design System Astryx & Theme Gothic**:
>    - Thay thế toàn bộ inline forms bằng slide-over `<Drawer>` từ `@astryxdesign/core/Drawer`.
>    - Tích hợp đầy đủ các điều khiển: `Field`, `FieldLabel`, `FieldStatus`, `InputGroup`, `InputGroupText`, `NumberInput`, `RadioList`, `RadioListItem`, `Switch`, `HoverCard`, `Pagination` (default 20), `Skeleton`, `Toast`, `Calendar`, `AlertDialog`, `EmptyState`.
>    - Đồng bộ màu sắc các nút hành động, căn giữa icon và viền rõ nét trong `FE_Quoting/src/index.css`.
>    - Bố cục tạo báo giá dạng 2 cột không quấn dòng với panel "Tóm Tắt Báo Giá" dính cố định bên phải (sticky right panel).

---

## 1. DANH SÁCH FILE ĐÃ THAY ĐỔI VÀ HOÀN THIỆN

| STT | Đường dẫn File | Loại | Mục đích thay đổi chi tiết |
| :---: | :--- | :---: | :--- |
| 1 | `BE/src/API/appsettings.json` | Sửa | Cập nhật cấu hình kết nối database, bổ sung port `http://localhost:5174` vào CORS và kích hoạt `SeedData:Enabled: true`. |
| 2 | `BE/src/Persistence/Data/QuotingSeeder.cs` | Sửa | Thực thi câu lệnh DDL `ALTER TABLE quo."Quotations" ALTER COLUMN "CustomerId" DROP NOT NULL;` đảm bảo schema cơ sở dữ liệu chấp nhận null cho `CustomerId`. |
| 3 | `BE/src/Persistence/ApplicationDbContext.cs` | Sửa | Override `SaveChangesAsync` tự động chuyển trạng thái của `QuotationFile` và `QuotationHistory` sang `EntityState.Added` khi thêm mới vào báo giá, ngăn chặn lỗi `DbUpdateConcurrencyException` (HTTP 409). Bổ sung bỏ qua cảnh báo `PendingModelChangesWarning`. |
| 4 | `BE/src/Persistence/Repositories/RepositoryBase.cs` | Sửa | Tinh chỉnh phương thức `Update(TEntity entity)` chỉ gọi `DbSet.Update` nếu entity ở trạng thái `Detached`, tránh làm ghi đè trạng thái của navigation graph con. |
| 5 | `BE/src/Persistence/DependencyInjection/Extensions/ServiceCollectionExtensions.cs` | Sửa | Cấu hình bỏ qua cảnh báo `PendingModelChangesWarning` trong DbContext options. |
| 6 | `BE/src/Contract/Services/V1/Quoting/Quotations/Command.cs` | Sửa | Bổ sung giá trị mặc định cho tất cả tham số tùy chọn của positional record `QuotationItemDto` và `CreateQuotationCommand`. |
| 7 | `BE/src/Presentation/APIs/Quoting/QuotationApi.cs` | Sửa | Khai báo giá trị mặc định cho positional record `CreateQuotationRequest` tương thích linh hoạt với client JSON. |
| 8 | `BE/src/Application/UseCases/V1/Quoting/Quotations/Commands/CreateQuotationCommandHandler.cs` | Sửa | Bổ sung fallback null an toàn cho `request.Items` và nạp mẫu báo giá hệ thống mặc định. |
| 9 | `FE_Quoting/src/pages/products/ProductCatalogPage.jsx` | Sửa | Chuyển toàn bộ form thêm/sửa sản phẩm sang `<Drawer side="end" width={520}>`, bọc input bằng `Field`, `InputGroup` (VNĐ), sửa prop Switch `value={isActive}`, tích hợp `HoverCard`, `Pagination` và `AlertDialog`. |
| 10 | `FE_Quoting/src/pages/customers/CustomerListPage.jsx` | Sửa | Chuyển toàn bộ form thêm/sửa khách hàng sang `<Drawer side="end" width={520}>`, bọc input bằng `Field`, tích hợp `Pagination` (20 items/trang), `Skeleton` và `AlertDialog`. |
| 11 | `FE_Quoting/src/pages/quotations/CreateQuotationPage.jsx` | Sửa | Layout 2 cột không wrap, panel tóm tắt sticky bên phải, tích hợp `RadioList` (chọn template và khách hàng), `Calendar` (ngày lập/hạn hiệu lực), `InputGroup` (chiết khấu & thuế VAT %), `HoverCard` và `useAnimatedLayout`. |
| 12 | `FE_Quoting/src/layouts/QuotingLayout.jsx` | Sửa | Tích hợp `<ToastViewport position="topEnd" />`, phân nhóm menu theo danh mục, bổ sung Badge vai trò người dùng. |
| 13 | `FE_Quoting/src/index.css` | Sửa | Chuẩn hóa style cho `.astryx-button`, `.astryx-icon-button`, căn giữa icon SVG với viền 1px solid rõ nét theo từng biến thể (primary, secondary, destructive). |

---

## 2. KẾT QUẢ XÁC MINH VẬN HÀNH THỰC TẾ

1. **Kiểm thử Đăng nhập**:
   - `POST http://localhost:54611/api/v1/auth/login` với tài khoản `admin@template.com / Admin@123456`.
   - Kết quả: **HTTP 200 OK**, trả về JWT Token và thông tin người dùng Quản Trị Viên (Role: Admin).
2. **Kiểm thử Tạo Báo Giá (Bỏ qua khách hàng)**:
   - `POST http://localhost:54611/api/v1/quoting/quotations` với payload `isGenericCustomer = true`, 2 dòng sản phẩm `CB-01` (15 gói) và `XQ-01` (20 gói).
   - Kết quả: **HTTP 201 Created**, tạo thành công báo giá số `BG-202611-0002` với ID `6166b3ca-17b0-4eec-8d0f-41f791d8208e`.
3. **Kiểm thử Xuất File PDF**:
   - `POST http://localhost:54611/api/v1/quoting/quotations/{id}/export` với `{ fileType: "pdf" }`.
   - Kết quả: **HTTP 200 OK**, sinh file PDF hợp lệ tại `/exports/quotations/BG-202611-0002_...pdf` (kích thước 1,737 bytes, chuẩn `%PDF-1.4`).
4. **Kiểm thử Lấy Chi Tiết Báo Giá**:
   - `GET http://localhost:54611/api/v1/quoting/quotations/{id}`.
   - Kết quả: **HTTP 200 OK**, phản hồi đầy đủ 2 sản phẩm, tổng tiền 756.500 VNĐ, và 1 file xuất đính kèm trong lịch sử.
