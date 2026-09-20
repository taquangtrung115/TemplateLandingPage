# Báo Cáo Thay Đổi (Chặng 2: Coder)

## 1. Danh sách file đã thay đổi / tạo mới

### A. Các file tạo mới:
1. `FE/src/hooks/useStaggeredReveal.js`: Hook quản lý IntersectionObserver kích hoạt hiệu ứng hiển thị so le (staggered delay) cho danh sách phần tử.
2. `FE/src/components/home/SplashScreen.jsx`: Màn hình mở đầu đếm số mượt 0-100% bằng `requestAnimationFrame` + easing, kèm thanh tiến trình mờ, logo MotionSites và fallback safety timer.
3. `FE/src/components/templates/sections/HeroSection.jsx`: Sub-component hiển thị Hero Section memoized (`React.memo`), hỗ trợ visual live edit feedback.
4. `FE/src/components/templates/sections/PersonsSection.jsx`: Sub-component hiển thị Nhân vật (Đám cưới / Sinh nhật / Diễn giả) memoized (`React.memo`), bảo toàn 100% class responsive grid (1, 2, 3, 4+ người).
5. `FE/src/components/templates/sections/EventDetailsSection.jsx`: Sub-component hiển thị chi tiết sự kiện, thời gian, địa điểm, bản đồ Google Maps memoized (`React.memo`).
6. `FE/src/components/templates/sections/TimelineSection.jsx`: Sub-component hiển thị lịch trình sự kiện memoized (`React.memo`).
7. `FE/src/components/templates/sections/GallerySection.jsx`: Sub-component hiển thị album ảnh memoized (`React.memo`), hỗ trợ kích hoạt xem chi tiết Lightbox.
8. `FE/src/components/templates/sections/ExtraSections.jsx`: Sub-component hiển thị các khối mở rộng (Lời cảm ơn, VietQR, Q&A Accordion, Khối tùy biến) memoized (`React.memo`), bảo toàn các thuộc tính `alt`, `title` và copy STK.
9. `FE/src/components/templates/sections/RsvpSection.jsx`: Sub-component hiển thị form RSVP memoized (`React.memo`), bảo toàn định danh `id="rsvp-section"`.
10. `FE/src/components/templates/sections/WishesSection.jsx`: Sub-component hiển thị Sổ lưu bút và lời chúc mừng memoized (`React.memo`).

### B. Các file cập nhật:
1. `FE/src/index.css`: Bổ sung keyframes `@keyframes live-edit-pulse`, `@keyframes live-edit-glow` và utility class `.animate-live-edit` với GPU acceleration (`transform: scale3d`, `translateZ(0)`, `will-change`).
2. `FE/src/components/Navbar.jsx`: Nâng cấp giao diện fixed glassmorphism mờ nhẹ (`backdrop-blur-md bg-white/80 border-b border-gray-100/60`), mobile hamburger drawer trượt mượt mà (slide-in) cùng lớp overlay tối màu cao cấp.
3. `FE/src/pages/HomePage.jsx`: Tái cấu trúc thành 3 section toàn màn hình liền mạch:
   - Tích hợp `SplashScreen` đếm 0-100% (phiên `sessionStorage`).
   - Section 1 (Hero Section): Headline clamp responsive `clamp(2.3rem, 5.5vw, 4.5rem)`, ambient glow, badge glassmorphism, quick stats.
   - Section 2 (Masked Cards / Mosaic Showcase): Nạp templates thật qua `templateApi.getTemplates({ isActiveOnly: true })` với fallback an toàn, trình bày Mosaic / Bento Grid với hiệu ứng Masked Cards, kích hoạt xuất hiện so le bằng `useStaggeredReveal`.
   - Section 3 (Experience Workflow & High-Impact CTA): Bố cục 3 bước trực quan tinh giản (Bento Cards 01-02-03), banner CTA kích thích hành động, chuyển tiếp tự nhiên vào footer.
