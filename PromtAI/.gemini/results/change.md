# BÁO CÁO THAY ĐỔI MÃ NGUỒN (CHANGE SUMMARY)

**Giai đoạn:** Chặng 2 — Triển khai mã nguồn (Coder)  
**Nhiệm vụ:** Đa dạng hóa kho mẫu Template và cơ chế Seed Data thông minh (Idempotent)  
**Thời gian thực hiện:** 2026-09-21  

---

## 1. DANH SÁCH FILE THAY ĐỔI / TẠO MỚI / XOÁ

| STT | Trạng thái | Đường dẫn file | Mục đích chính |
|---|---|---|---|
| 1 | **Sửa (Modified)** | `BE/src/Persistence/Data/DataSeeder.cs` | Bổ sung 6 categories mới; nâng cấp thuật toán seed Category và Template theo `Slug` (Idempotent); bổ sung 8 JSON config chi tiết cho 8 templates mới. |
| 2 | **Sửa (Modified)** | `BE/test/UnitTests/Persistence/DataSeederTests.cs` | Nâng cấp kiểm thử số lượng Categories (15) và Templates (19); bổ sung assertions kiểm tra cấu trúc JSON và trường đặc thù của 8 template mới; bổ sung test case xác thực cơ chế nâng cấp tự động khi database đã có sẵn dữ liệu cũ (9 categories + 11 templates). |
| 3 | **Sửa (Modified)** | `FE/src/utils/defaultTemplates.js` | Mở rộng hàm `getDefaultConfigByCategory` để fallback an toàn cho 6 danh mục mới (`education`, `real-estate`, `restaurant`, `fitness`, `housewarming`, `art-craft`). |

---

## 2. CHI TIẾT MỖI CHỖ SỬA & GIẢI TRÌNH KỸ THUẬT

### 2.1. `BE/src/Persistence/Data/DataSeeder.cs`
- **Mục 2 - Bổ sung 6 Categories mới và cơ chế Idempotent:**
  - Thay vì dùng `if (!await context.Categories.AnyAsync())` (gây bỏ qua khi DB đã có dữ liệu), chuyển sang:
    - Truy vấn danh sách `existingCategories` từ DB và tạo từ điển `categoryDict` theo `Slug`.
    - Định nghĩa đủ 15 Categories chuẩn hóa (9 cũ + 6 mới: `restaurant`, `fitness`, `housewarming`, `education`, `real-estate`, `art-craft`).
    - Chỉ thêm mới những Categories chưa tồn tại trong DB theo `Slug`.
- **Thêm 8 JSON Config chi tiết cho 8 Templates mới:**
  - `lauraBistroConfigJson`: Template nhà hàng Fine Dining (`laura-bistro-gourmet`), menu 4 món signature, quy trình 4 chặng thưởng vị, đặt bàn VIP reserve, tone Terracotta & Charcoal.
  - `apexFitnessConfigJson`: Template CLB thể hình công nghệ cao (`apex-titanium-fitness`), 4 thẻ tính năng AI Bio-Scan / Technogym, 4 chỉ số metrics, 3 gói hội viên Silver/Titanium/VIP Black.
  - `warmNestConfigJson`: Template tiệc mừng nhà mới (`warm-nest-housewarming`), câu chuyện gia chủ Tuấn & Mai, mâm tiệc BBQ, box mừng tân gia VietQR, hiệu ứng pháo giấy confetti.
  - `azureBreezeWeddingConfigJson`: Template cưới bãi biển Phú Quốc (`azure-breeze-beach-wedding`), tone xanh biển, hiệu ứng cánh hoa bay petals, timeline lễ trao thề ước hoàng hôn.
  - `genAiMasterclassConfigJson`: Template khóa huấn luyện AI chuyên sâu (`genai-prompt-masterclass`), 2 diễn giả chuyên gia, 2 hạng vé Standard Pass & Pro Mentorship, FAQ giải đáp học viên.
  - `horizonVillasConfigJson`: Template bất động sản nghỉ dưỡng siêu sang (`horizon-luxury-villas`), 4 đặc quyền kiến trúc ven biển, 4 chỉ số độc bản, đăng ký tham quan bảo mật.
  - `academicGloryConfigJson`: Template lễ tốt nghiệp cử nhân Bách Khoa (`academic-glory-graduation`), timeline bế giảng, album kỷ yếu, sổ lưu bút chúc mừng tân cử nhân Minh Triết.
  - `terraSoulArtConfigJson`: Template triển lãm mỹ thuật gốm Wabi-sabi (`terra-soul-art-exhibition`), giới thiệu 60 tác phẩm men tro củi nung Anagama, workshop chuốt gốm, sổ ký tên cảm xúc.
