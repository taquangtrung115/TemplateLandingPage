# Catalog mẫu mở rộng

Phạm vi người dùng đã chốt: toàn bộ 19 danh mục hiện có, mỗi danh mục ít nhất 15 mẫu, không đặt giới hạn tối đa. Đợt đầu thêm **20 mẫu/danh mục = 380 mẫu**, ngoài các mẫu đã có. Có thể nối thêm concept vào JSON; seed và trình tạo ảnh không giới hạn số concept.

## Nghiên cứu tham khảo

Các nguồn được dùng để tham khảo cách phân nhóm và thành phần trang, không sao chép mẫu, ảnh hay nội dung thương mại:

- [Canva — thiệp sinh nhật một tuổi](https://www.canva.com/cards/templates/1st-birthday/): chủ đề thiên nhiên, động vật, màu pastel và ảnh kỷ niệm cho Thôi Nôi.
- [Canva — lời mời sinh nhật](https://www.canva.com/invitations/templates/birthday/): tách nhóm trẻ nhỏ, tiệc gia đình và sinh nhật người lớn.
- [Paperless Post — first birthday](https://www.paperlesspost.com/cards/section/invitations?category=first-birthday-invitations): thông tin mời, địa điểm và xác nhận tham dự cần rõ ràng.
- [Wix — Events](https://www.wix.com/website/templates/html/events): lịch trình, địa điểm và thông tin tham dự.
- [Wix — Photography](https://www.wix.com/website/templates/html/photography): câu chuyện phong cách, bộ sưu tập và liên hệ.
- [Wix — Restaurants](https://www.wix.com/website/templates/html/restaurants-food/restaurant): thực đơn, không gian và đặt bàn.
- [Wix — Fitness](https://www.wix.com/business/solutions/fitness-website): lớp tập, huấn luyện viên và lịch hoạt động.
- [Webflow — SaaS](https://webflow.com/templates/tag/saas-websites): trình bày vấn đề, tính năng và cách bắt đầu sử dụng.

Tên concept, nội dung và SVG trong repo được tạo riêng. Đây là nội dung minh họa để người dùng sửa, không phải thông tin doanh nghiệp thật hoặc hình chụp sản phẩm thật.

## Cấu trúc

| Danh mục | Mẫu mới |
|---|---:|
| Thiệp Cưới | 20 |
| Lễ Đính Hôn | 20 |
| Sinh Nhật | 20 |
| Kỷ Niệm | 20 |
| Thôi Nôi | 20 |
| Hội Thảo | 20 |
| Giới Thiệu Ứng Dụng | 20 |
| Y Tế | 20 |
| SaaS | 20 |
| Nhà Hàng | 20 |
| Fitness | 20 |
| Tân Gia | 20 |
| Giáo Dục | 20 |
| Bất Động Sản | 20 |
| Nghệ Thuật & Thủ Công | 20 |
| Spa & Làm Đẹp | 20 |
| Podcast & Âm Nhạc | 20 |
| Tech Startup | 20 |
| Nhiếp Ảnh | 20 |

Nguồn dữ liệu: `BE/src/Persistence/Data/TemplateCatalog.json`; 20 bảng màu, font, motif và bố cục hero nằm trong `TemplateCatalogStyles.json`. Config khác nhau theo mục đích, thứ tự section, dịch vụ/tính năng và phần mời tham dự. Đây là các biến thể cấu hình dùng chung renderer, không phải 380 bộ component riêng.

SVG được tạo bằng `node scripts/generate-catalog-previews.mjs`, xuất tới `FE/public/catalog-previews/`. Không phụ thuộc dịch vụ ảnh ngoài; bản HTML tải về vẫn cần kết nối tới máy chủ gốc để lấy ảnh, CSS và font nếu chưa tự đóng gói.

## Seed

Migration do người vận hành tự chạy. Sau khi database đã có schema mới, chạy seed riêng như dưới đây; lệnh `--apply` không tự chạy migration.

`dotnet run --project BE/tools/CatalogSeeder` chỉ xem số lượng, không kết nối DB.

Thiết lập biến môi trường `TEMPLATE_SEED_CONNECTION_STRING` tới DB đích; chạy:

```powershell
dotnet run --project BE/tools/CatalogSeeder -- --apply
```

Tool không đọc connection string mặc định của app. Schema phải được migration trước; chỉ migration nếu truyền thêm `--migrate`. Chạy lại bỏ qua slug đã có, kể cả mẫu bị xóa mềm, giữ nguyên nội dung quản trị đã sửa. Danh mục bị xóa mềm không được khôi phục. Seed catalog không tạo tài khoản, trang công khai hoặc phản hồi giả.

Đợt kiểm thử chạy trên PostgreSQL riêng ở loopback. Không chạy seed/migration trên DB thật trong bước kiểm thử.
