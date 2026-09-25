# Triển khai lưu nháp và xuất bản theo phiên bản

## Hành vi

- Khách lưu nhiều nháp độc lập trong IndexedDB và xuất JSON/HTML.
- Lưu máy chủ cần đăng nhập; chỉ thay đổi nháp làm việc.
- Tạo phiên bản lưu nháp và snapshot trong cùng một SaveChanges/transaction. Snapshot không có API sửa.
- Xuất bản chọn một snapshot làm chính. URL cũ có số phiên bản tiếp tục trỏ đúng snapshot đã công khai.
- Gỡ bản chính làm URL chính trả 404. Gỡ cả trang đóng mọi snapshot công khai; phản hồi và nội dung vẫn giữ.
- Slug cũ được giữ vĩnh viễn trong bảng bí danh, kể cả sau xóa mềm.
- RSVP/lời chúc gắn version ID từ trang đã tải. RSVP chỉ chủ trang/Admin xem; preview không gửi phản hồi.

## Nâng cấp dữ liệu

Migration `20260925091034_VersionedPublishing` bổ sung snapshot, alias, revision, client draft ID và version ID cho phản hồi. Mọi trang cũ nhận v1, kể cả trang xóa mềm; chỉ trang từng public và chưa xóa được public. Trang vô chủ giữ link công khai nhưng chỉ Admin gán chủ được phép sửa. Phản hồi không xác định được trang giữ version ID null và không xuất hiện trong API public.

Trước khi triển khai: sao lưu DB, kiểm tra slug trùng sau trim/lowercase, chạy rehearsal trên bản sao PostgreSQL. Collision sẽ làm migration rollback, không tự phân chia URL cho hai trang. Triển khai FE/BE cùng đợt và tạm dừng ghi trong thời gian migration. Không dùng migration Down để xử lý sự cố sau khi đã tạo snapshot mới vì Down xóa bảng phiên bản; ưu tiên rollback ứng dụng tương thích hoặc khôi phục backup có kiểm soát.

EF tooling yêu cầu biến môi trường `TEMPLATE_MIGRATION_CONNECTION_STRING`, không tự chọn DB từ appsettings:

```powershell
dotnet ef database update --project BE/src/Persistence --startup-project BE/src/API
```

API yêu cầu `Jwt__SecretKey` ít nhất 32 byte từ cấu hình bí mật. Seed demo chỉ chạy khi cả `ASPNETCORE_ENVIRONMENT=Development` và `SeedData__Enabled=true`. Seed catalog dùng tool riêng được mô tả trong TEMPLATE_CATALOG_RESEARCH.md.

## Đồng bộ và xung đột

Mọi update/create-version gửi expectedRevision và requestId. Trả 409 khi revision cũ, slug đã giữ bởi trang khác, hoặc tái dùng requestId với payload khác. Retry tạo trang dùng clientDraftId; retry phiên bản dùng requestId, không tạo số mới. Response của retry trả revision tại thao tác gốc, để lần ghi kế tiếp vẫn phát hiện thay đổi đến từ tab khác.

Danh sách trang và version dùng projection/phân trang, không trả ConfigJson. Chỉ endpoint detail có quyền trả nội dung nháp. API công khai chỉ trả snapshot có IsPublic và trang chưa xóa.

## Kiểm thử an toàn

Dùng PostgreSQL riêng với database có tên dành cho integration. Không dùng connection string triển khai khi chạy test. FE/API E2E phải dùng API loopback cùng DB kiểm thử. Migration/backfill cần được thử trên dữ liệu gồm public/private/deleted/ownerless và phản hồi orphan; test dùng InMemory không chứng minh được unique constraint, concurrency hay transaction PostgreSQL.
