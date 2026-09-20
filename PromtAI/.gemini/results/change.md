# BÁO CÁO THAY ĐỔI & HIỆN THỰC HÓA MÃ NGUỒN (CHANGE.MD)

> **Dự án**: Template Landing Page Platform  
> **Chặng thực hiện**: Chặng 2 - Coder (Senior Implementation Engineer)  
> **Kế hoạch đối chiếu**: `PromtAI/.gemini/results/plan.md`  
> **Ngày hoàn thành**: 20/09/2026  
> **Trạng thái kiểm thử**: 
> - **Backend**: 323/323 unit tests PASSED (100%)
> - **Frontend**: 12/12 test suites, 121/121 tests PASSED (100%)
> - **Frontend Production Build**: Vite build thành công (0 errors)

---

## 1. Danh Sách File Đã Thay Đổi & Tạo Mới

### A. Frontend Core Animation & Components (Hiệu ứng & Giao diện Trang Chủ)
1. **`FE/src/hooks/useMaskPositions.js`** *(Tạo mới)*: Hook theo dõi container và tính toán kích thước, vị trí tương đối `{ x, y, sw, sh }` của các card con dựa trên `ResizeObserver` (có fallback an toàn cho JSDOM/SSR).
2. **`FE/src/hooks/useImageWidth.js`** *(Tạo mới)*: Hook tính toán chiều rộng hiển thị thực tế (`renderWidth`) của ảnh nền chung trải rộng dựa vào `sectionHeight`, `naturalAspectRatio` (16/9), phát hiện `isMobile` và tiêu cự `focalX` (0.8 trên Desktop, 0.7 trên Mobile).
3. **`FE/src/components/home/MaskedCard.jsx`** *(Tạo mới)*: Component thẻ hiển thị một phần ảnh nền dùng chung qua `background-size` và `background-position` âm tính toán theo `focalOffset`.
4. **`FE/src/components/home/SplashScreen.jsx`** *(Cập nhật)*: Tinh chỉnh counter đếm số ở góc dưới bên trái (`bottom-8 left-8 text-7xl md:text-9xl font-black`), thời lượng chạy mượt mà 2000ms, trễ giữ nguyên 200ms trước khi mờ dần 700ms (`fade-out`).
5. **`FE/src/components/Navbar.jsx`** *(Cập nhật)*: Cập nhật Logo 2 dòng tinh tế, nút Menu viền đen (`border border-black`), Hamburger icon 3 span chuyển thành chữ X bằng `cubic-bezier(0.16, 1, 0.3, 1)`, Navigation Drawer trượt từ cạnh phải với staggered delay cho từng menu item.
6. **`FE/src/pages/HomePage.jsx`** *(Cập nhật)*: Hiện thực hóa cấu trúc Section 1 (Hero với masked cards nổi bật), Section 2 (Mosaic masked cards giới thiệu nền tảng), và Section 3 (Layout cột trái `sticky top-24` hiển thị workflow, cột phải cuộn danh sách card tính năng kích hoạt step indicator tương ứng).

### B. Frontend Diverse Landing Page Formats & Sub-sections
7. **`FE/src/components/templates/sections/SpeakersSection.jsx`** *(Tạo mới)*: Component hiển thị danh sách diễn giả / chuyên gia uy tín dạng Grid card, hỗ trợ avatar tròn, họ tên, học vị, công ty và bio tóm tắt.
8. **`FE/src/components/templates/sections/PricingSection.jsx`** *(Tạo mới)*: Component hiển thị các gói vé sự kiện / bảng giá SaaS (Standard, VIP, Enterprise) với badge `Phổ Biến Nhất`, danh sách tính năng và CTA đặt mua.
9. **`FE/src/components/templates/sections/ServicesSection.jsx`** *(Tạo mới)*: Component dịch vụ chuyên biệt (phù hợp Clinic, Spa, Agency) gồm danh mục dịch vụ, quy trình khám/điều trị 4 bước chuẩn hóa và form đặt lịch hẹn nhanh.
10. **`FE/src/components/templates/sections/FeatureCardsSection.jsx`** *(Tạo mới)*: Component thẻ tính năng dạng Bento / Modern Grid cho ứng dụng và sản phẩm SaaS, kèm banner chỉ số metric và nút tải app (App Store, Google Play).
11. **`FE/src/components/templates/sections/HeroSection.jsx`** *(Cập nhật)*: Bổ sung hỗ trợ Video Background (`hero.videoUrl`) tự động lặp (`autoplay loop muted playsinline`), overlay mờ và fallback ảnh nền khi không có video.
12. **`FE/src/components/templates/LandingPageRenderer.jsx`** *(Cập nhật)*: Điều phối hiển thị động các section theo cấu hình (`speakers`, `pricing`, `services`, `features`, `persons`, `timeline`, `gallery`, `giftInfo`, `qaList`, `customSections`), bảo toàn 100% khả năng tương thích ngược với mẫu Thiệp cưới / Sinh nhật.
13. **`FE/src/components/customizer/CustomizerSidebar.jsx`** *(Cập nhật)*: Bổ sung các tab và form chỉnh sửa chuyên biệt cho `Speakers`, `Pricing`, `Services`, `Feature Cards`, cho phép người dùng thêm/xóa/sửa từng phần tử trực tiếp.
14. **`FE/src/utils/defaultTemplates.js`** *(Cập nhật)*: Định nghĩa 6 cấu hình mẫu chuẩn công nghiệp:
    - Wedding Romantic (`wedding`)
    - Global AI Summit (`conference`)
    - Drift ADHD Focus Planner (`app-showcase`)
    - Elite Care Dental Clinic (`medical`)
    - CloudScale Modern SaaS (`saas`)
    - Kids Dinosaur Birthday (`birthday`)
    - Hàm trợ giúp `getDefaultConfigByCategory` hỗ trợ tự động gán cấu hình theo danh mục.