4. `FE/src/components/customizer/CustomizerSidebar.jsx`: Bổ sung prop `onSectionEdit(sectionKey)` và kích hoạt phát tín hiệu khi người dùng chỉnh sửa bất kỳ mục nào (theme, hero, couple, eventDetails, timeline, gallery, rsvp, wishes, extra).
5. `FE/src/pages/CustomizerPage.jsx`: Áp dụng `useDeferredValue(config)` để form không bị lag đơ khi gõ phím nhanh, quản lý highlight feedback dập tắt sau 900ms.
6. `FE/src/components/templates/LandingPageRenderer.jsx`: Tái cấu trúc thành Orchestrator Component bọc 8 memoized sub-components, tiếp nhận `activeEditSection` để truyền visual feedback, giữ nguyên cả named export `export const LandingPageRenderer` và `export default LandingPageRenderer`.

---

## 2. Kết quả kiểm tra & Test Suite
- **Frontend Unit & Integration Tests**: `npm test` trong `FE/` -> **67/67 tests PASS (100%)**.
- **Frontend Production Build**: `npm run build` trong `FE/` -> **Biên dịch thành công (0 lỗi)**.
- **Backend Unit & Architecture Tests**: `dotnet test BE/TemplateLandingPage.sln /p:AllowMissingPrunePackageData=true` -> **330/330 tests PASS (100%)** (323 UnitTests + 7 Architecture.Tests).

---

## 3. Vị trí trọng yếu mà Tester nên soi kỹ

1. **Hiệu năng nhập liệu thời gian thực (60 FPS Fast Input)**:
   - Mở trang Customize (`/customize/:templateId`), gõ văn bản liên tục ở các ô input Tiêu đề, Tên chú rể/cô dâu, Lịch trình, Lời chúc.
   - Kiểm tra phím gõ không bị khựng/lag nhờ `useDeferredValue(config)`.
   - Kiểm tra hiệu ứng nháy sáng nhẹ viền (`animate-live-edit`) ở khối tương ứng trong màn hình Preview và tự dập tắt sau 900ms.

2. **Giao diện trang chủ (HomePage) & SplashScreen**:
   - Truy cập trang chủ `/`: Màn hình Splash đếm số từ 0% lên 100% kèm thanh tiến trình và fade out.
   - Thử nghiệm trường hợp mạng chậm hoặc chuyển tab: Fallback timer bảo đảm không bao giờ bị kẹt lại màn hình tải.
   - Cuộn chuột xuống Section 2: Kiểm tra các Masked Cards xuất hiện so le mượt mà theo `useStaggeredReveal`.
   - Nhấp "Xem Thử Nhanh": Mở modal `QuickPreviewModal`.
   - Nhấp "Tùy Biến Ngay": Chuyển hướng chính xác sang `/customize/:templateId`.

3. **Responsive Grid & DOM Compatibility trong LandingPageRenderer**:
   - Số lượng nhân vật = 1: Layout hiển thị căn giữa `max-w-md mx-auto grid grid-cols-1`.
   - Số lượng nhân vật = 2: Layout hiển thị 2 cột `max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8`.
   - Số lượng nhân vật = 3: Layout hiển thị 3 cột `max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6`.
   - Số lượng nhân vật = 4: Layout hiển thị 4 cột `max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`.
   - Kiểm tra form RSVP bảo toàn định danh `#rsvp-section` để các nút CTA cuộn đúng vị trí.
   - Kiểm tra tính năng copy số tài khoản VietQR và mở/đóng accordion Q&A.

4. **Mobile Drawer Navigation**:
   - Thu nhỏ màn hình về kích thước mobile (<768px), mở hamburger menu: Menu drawer trượt từ cạnh phải (slide-in) cùng lớp nền tối mờ (overlay). Nhấp vào nền tối hoặc nút `X` để đóng drawer.
