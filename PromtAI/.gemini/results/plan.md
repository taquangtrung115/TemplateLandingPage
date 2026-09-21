# KẾ HOẠCH TRIỂN KHAI: ĐA DẠNG HÓA KHO TEMPLATE & CƠ CHẾ SEED DATA THÔNG MINH

## 1. CÂU HỎI CÒN BỎ NGỎ
Không có. Yêu cầu kỹ thuật và nghiệp vụ đã rõ ràng:
- Nghiên cứu và thiết kế 8 mẫu template hoàn toàn mới, đa dạng chủ đề và phong cách, không trùng lặp giao diện.
- Bổ sung 6 Categories mới phù hợp chủ đề.
- Nâng cấp cơ chế seed trong `DataSeeder.cs` theo hướng kiểm tra `Slug` thông minh (idempotent), giúp ứng dụng khi khởi động tự động nạp template mới vào database hiện có mà không cần drop database.
- Cập nhật toàn diện bộ unit test trong `DataSeederTests.cs`.

---

## 2. NHỮNG FILE CẦN TẠO MỚI HOẶC CẦN SỬA

| STT | Hành động | Đường dẫn file chính xác | Mục đích |
|---|---|---|---|
| 1 | **Sửa** | `c:\Source\TemplateLandingPage\BE\src\Persistence\Data\DataSeeder.cs` | Bổ sung 6 categories mới; nâng cấp thuật toán seed Category & Template theo `Slug`; bổ sung 8 JSON config chi tiết cho 8 templates mới. |
| 2 | **Sửa** | `c:\Source\TemplateLandingPage\BE\test\UnitTests\Persistence\DataSeederTests.cs` | Cập nhật số lượng categories (15), templates (19), danh sách slugs, kiểm tra tính hợp lệ JSON và các trường đặc thù của template mới. |
| 3 | **Sửa (Tùy chọn)** | `c:\Source\TemplateLandingPage\FE\src\utils\defaultTemplates.js` | Bổ sung mapping fallback cho các category mới (`restaurant`, `fitness`, `housewarming`, `education`, `real-estate`, `art-craft`). |

---

## 3. CHỮ KÝ HÀM, INTERFACE VÀ DANH SÁCH TEMPLATE MỚI KÈM CONFIG

### 3.1. Phương thức trong `DataSeeder.cs`
```csharp
namespace TemplateLandingPage.Persistence.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, IPasswordHasher passwordHasher);
}
```

### 3.2. Danh mục mới (6 Categories bổ sung)
| Name | Slug | Icon | OrderIndex | Description |
|---|---|---|---|---|
| Ẩm Thực & Nhà Hàng | `restaurant` | `Utensils` | 10 | Khai trương nhà hàng ẩm thực, tiệc thưởng vị Fine Dining và đặt bàn trực tuyến. |
| Thể Thao & Fitness | `fitness` | `Dumbbell` | 11 | Câu lạc bộ thể hình cao cấp, huấn luyện viên cá nhân và gói tập chuyển hóa cơ thể. |
| Tiệc Tân Gia | `housewarming` | `Home` | 12 | Tiệc mừng nhà mới ấm cúng, sơ đồ chỉ đường và hộp quà mừng tân gia. |
| Giáo Dục & Khóa Học | `education` | `GraduationCap` | 13 | Khóa học chuyên sâu, workshop công nghệ và hội thảo trực tuyến. |
| Bất Động Sản & Nghỉ Dưỡng | `real-estate` | `Building` | 14 | Biệt thự nghỉ dưỡng cao cấp, căn hộ độc bản và đặt lịch trải nghiệm riêng tư. |
| Nghệ Thuật & Triển Lãm | `art-craft` | `Palette` | 15 | Triển lãm mỹ thuật đương đại, gốm thủ công độc bản và đêm tiệc Vernissage. |

### 3.3. Danh sách 8 Mẫu Template Mới