### C. Backend Persistence & Seeder
15. **`BE/src/Persistence/Data/DataSeeder.cs`** *(Cập nhật)*: Cập nhật dữ liệu mẫu Idempotent gồm 9 Categories, 11 Templates và 6 Customizations với đầy đủ JSON cấu hình mới chuẩn hóa (`aiSummitConfigJson`, `driftPlannerConfigJson`, `dentalClinicConfigJson`, `modernSaasConfigJson`), đồng thời bảo đảm trường `eventDetails` luôn tồn tại trong schema.
16. **`BE/test/UnitTests/Persistence/DataSeederTests.cs`** *(Cập nhật)*: Cập nhật kỳ vọng kiểm thử tương ứng (9 categories, 11 templates, 6 customizations, kiểm tra toàn vẹn schema JSON).

### D. Frontend Test Suites
17. **`FE/test/useMaskAnimation.test.jsx`** *(Tạo mới)*: 7 bài test kiểm tra hoạt động của `useMaskPositions`, `useImageWidth`, và khả năng render thẻ `MaskedCard`.
18. **`FE/test/splashScreen.test.jsx`** *(Cập nhật)*: 4 bài test kiểm tra vị trí góc trái, counter 0 -> 100, class kích thước chữ lớn và sự kiện fade out.
19. **`FE/test/homePageNew.test.jsx`** *(Cập nhật)*: 6 bài test kiểm tra 3 section toàn màn hình, sticky workflow indicator và fallback dữ liệu an toàn.
20. **`FE/test/diverseTemplates.test.jsx`** *(Tạo mới)*: 11 bài test kiểm tra hiển thị trọn vẹn 6 định dạng mẫu, các section mới (Speakers, Pricing, Services, Features) và tính tương thích ngược.

---

## 2. Chi Tiết Mục Đích Sửa Đổi Của Từng Chỗ

| File | Mục đích sửa đổi |
| :--- | :--- |
| `useMaskPositions.js` | Dùng ResizeObserver theo dõi các thẻ con và tính relative rect `{ x, y, sw, sh }` đối chiếu với container cha, cung cấp tọa độ chuẩn xác cho hiệu ứng mask. |
| `useImageWidth.js` | Tính toán `renderWidth` thực tế dựa trên tỷ lệ gốc 16/9 và chiều cao viewport, dịch chuyển tâm ảnh (`focalX = 0.8` desktop, `0.7` mobile) để giữ góc nhìn đẹp nhất. |
| `MaskedCard.jsx` | Áp dụng background clip bằng các thuộc tính CSS âm tính toán từ hook, tạo cảm giác các card cắt xuyên qua một ảnh toàn cảnh duy nhất. |
| `SplashScreen.jsx` | Thiết kế counter dạng số đếm khổng lồ ở góc dưới bên trái (`7xl` -> `9xl`), giữ lại 200ms trước khi fade out mượt mà, lưu cờ vào `sessionStorage` để không lặp lại phiền hà. |
| `Navbar.jsx` | Nâng cấp UI thanh điều hướng: Logo tinh tế, nút viền đen `border-black`, Hamburger icon morphing thành chữ X với cubic-bezier chuẩn mực và drawer menu hiệu ứng delay so le. |
| `HomePage.jsx` | Hiện thực hóa trang chủ dạng immersive visual: Section 1 & 2 dùng MaskedCard ghép ảnh chung, Section 3 dùng cơ chế sticky left column cố định và right column cuộn các bước thiết lập. |
| `SpeakersSection.jsx` | Phục vụ các landing page Hội thảo công nghệ, Diễn đàn, Khóa học: hiển thị avatar, tên, chức danh và bio của diễn giả nổi bật. |
| `PricingSection.jsx` | Phục vụ trang Bán vé sự kiện, SaaS, Dịch vụ: bảng giá so sánh các gói dịch vụ, giá tiền VND/USD, tính năng nổi bật và CTA đăng ký. |
| `ServicesSection.jsx` | Phục vụ trang Phòng khám, Thẩm mỹ, Dịch vụ y tế: danh mục dịch vụ, quy trình khám 4 bước minh bạch và form đặt hẹn tiện dụng. |
| `FeatureCardsSection.jsx` | Phục vụ trang Giới thiệu Ứng dụng di động, Phần mềm: thẻ tính năng dạng Bento lưới, số liệu tăng trưởng và nút liên kết App Store/Google Play. |
| `HeroSection.jsx` | Thêm thẻ `<video>` tự động phát nếu cấu hình có `hero.videoUrl`, giúp các trang App Showcase và Công nghệ có visual chuyển động chân thực. |
| `LandingPageRenderer.jsx` | Tích hợp các sub-section chuyên biệt vào luồng render động, đảm bảo fallback an toàn nếu cấu hình thiếu field và giữ nguyên cấu trúc cũ cho thiệp mời. |
| `CustomizerSidebar.jsx` | Bổ sung các panel chỉnh sửa trực quan cho các section mới: người dùng có thể tùy biến diễn giả, thêm sửa xóa gói giá, cập nhật thẻ tính năng mà không cần biết code. |
| `defaultTemplates.js` | Cung cấp bộ cấu hình mặc định phong phú cho 6 định dạng mẫu phổ biến nhất hiện nay, gán sẵn ảnh Unsplash chất lượng cao và nội dung mẫu tiếng Việt tự nhiên. |
| `DataSeeder.cs` | Bổ sung dữ liệu khởi tạo cho cơ sở dữ liệu: thêm các danh mục (`conference`, `app-showcase`, `medical`, `saas`), các template và customization mẫu, đảm bảo tính Idempotent khi seed nhiều lần. |