- **Mục 4 - Cơ chế Seed 19 Templates Idempotent theo Slug:**
  - Thay vì `if (!await context.Templates.AnyAsync())`, chuyển sang kiểm tra từng template theo `Slug`:
    - Truy vấn `existingTemplates` từ DB và tạo từ điển `templateDict` theo `Slug`.
    - Định nghĩa danh sách 19 Templates chuẩn hóa (11 cũ + 8 mới).
    - Với mỗi template chưa có trong DB, liên kết chính xác `CategoryId` từ `categoryDict[def.CategorySlug]` và thêm vào DB.
    - Đảm bảo các biến dùng cho `UserCustomizations` (`t1, t2, t5, t6, tAiSummit, tDriftPlanner`) luôn được ánh xạ chuẩn xác.

### 2.2. `BE/test/UnitTests/Persistence/DataSeederTests.cs`
- **Cập nhật các bài test hiện có:**
  - `SeedAsync_Should_PopulateAll8Tables_WhenDatabaseIsEmpty`: Xác nhận Categories có đúng 15 bản ghi với đủ 15 slugs; Templates có đúng 19 bản ghi với đủ 19 slugs.
  - `SeedAsync_Should_BeIdempotent_WhenExecutedMultipleTimes`: Đảm bảo chạy Seeder 2 lần liên tiếp số lượng vẫn giữ nguyên 15 Categories và 19 Templates, không ném exception, không sinh bản ghi trùng.
  - `SeedAsync_Should_GenerateValidJson_ForTemplatesAndCustomizations`: Xác nhận toàn bộ 19 Templates đều parse JSON hợp lệ qua `JsonDocument.Parse()`.
  - `SeedAsync_Should_ContainSpecificProperties_ForDiverseTemplates`: Bổ sung kiểm tra cấu trúc chuyên sâu cho cả 8 template mới (`format`, `servicesGrid`, `treatmentProcess`, `pricingPackages`, `metrics`, `speakers`, `pricingTickets`, `extraSections`...).
- **Bổ sung bài test kịch bản nâng cấp DB cũ:**
  - `SeedAsync_Should_SupplementNewCategoriesAndTemplates_WhenLegacy9CategoriesAnd11TemplatesAlreadyExist`: Giả lập môi trường database hiện tại (đã có 9 categories cũ và 11 templates cũ), sau khi chạy Seeder, hệ thống tự động nạp thêm đúng 6 categories và 8 templates mới, gán đúng `CategoryId`, đồng thời đảm bảo chạy lần kế tiếp vẫn hoàn toàn idempotent.

### 2.3. `FE/src/utils/defaultTemplates.js`
- Mở rộng hàm `getDefaultConfigByCategory` để khi Frontend nhận diện các category mới (`education`, `real-estate`, `restaurant`, `fitness`, `housewarming`, `art-craft`) đều có fallback config tương thích và ổn định, tránh crash render.

---

## 3. VỊ TRÍ TRỌNG YẾU MÀ TESTER NÊN SOI KỸ

1. **Tính Idempotent của Seeder trên Database đã có dữ liệu (`DataSeeder.cs` dòng 72-96 & 676-711):**
   - Kiểm tra kỹ việc chạy lại hàm seed khi database không rỗng: các bản ghi cũ không bị ghi đè hay thay đổi ID, các bản ghi mới được nạp đầy đủ.
2. **Khóa ngoại `CategoryId` của 8 Templates mới:**
   - Đảm bảo 8 template mới được gán đúng `CategoryId` của category tương ứng (`restaurant`, `fitness`, `housewarming`, `wedding`, `education`, `real-estate`, `art-craft`).
3. **Tính toàn vẹn của JSON Config của từng Template:**
   - Đảm bảo không có trường nào trả về `null` gây lỗi render ở Frontend khi duyệt mảng (`servicesGrid`, `treatmentProcess`, `featureCardsGrid`, `speakers`, `pricingPackages`, `pricingTickets`, `timeline`, `gallery`, `extraSections`).
4. **Kết quả Unit Tests:**
   - 356 Unit Tests và 7 Architecture Tests đều chạy sạch sẽ với kết quả Passed 100% (0 error, 0 failure).