#### Template 1: L'Aura Fine Dining & Bistro
- **Tên**: `L'Aura Fine Dining & Bistro`
- **Slug**: `laura-bistro-gourmet`
- **Category Slug / Tên**: `restaurant` / `Restaurant`
- **Badge**: `Hot`
- **Audio**: `https://cdn.pixabay.com/download/audio/2022/05/16/audio_c16e78cfbc.mp3` | **Music Title**: `French Cafe Jazz & Smooth Acoustic`
- **Thumbnail / LongPreview**: `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80`
- **Phong cách**: Sang trọng, tone màu ấm đen than & cam cháy (Terracotta & Dark Slate), font `Playfair Display`.
- **Đặc thù Config JSON**:
  - `format`: `"restaurant"`
  - `theme`: `primaryColor`: `"#c2410c"`, `secondaryColor`: `"#ea580c"`, `accentColor`: `"#fef08a"`, `backgroundColor`: `"#0c0a09"`, `textColor`: `"#f8fafc"`, `particlesEffect`: `"none"`, `fontFamily`: `"Playfair Display"`
  - `hero`: `badge`: `"GRAND OPENING & EXCLUSIVE TASTING"`, `title`: `"L'Aura Gourmet Bistro"`, `subtitle`: `"Bản hòa tấu ẩm thực tinh hoa Pháp giữa lòng Sài Gòn"`, `eventDate`: `"2026-11-28T18:30:00"`, `coverImageUrl`: `"https://images.unsplash.com/photo-1544025162-d76694265947?w=1600&q=80"`, `callToActionText`: `"Đặt Bàn Trải Nghiệm"`
  - `servicesGrid`: 4 món Signature (`Truffle Wagyu A5 Tartare`, `Pan-Seared Foie Gras`, `Wild French Turbot`, `Dark Chocolate Lava Sphere`) kèm `priceFrom`.
  - `treatmentProcess`: 4 chặng thưởng vị (`01. Khai vị Amuse-Bouche`, `02. Rượu vang Sommelier Pairing`, `03. Món chính Chef's Special`, `04. Tráng miệng & Digestif`).
  - `booking`: `enabled`: `true`, `title`: `"Đặt Bàn Dạ Tiệc Khai Trương (VIP Reserve)"`
  - `eventDetails`: `ceremonyName`: `"Đêm Tiệc Thưởng Vị Khai Trương"`, `time`: `"18:30 - Thứ Bảy, 28/11/2026"`, `venueName`: `"L'Aura Bistro Mansion"`, `address`: `"18 Phùng Khắc Khoan, Đa Kao, Quận 1, TP. Hồ Chí Minh"`, `dressCode`: `"Cocktail Attire / Smart Elegance"`
  - `timeline`: Đón khách & Champagne (18:30), Triết lý bếp trưởng (19:15), Dạ tiệc 5 món (19:45), Live Jazz (21:30).
  - `gallery`: 4 ảnh ẩm thực & không gian nhà hàng cao cấp.
  - `rsvp`: `enabled`: `true`, `deadline`: `"2026-11-20"`, `note`: `"Số lượng bàn trải nghiệm giới hạn 40 khách VIP."`

#### Template 2: Apex Titanium Fitness Club
- **Tên**: `Apex Titanium Fitness Club`
- **Slug**: `apex-titanium-fitness`
- **Category Slug / Tên**: `fitness` / `Fitness`
- **Badge**: `Premium`
- **Thumbnail / LongPreview**: `https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80`
- **Phong cách**: Thể thao công nghệ cao, màu vàng điện neon (`#eab308`) trên nền đen tối giản (`#09090b`), font `Inter`.
- **Đặc thù Config JSON**:
  - `format`: `"fitness"`
  - `theme`: `primaryColor`: `"#eab308"`, `secondaryColor`: `"#ca8a04"`, `accentColor`: `"#fef08a"`, `backgroundColor`: `"#09090b"`, `textColor`: `"#fafafa"`, `particlesEffect`: `"none"`, `fontFamily`: `"Inter"`
  - `hero`: `badge`: `"THE ULTIMATE BODY TRANSFORMATION"`, `title`: `"Apex Titanium Club"`, `subtitle`: `"Phòng tập thể hình hybrid chuẩn 5 sao với thiết bị Technogym & phân tích sinh trắc học InBody 970."`, `eventDate`: `"2026-12-01T06:00:00"`, `coverImageUrl`: `"https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80"`, `callToActionText`: `"Đăng Ký Tập Thử Miễn Phí"`
  - `featureCardsGrid`: 4 thẻ tính năng (`Công Nghệ AI Bio-Scan`, `Thiết Bị Technogym Pure`, `HLV Đạt Chuẩn NASM/IFBB`, `Phục Hồi Cryotherapy & Sauna`).
  - `metrics`: 4 chỉ số uy tín (`2,500+ Hội viên`, `98.7% Duy trì tập luyện`, `15+ Master Trainer`, `24/7 Mở cửa liên tục`).
  - `pricingPackages`: 3 gói hội viên (`Silver Access - $49/tháng`, `Titanium Pro - $129/tháng [POPULAR]`, `VIP Elite Black - $299/tháng`).
  - `eventDetails`: `ceremonyName`: `"Tuần Lễ Khai Trương Apex Titanium Flagship"`, `time`: `"06:00 - 22:00, Từ 01/12/2026"`, `venueName`: `"Apex Titanium Tower"`, `address`: `"88 Song Hành, Phường An Phú, TP. Thủ Đức, TP. Hồ Chí Minh"`
  - `rsvp`: `enabled`: `true`, `deadline`: `"2026-12-05"`.