---

## 3. Vị Trí Trọng Yếu Tester Nên Soi Kỹ

1. **Hiệu ứng MaskedCard trên các kích thước màn hình**:
   - *Vị trí*: `FE/src/components/home/MaskedCard.jsx` và `FE/src/hooks/useMaskPositions.js`.
   - *Điểm soi*: Kiểm tra khi resize cửa sổ trình duyệt từ Desktop (màn lớn) xuống Tablet và Mobile, các thẻ MaskedCard có tính toán lại vị trí ảnh nền mượt mà không bị vỡ hoặc lệch tâm (`focalOffset`).
2. **Sticky Column & Step Indicator ở Section 3 Trang Chủ**:
   - *Vị trí*: `FE/src/pages/HomePage.jsx` (Section 3).
   - *Điểm soi*: Khi cuộn trang qua cột phải (danh sách card bước 1, bước 2, bước 3), cột trái có giữ vị trí `sticky top-24` ổn định không, và các chỉ số (indicators) có chuyển đổi trạng thái active/sáng đèn tương ứng với card đang hiển thị trên viewport hay không.
3. **Video Background & Fallback tại Hero Section**:
   - *Vị trí*: `FE/src/components/templates/sections/HeroSection.jsx`.
   - *Điểm soi*: Kiểm tra template Drift Planner (`app-showcase`) có tự động chạy video nền ở chế độ `muted playsinline loop` không; khi video chưa tải xong hoặc mạng chậm có hiển thị ảnh `hero.background` làm placeholder ổn định không.
4. **Tương thích ngược của LandingPageRenderer**:
   - *Vị trí*: `FE/src/components/templates/LandingPageRenderer.jsx`.
   - *Điểm soi*: Mở các template thiệp cưới cũ (`wedding`) và sinh nhật cũ (`birthday`). Đảm bảo các section truyền thống như Đếm ngược ngày cưới, Thông tin cô dâu/chú rể, Timeline tiệc cưới, Mừng cưới VietQR vẫn hiển thị trọn vẹn và không bị lỗi JavaScript khi không có `speakers` hay `pricing`.
5. **Customizer Sidebar - Thêm / Sửa / Xóa dữ liệu động**:
   - *Vị trí*: `FE/src/components/customizer/CustomizerSidebar.jsx`.
   - *Điểm soi*: Thử thêm một Diễn giả mới trong tab Speakers hoặc thêm một Gói vé mới trong tab Pricing; kiểm tra xem màn hình xem trước (preview) có lập tức cập nhật theo `useDeferredValue` mà không giật lag.
6. **Idempotency của Backend Seeder**:
   - *Vị trí*: `BE/src/Persistence/Data/DataSeeder.cs`.
   - *Điểm soi*: Chạy seeder nhiều lần khi khởi động API server, đảm bảo không bị lỗi khóa ngoại, không sinh ra bản ghi trùng lặp và tất cả các template mới đều có đầy đủ `eventDetails` trong cấu hình.