#### Template 3: Warm Nest Modern Villa (Tiệc Tân Gia)
- **Tên**: `Warm Nest Modern Villa`
- **Slug**: `warm-nest-housewarming`
- **Category Slug / Tên**: `housewarming` / `Housewarming`
- **Badge**: `Hot`
- **Audio**: `https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3` | **Music Title**: `Home Sweet Home - Acoustic Guitar Melody`
- **Thumbnail / LongPreview**: `https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80`
- **Phong cách**: Ấm áp, màu xanh ngọc bích hiền hòa (`#059669`) trên nền trắng kem (`#f0fdf4`), hiệu ứng `confetti`, font `Playfair Display`.
- **Đặc thù Config JSON**:
  - `theme`: `primaryColor`: `"#059669"`, `secondaryColor`: `"#10b981"`, `accentColor`: `"#fef08a"`, `backgroundColor`: `"#f0fdf4"`, `textColor`: `"#1e293b"`, `particlesEffect`: `"confetti"`, `fontFamily`: `"Playfair Display"`
  - `hero`: `badge`: `"LỄ MỪNG NHÀ MỚI (TÂN GIA)"`, `title`: `"Gia Đình Tuấn & Mai"`, `subtitle`: `"Tổ ấm mới ngập tràn yêu thương và bình yên đã sẵn sàng chào đón bạn"`, `eventDate`: `"2026-11-08T11:00:00"`, `coverImageUrl`: `"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80"`, `callToActionText`: `"Xác Nhận Đến Chung Vui"`
  - `coupleOrCelebrant`: `type`: `"event"`, `person1`: Gia chủ Đức Tuấn & Quỳnh Mai, câu châm ngôn `"Nhà không chỉ là nơi để ở, nhà là nơi bão dừng sau cánh cửa."`
  - `eventDetails`: `ceremonyName`: `"Tiệc Tân Gia Mừng An Cư Lạc Nghiệp"`, `time`: `"11:00 - Chủ Nhật, 08/11/2026"`, `venueName`: `"Biệt Thự Vườn The Green Haven"`, `address`: `"Lô B12 Khu Đô Thị Vạn Phúc, Quốc Lộ 13, Hiệp Bình Phước, TP. Thủ Đức"`, `dressCode`: `"Xanh Lá / Trắng / Be Ấm Áp"`
  - `timeline`: Đón khách & Tham quan (10:30), Khui champagne mừng nhà mới (11:30), Tiệc BBQ sân vườn (12:00), Hàn huyên & Boardgame (13:30).
  - `gallery`: 4 ảnh không gian kiến trúc nội thất căn nhà.
  - `extraSections`: Box mừng tân gia VietQR (`MBBank`, STK: `9876543210`, Tên: `NGUYEN DUC TUAN`).
  - `wishes`: Sổ lưu bút chúc mừng tân gia gia đạo bình an, tài lộc.
  - `rsvp`: `enabled`: `true`, `deadline`: `"2026-11-01"`.

#### Template 4: Azure Breeze Tropical Beach Wedding
- **Tên**: `Azure Breeze Tropical Wedding`
- **Slug**: `azure-breeze-beach-wedding`
- **Category Slug / Tên**: `wedding` / `Wedding`
- **Badge**: `Premium`
- **Audio**: `https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3` | **Music Title**: `Ocean Waves & Acoustic Ukulele Romance`
- **Thumbnail / LongPreview**: `https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&q=80`
- **Phong cách**: Biển xanh nhiệt đới phóng khoáng, xanh đại dương (`#0284c7`), vàng nắng (`#fef08a`), hiệu ứng cánh hoa (`petals`).
- **Đặc thù Config JSON**:
  - `theme`: `primaryColor`: `"#0284c7"`, `secondaryColor`: `"#0ea5e9"`, `accentColor`: `"#fef08a"`, `backgroundColor`: `"#f0fdfa"`, `textColor`: `"#0f172a"`, `particlesEffect`: `"petals"`, `fontFamily`: `"Playfair Display"`
  - `hero`: `badge`: `"DESTINATION BEACH WEDDING"`, `title`: `"Khánh & Vy"`, `subtitle`: `"Cùng nhau trao lời thề ước dưới ánh hoàng hôn biển Phú Quốc"`, `eventDate`: `"2026-12-18T16:30:00"`, `coverImageUrl`: `"https://images.unsplash.com/photo-1510076857177-7470076d4098?w=1600&q=80"`
  - `coupleOrCelebrant`: `person1`: Trần Nam Khánh (Kiến trúc sư), `person2`: Hoàng Thảo Vy (Nhiếp ảnh gia thiên nhiên).
  - `eventDetails`: `ceremonyName`: `"Lễ Thành Hôn Hoàng Hôn Trên Biển"`, `time`: `"16:30 - Thứ Sáu, 18/12/2026"`, `venueName`: `"InterContinental Phu Quoc Long Beach Resort"`, `address`: `"Bãi Trường, Dương Tơ, TP. Phú Quốc, Kiên Giang"`, `dressCode`: `"Linen Trắng / Xanh Dương / Be Nhiệt Đới"`
  - `timeline`: Đón khách & Nước dừa tươi (16:00), Thề ước dưới vòm hoa biển (16:45), Chụp ảnh đón hoàng hôn (17:45), Dạ tiệc hải sản & Lửa trại (18:30).
  - `gallery`: 4 ảnh đám cưới bãi biển hoàng hôn.
  - `extraSections`: FAQ hỏi đáp về cách di chuyển máy bay, thời tiết biển tháng 12, khu vui chơi trẻ em.
  - `rsvp` & `wishes`: Đầy đủ tính năng.

#### Template 5: GenAI & Prompt Masterclass
- **Tên**: `Prompt Engineering & GenAI Masterclass`
- **Slug**: `genai-prompt-masterclass`
- **Category Slug / Tên**: `education` / `Education`
- **Badge**: `New`
- **Thumbnail / LongPreview**: `https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80`
- **Phong cách**: Công nghệ tương lai, tím Cyberpunk AI (`#7c3aed`) trên nền vũ trụ sâu thẳm (`#0f0728`), font `Inter`.
- **Đặc thù Config JSON**:
  - `format`: `"summit"`
  - `theme`: `primaryColor`: `"#7c3aed"`, `secondaryColor`: `"#8b5cf6"`, `accentColor`: `"#c4b5fd"`, `backgroundColor`: `"#0f0728"`, `textColor`: `"#f8fafc"`, `particlesEffect`: `"none"`, `fontFamily`: `"Inter"`
  - `hero`: `badge`: `"INTENSIVE 4-WEEK COHORT"`, `title`: `"Mastering Prompt Engineering & Autonomous AI Agents"`, `subtitle`: `"Khóa huấn luyện thực chiến xây dựng hệ thống Multi-Agent và tự động hóa quy trình với LLMs."`, `eventDate`: `"2026-11-10T19:30:00"`, `coverImageUrl`: `"https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1600&q=80"`, `callToActionText`: `"Giữ Chỗ Lớp Khai Giảng"`
  - `speakers`: 2 chuyên gia (`ThS. Đặng Hoàng Nam` - Head of AI Research @ NexusMind; `Dr. Sarah Nguyễn` - Lead Prompt Architect @ OpenSynth).
  - `pricingTickets`: 2 hạng vé (`Học Viên Tiêu Chuẩn - 2.890.000 đ [EARLY BIRD]`, `Gói Pro Mentorship 1-1 - 5.990.000 đ [POPULAR]`).
  - `eventDetails`: `ceremonyName`: `"Lịch Khai Giảng Khóa Học Cohort 8"`, `time`: `"19:30 - 21:30, Thứ Ba & Thứ Năm hàng tuần"`, `venueName`: `"Live Zoom HD & Discord Community"`
  - `extraSections`: FAQ giải đáp học viên (chưa biết lập trình, học lại video, xuất hóa đơn VAT).
  - `rsvp`: `enabled`: `true`, `deadline`: `"2026-11-08"`.

#### Template 6: The Horizon Ocean Sanctuary (Bất Động Sản Nghỉ Dưỡng)
- **Tên**: `The Horizon Grand Luxury Villa`
- **Slug**: `horizon-luxury-villas`
- **Category Slug / Tên**: `real-estate` / `RealEstate`
- **Badge**: `Premium`
- **Audio**: `https://cdn.pixabay.com/download/audio/2022/11/06/audio_03d659ad76.mp3` | **Music Title**: `Elegance Ambience - Soft Classical Piano`
- **Thumbnail / LongPreview**: `https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80`
- **Phong cách**: Thượng lưu trầm ấm, vàng đồng Bronze (`#d97706`) trên nền đá than Charcoal (`#0c0a09`), font `Playfair Display`.
- **Đặc thù Config JSON**:
  - `format`: `"app-showcase"`
  - `theme`: `primaryColor`: `"#d97706"`, `secondaryColor`: `"#b45309"`, `accentColor`: `"#fef08a"`, `backgroundColor`: `"#0c0a09"`, `textColor`: `"#f8fafc"`, `particlesEffect`: `"none"`, `fontFamily`: `"Playfair Display"`
  - `hero`: `badge`: `"LIMITED EDITION VILLA COLLECTION"`, `title`: `"The Horizon Ocean Sanctuary"`, `subtitle`: `"Bộ sưu tập 18 căn biệt thự độc bản trên vách đá ngắm trọn vịnh biển thiên đường"`, `eventDate`: `"2026-12-12T09:00:00"`, `coverImageUrl`: `"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80"`, `callToActionText`: `"Đăng Ký Tham Quan Riêng Tư"`
  - `featureCardsGrid`: 4 đặc quyền kiến trúc (`Tầm Nhìn Biển Panorama 360°`, `Bến Du Thuyền & Sân Đỗ Trực Thăng`, `Hồ Bơi Vô Cực Nước Mặn Điện Phân`, `Quản Gia Riêng Les Clefs d'Or`).
  - `metrics`: `18 Căn biệt thự độc bản`, `1,200 m² Khuôn viên`, `100% Trực diện biển`, `Sở Hữu Lâu Dài`.
  - `eventDetails`: `ceremonyName`: `"Sự Kiện Ra Mắt Giới Hạn The Horizon Private Showcase"`, `time`: `"09:00 - Thứ Bảy, 12/12/2026"`, `venueName`: `"The Horizon VIP Lounge & Marina Club"`, `address`: `"Bán đảo Sơn Trà, Bãi Bụt, TP. Đà Nẵng"`, `dressCode`: `"Elegance Resort / All White"`
  - `gallery`: 4 ảnh kiến trúc biệt thự, hồ bơi vô cực hoàng hôn.
  - `rsvp`: `enabled`: `true`, `deadline`: `"2026-12-05"`.

#### Template 7: Academic Glory Graduation (Lễ Tốt Nghiệp)
- **Tên**: `Academic Glory Graduation`
- **Slug**: `academic-glory-graduation`
- **Category Slug / Tên**: `education` / `Education`
- **Badge**: `New`
- **Audio**: `https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77c30.mp3` | **Music Title**: `Celebration of Youth - Uplifting Acoustic`
- **Thumbnail / LongPreview**: `https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80`
- **Phong cách**: Tươi sáng học thuật, xanh Royal Blue (`#1d4ed8`) & vàng cờ cử nhân (`#facc15`), hiệu ứng pháo hoa giấy `confetti`.
- **Đặc thù Config JSON**:
  - `theme`: `primaryColor`: `"#1d4ed8"`, `secondaryColor`: `"#2563eb"`, `accentColor`: `"#facc15"`, `backgroundColor`: `"#eff6ff"`, `textColor`: `"#1e293b"`, `particlesEffect`: `"confetti"`, `fontFamily`: `"Playfair Display"`
  - `hero`: `badge`: `"COMMENCEMENT CEREMONY 2026"`, `title`: `"Lễ Tốt Nghiệp — Hoàng Minh Triết"`, `subtitle`: `"Đánh dấu cột mốc Cử nhân Xuất sắc ngành Kỹ nghệ Phần mềm"`, `eventDate`: `"2026-11-22T08:30:00"`, `coverImageUrl`: `"https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&q=80"`, `callToActionText`: `"Đến Tham Dự & Chụp Ảnh Cùng Triết"`
  - `coupleOrCelebrant`: `type`: `"birthday"`, `person1`: Hoàng Minh Triết (Tân Thủ Khoa Cử Nhân), châm ngôn `"Học vấn là hạt giống của ngày hôm nay, thành quả là tương lai của ngày mai."`
  - `eventDetails`: `ceremonyName`: `"Lễ Bế Giảng & Trao Bằng Cử Nhân Đợt 2 - Năm 2026"`, `time`: `"08:30 - Chủ Nhật, 22/11/2026"`, `venueName`: `"Hội Trường Lớn A5 - Trường Đại Học Bách Khoa"`, `address`: `"268 Lý Thường Kiệt, Phường 14, Quận 10, TP. Hồ Chí Minh"`, `dressCode`: `"Lịch sự / Sơ mi trắng / Áo cử nhân"`
  - `timeline`: Đón tiếp người thân & Tặng hoa (07:30), Khai mạc lễ trao bằng (08:30), Xướng tên & Trao bằng vinh danh (09:30), Chụp ảnh kỷ yếu sân trường (11:00).
  - `gallery`: 4 ảnh lưu bút cử nhân, mũ áo tốt nghiệp.
  - `wishes`: Sổ lưu bút gửi lời chúc tương lai rạng rỡ cho tân cử nhân.
  - `rsvp`: `enabled`: `true`, `deadline`: `"2026-11-18"`.

#### Template 8: Terra & Soul Ceramic Exhibition (Nghệ Thuật & Gốm)
- **Tên**: `Terra & Soul Ceramic Exhibition`
- **Slug**: `terra-soul-art-exhibition`
- **Category Slug / Tên**: `art-craft` / `ArtCraft`
- **Badge**: `Premium`
- **Audio**: `https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3` | **Music Title**: `Zen Pottery & Meditative Flute`
- **Thumbnail / LongPreview**: `https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80`
- **Phong cách**: Wabi-sabi mộc mạc tinh tế, tone nâu đất nung Terracotta (`#92400e`) trên nền vải đay Linen (`#fefce8`), font `Playfair Display`.
- **Đặc thù Config JSON**:
  - `theme`: `primaryColor`: `"#92400e"`, `secondaryColor`: `"#b45309"`, `accentColor`: `"#fef08a"`, `backgroundColor`: `"#fefce8"`, `textColor`: `"#292524"`, `particlesEffect`: `"none"`, `fontFamily`: `"Playfair Display"`
  - `hero`: `badge`: `"CONTEMPORARY CERAMIC EXHIBITION"`, `title`: `"Terra & Soul — Vết Đất & Hồn Gốm"`, `subtitle`: `"Hành trình đối thoại giữa đất sét thô mộc, lửa đỏ và tâm thức nghệ nhân Wabi-sabi"`, `eventDate`: `"2026-11-14T15:00:00"`, `coverImageUrl`: `"https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1600&q=80"`, `callToActionText`: `"Đăng Ký Tham Dự Khai Mạc"`
  - `coupleOrCelebrant`: `type`: `"event"`, `person1`: Nghệ nhân An Nhiên & Điêu khắc gia Minh Long (Giám tuyển), câu châm ngôn `"Đất và lửa không chỉ tạo nên hình hài, mà lưu giữ hơi thở của thời gian."`
  - `eventDetails`: `ceremonyName`: `"Đêm Khai Mạc Vernissage Triển Lãm Terra & Soul"`, `time`: `"15:00 - Thứ Bảy, 14/11/2026"`, `venueName`: `"The Factory Contemporary Arts Space"`, `address`: `"15 Nguyễn Ư Dĩ, Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh"`, `dressCode`: `"Linen Mộc / Nâu Đất / Trắng Tự Nhiên"`
  - `timeline`: Đón khách & Trà đạo (15:00), Chia sẻ kỹ thuật men tro cổ truyền (15:45), Tour giám tuyển 60 tác phẩm độc bản (16:30), Workshop tự tay chuốt gốm (17:30).
  - `gallery`: 4 tác phẩm bình gốm, chén trà mộc tinh xảo.
  - `extraSections`: FAQ về việc mua tác phẩm trưng bày, thời gian triển lãm kéo dài, workshop cuối tuần.
  - `wishes`: Sổ ký tên tri ân cảm xúc của khách tham quan.
  - `rsvp`: `enabled`: `true`, `deadline`: `"2026-11-10"`.

---

## 4. THIẾT KẾ CƠ CHẾ SEED DỮ LIỆU THÔNG MINH (IDEMPOTENT)

### 4.1. Vấn đề của code hiện tại
Trước đây, `DataSeeder.cs` dùng điều kiện:
```csharp
if (!await context.Categories.AnyAsync()) { ... }
if (!await context.Templates.AnyAsync()) { ... }
```
Hậu quả:
- Nếu database đã tồn tại dữ liệu từ các phiên chạy trước, việc bổ sung Categories hay Templates mới trong code sẽ bị bỏ qua hoàn toàn vì bảng không rỗng.
- Người dùng buộc phải drop database hoặc chạy migration phức tạp để có dữ liệu mới.

### 4.2. Giải pháp seed thông minh theo Slug trong `DataSeeder.cs`

#### Bước 1: Seed Categories Idempotent
```csharp
// 1. Tải danh sách slug danh mục đã có trong DB
var existingCategories = await context.Categories.ToListAsync();
var categoryDict = existingCategories.ToDictionary(c => c.Slug, c => c);

// 2. Định nghĩa danh sách 15 Categories tiêu chuẩn
var allCategories = new[]
{
    new { Name = "Thiệp Cưới", Slug = "wedding", Description = "Mẫu thiệp cưới online lãng mạn, hiện đại tích hợp album ảnh, âm nhạc và xác nhận RSVP.", Icon = "Heart", OrderIndex = 1 },
    new { Name = "Lễ Đính Hôn", Slug = "engagement", Description = "Thiệp lễ ăn hỏi, đính hôn phong cách thanh lịch truyền thống kết hợp hiện đại.", Icon = "Ring", OrderIndex = 2 },
    new { Name = "Sinh Nhật", Slug = "birthday", Description = "Mẫu thiệp sinh nhật dạ tiệc sôi động, pháo hoa giấy và âm thanh lôi cuốn.", Icon = "Cake", OrderIndex = 3 },
    new { Name = "Kỷ Niệm Ngày Cưới", Slug = "anniversary", Description = "Ôn lại chặng đường tình yêu ngọt ngào với thiệp kỷ niệm ngày chung đôi.", Icon = "Sparkles", OrderIndex = 4 },
    new { Name = "Thôi Nôi & Đầy Tháng", Slug = "baby-shower", Description = "Chào đón thiên thần nhỏ với những thiết kế dễ thương, ấm áp.", Icon = "Baby", OrderIndex = 5 },
    new { Name = "Hội Nghị & Sự Kiện", Slug = "conference", Description = "Hội nghị cấp cao, công nghệ, diễn giả và hệ thống bán vé trực tuyến.", Icon = "Mic", OrderIndex = 6 },
    new { Name = "Ứng Dụng & Năng Suất", Slug = "app-showcase", Description = "Landing page ứng dụng di động, video demo và triết lý sản phẩm.", Icon = "Layers", OrderIndex = 7 },
    new { Name = "Y Tế & Nha Khoa", Slug = "medical", Description = "Phòng khám nha khoa cao cấp, danh mục dịch vụ và đặt lịch hẹn tư vấn.", Icon = "Stethoscope", OrderIndex = 8 },
    new { Name = "Nền Tảng SaaS", Slug = "saas", Description = "Giải pháp phần mềm B2B, tự động hóa quy trình và bảng giá dịch vụ.", Icon = "Cpu", OrderIndex = 9 },
    new { Name = "Ẩm Thực & Nhà Hàng", Slug = "restaurant", Description = "Khai trương nhà hàng ẩm thực, tiệc thưởng vị Fine Dining và đặt bàn trực tuyến.", Icon = "Utensils", OrderIndex = 10 },
    new { Name = "Thể Thao & Fitness", Slug = "fitness", Description = "Câu lạc bộ thể hình cao cấp, huấn luyện viên cá nhân và gói tập chuyển hóa cơ thể.", Icon = "Dumbbell", OrderIndex = 11 },
    new { Name = "Tiệc Tân Gia", Slug = "housewarming", Description = "Tiệc mừng nhà mới ấm cúng, sơ đồ chỉ đường và hộp quà mừng tân gia.", Icon = "Home", OrderIndex = 12 },
    new { Name = "Giáo Dục & Khóa Học", Slug = "education", Description = "Khóa học chuyên sâu, workshop công nghệ và hội thảo trực tuyến.", Icon = "GraduationCap", OrderIndex = 13 },
    new { Name = "Bất Động Sản & Nghỉ Dưỡng", Slug = "real-estate", Description = "Biệt thự nghỉ dưỡng cao cấp, căn hộ độc bản và đặt lịch trải nghiệm.", Icon = "Building", OrderIndex = 14 },
    new { Name = "Nghệ Thuật & Triển Lãm", Slug = "art-craft", Description = "Triển lãm mỹ thuật đương đại, gốm thủ công độc bản và đêm tiệc Vernissage.", Icon = "Palette", OrderIndex = 15 }
};

var categoriesToAdd = new List<Category>();
foreach (var c in allCategories)
{
    if (!categoryDict.ContainsKey(c.Slug))
    {
        var newCat = Category.Create(c.Name, c.Slug, c.Description, c.Icon, c.OrderIndex, true);
        categoriesToAdd.Add(newCat);
        categoryDict[c.Slug] = newCat;
    }
}

if (categoriesToAdd.Count > 0)
{
    context.Categories.AddRange(categoriesToAdd);
    await context.SaveChangesAsync();
}
```

#### Bước 2: Seed Templates Idempotent
```csharp
// 1. Tải danh sách slug template đã có trong DB
var existingTemplates = await context.Templates.ToListAsync();
var templateDict = existingTemplates.ToDictionary(t => t.Slug, t => t);

// 2. Danh sách 19 Templates (11 cũ + 8 mới)
var allTemplateDefinitions = new[]
{
    // 11 Templates hiện có:
    // elegance-blossom, golden-glamour, sweet-romance, eternal-love, pastel-dream-baby,
    // silver-jubilee, traditional-grace, ai-summit-pro, drift-planner-app, smilecraft-dental, cloudflow-saas
    
    // 8 Templates mới:
    // laura-bistro-gourmet, apex-titanium-fitness, warm-nest-housewarming, azure-breeze-beach-wedding,
    // genai-prompt-masterclass, horizon-luxury-villas, academic-glory-graduation, terra-soul-art-exhibition
};

var templatesToAdd = new List<Template>();
foreach (var def in allTemplateDefinitions)
{
    if (!templateDict.ContainsKey(def.Slug))
    {
        var categoryId = categoryDict.TryGetValue(def.CategorySlug, out var cat) ? cat.Id : (Guid?)null;
        var tmpl = Template.Create(
            def.Name,
            def.Slug,
            def.Description,
            categoryId,
            def.CategoryName,
            def.ThumbnailUrl,
            def.PreviewUrl,
            def.LongPreviewUrl,
            def.Badge,
            def.AudioUrl,
            def.MusicTitle,
            def.ConfigJson);

        templatesToAdd.Add(tmpl);
        templateDict[def.Slug] = tmpl;
    }
}

if (templatesToAdd.Count > 0)
{
    context.Templates.AddRange(templatesToAdd);
    await context.SaveChangesAsync();
}
```

---

## 5. CÁC TRƯỜNG HỢP BIÊN BẮT BUỘC PHẢI XỬ LÝ (EDGE CASES)

1. **Ràng buộc Unique Slug trong Database**:
   - `Slug` của bảng `Categories` và `Templates` có ràng buộc Unique Index. Không được phép `Add` bản ghi có `Slug` trùng lặp khi chạy lại `SeedAsync`. Cơ chế Dictionary theo `Slug` ngăn chặn triệt để lỗi này.
2. **Cơ sở dữ liệu đã có sẵn dữ liệu trước đó**:
   - Khi chạy ứng dụng trên môi trường đã có sẵn dữ liệu cũ (9 categories và 11 templates), Seeder không ném Exception, không làm thay đổi các ID cũ và bổ sung chính xác 6 categories cùng 8 templates mới.
3. **Tính hợp lệ của JSON cấu hình (Valid JSON Formatting)**:
   - Tất cả 8 cấu hình JSON mới phải là JSON hợp lệ (không chứa trailing comma, đúng cấu trúc cặp ngoặc, serialize/deserialize mượt mà với `System.Text.Json` và `JsonDocument.Parse`).
4. **Tương thích hoàn hảo với `LandingPageRenderer.jsx`**:
   - Mọi mảng danh sách (`timeline`, `gallery`, `servicesGrid`, `treatmentProcess`, `featureCardsGrid`, `speakers`, `pricingTickets`, `pricingPackages`, `metrics`, `extraSections`) không bao giờ để `null`, luôn để `[]` để tránh lỗi `.map()` hoặc `.length` trên Frontend.
5. **Hỗ trợ Lucide Icons**:
   - Các icon sử dụng cho Category và Timeline phải là icon chuẩn trong `lucide-react`: `Utensils`, `Dumbbell`, `Home`, `GraduationCap`, `Building`, `Palette`, `Camera`, `Heart`, `Music`, `Sparkles`, `Cake`, `GlassWater`.
6. **Kiểu dữ liệu Thời gian (UTC Datetime)**:
   - Các trường `CreatedAtUtc` tuân thủ UTC chuẩn hóa theo cấu hình converter của `ApplicationDbContext`.

---

## 6. QUY ƯỚC CẦN BÁM THEO (TÊN FILE THAM CHIẾU)

1. **`c:\Source\TemplateLandingPage\BE\src\Persistence\Data\DataSeeder.cs`**:
   - Copy cú pháp raw string literal C# 11: `""" { ... } """`.
   - Bám sát phương thức khởi tạo qua Factory Methods: `Category.Create(...)`, `Template.Create(...)`.
2. **`c:\Source\TemplateLandingPage\BE\src\Domain\Entities\Category.cs`**:
   - Chữ ký Factory Method: `Category.Create(string name, string slug, string? description, string? icon, int orderIndex, bool isActive = true)`.
3. **`c:\Source\TemplateLandingPage\BE\src\Domain\Entities\Template.cs`**:
   - Chữ ký Factory Method: `Template.Create(string name, string slug, string? description, Guid? categoryId, string category, string thumbnailUrl, string? previewUrl, string? longPreviewUrl, string? badge, string? audioUrl, string? musicTitle, string defaultConfigJson)`.
4. **`c:\Source\TemplateLandingPage\FE\src\components\templates\LandingPageRenderer.jsx`**:
   - Đọc các trường: `theme`, `hero`, `coupleOrCelebrant`, `eventDetails`, `timeline`, `gallery`, `extraSections`, `rsvp`, `wishes`, `servicesGrid`, `treatmentProcess`, `booking`, `featureCardsGrid`, `metrics`, `speakers`, `pricingTickets`, `pricingPackages`.
5. **`c:\Source\TemplateLandingPage\BE\test\UnitTests\Persistence\DataSeederTests.cs`**:
   - Bám theo quy ước kiểm thử: xUnit, `FluentAssertions`, `JsonDocument.Parse`, kiểm tra Idempotency khi chạy `SeedAsync` 2 lần liên tiếp.

---

## 7. KẾ HOẠCH BÀN GIAO CHO CHẶNG 2 (CODER)
- Coder thực hiện đúng các bước theo bảng file ở Mục 2:
  1. Mở `DataSeeder.cs`, thêm định nghĩa và config JSON của 8 templates mới, chuyển đổi logic seed sang cơ chế kiểm tra `Slug` thông minh cho Categories và Templates.
  2. Mở `DataSeederTests.cs`, nâng cấp các assertion count từ 9 -> 15 Categories, 11 -> 19 Templates, bổ sung kiểm tra JSON cho các template mới.
  3. Chạy `dotnet test test/UnitTests/TemplateLandingPage.UnitTests.csproj --no-restore` để đảm bảo 100% test pass.
