# Báo Cáo Kết Quả Kiểm Thử (Chặng 3: Tester)

## 1. Tổng quan kết quả thực thi kiểm thử

| Khu vực kiểm thử | Framework / Công cụ | Số lượng Test | Kết quả | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Tests** | Vitest 5.0.1 + React Testing Library + jsdom | **103 / 103 tests** | **PASS (100%)** | 10 Test Suites xanh hoàn toàn |
| **Frontend Build** | Vite 6.4.3 (`npm run build`) | **1709 modules** | **SUCCESS (0 errors)** | Bundle tối ưu sạch sẽ |
| **Backend Unit Tests** | xUnit + Moq + FluentAssertions (.NET 10) | **323 / 323 tests** | **PASS (100%)** | Clean Architecture Use Cases |
| **Backend Architecture Tests** | NetArchTest (.NET 10) | **7 / 7 tests** | **PASS (100%)** | Tuân thủ dependency rule |
| **TỔNG CỘNG HỆ THỐNG** | | **433 / 433 tests** | **PASS (100%)** | **DÂY CHUYỀN SẴN SÀNG CHO REVIEWER** |

---

## 2. Chi tiết các nhóm kiểm thử đã xây dựng & mở rộng

### Nhóm 1: Đường chạy thuận lợi (Happy Paths)
1. **`SplashScreen` (`test/splashScreen.test.jsx`)**:
   - Khởi tạo thương hiệu MotionSites, icon Sparkles, tiến trình và phụ đề trạng thái.
   - Đếm số mượt mà từ 0% đến 100% bằng thuật toán easing `easeOutQuart`.
   - Khi đạt 100%, tự động kích hoạt lớp fade-out `opacity-0` và kích hoạt hàm callback `onComplete` sau thời gian chuyển cảnh 400ms.
2. **`useStaggeredReveal` (`test/useStaggeredReveal.test.jsx`)**:
   - Gắn `IntersectionObserver` vào phần tử container.
   - Kích hoạt tuần tự hiệu ứng xuất hiện so le (`staggerMs: 150ms`) cho từng thẻ con khi cuộn vào khung nhìn (viewport).
   - `isItemVisible(idx)` phản hồi chính xác trạng thái hiển thị của từng phần tử (`true`/`false`).
3. **`HomePage` (`test/homePageNew.test.jsx`)**:
   - Render đầy đủ và liền mạch 3 Section toàn màn hình:
     + Section 1 (Hero): Tiêu đề clamp typography, badge "Thế Hệ Thiệp Điện Tử Chuyển Động Mới", nút CTA, 4 khối thống kê nhanh (100%, 0đ, 1 Click, RSVP).
     + Section 2 (Mosaic Showcase): Tải dữ liệu templates thực từ `templateApi.getTemplates({ isActiveOnly: true })`, hiển thị đầy đủ thông tin badge, thể loại, tiêu đề bài hát và ảnh bìa.
     + Section 3 (Workflow & CTA): Trình bày 3 bước Bento trực quan (01 Chọn mẫu, 02 Tùy biến trực quan, 03 Chia sẻ & Thu RSVP) kèm banner kêu gọi hành động cao cấp.
   - Nút "Tùy Biến Ngay" điều hướng chính xác sang `/customize/:id`.
   - Nút "Xem Chi Tiết" / "Xem Thử Nhanh" mở popup `QuickPreviewModal`.
4. **Sub-components của `LandingPageRenderer` (`test/landingPageSections.test.jsx`)**:
   - `PersonsSection`: Kiểm thử và xác nhận 100% cấu trúc class responsive grid của Tailwind:
     + **1 người**: `max-w-md mx-auto grid grid-cols-1`
     + **2 người**: `max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8`
     + **3 người**: `max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6`
     + **4+ người**: `max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`
   - `HeroSection`, `EventDetailsSection`, `TimelineSection`, `GallerySection`, `ExtraSections`, `RsvpSection`, `WishesSection`:
     + Render chính xác dữ liệu cấu hình tương ứng.
     + Khi nhận prop `isHighlighted={true}`, ngay lập tức bổ sung class animation tăng tốc phần cứng `.animate-live-edit`.
     + Orchestrator `LandingPageRenderer` truyền cờ `activeEditSection` xuống đúng sub-component mục tiêu (ví dụ: `'hero'` -> `HeroSection`, `'couple'` -> `PersonsSection`).

---

### Nhóm 2: Các trường hợp biên (Edge Cases)
1. **Fallback an toàn của `SplashScreen` (`test/splashScreen.test.jsx`)**:
   - Khi chuyển tab hoặc `requestAnimationFrame` bị hoãn/treo, bộ định thời an toàn (`fallbackTimer = Math.max(durationMs + 600, 1800)`) tự động kích hoạt kết thúc màn hình Splash, bảo đảm không bao giờ khóa ứng dụng của người dùng.
   - Dọn dẹp sạch sẽ `cancelAnimationFrame`, `clearTimeout` khi component unmount trước khi hoàn tất.
2. **Khả năng tự phục hồi của `HomePage` (`test/homePageNew.test.jsx`)**:
   - Khi `templateApi.getTemplates` trả về mảng rỗng `[]`: Ứng dụng tự động fallback về danh sách mẫu mặc định (`FALLBACK_TEMPLATES`), không làm trắng trang.
   - Khi API gặp sự cố kết nối / lỗi mạng 500: Tự động bắt lỗi và hiển thị fallback an toàn, trải nghiệm người dùng không bị gián đoạn.
   - Quản lý phiên hiển thị: Tự động nhận diện cờ `sessionStorage.getItem('splash_shown')` để không hiển thị lại Splash khi điều hướng trong cùng phiên.
3. **Điều phối thời gian Highlight và `useDeferredValue` (`test/customizerDeferredHighlight.test.jsx`)**:
   - Kích hoạt viền nháy sáng `.animate-live-edit` khi người dùng chỉnh sửa trường thông tin.
   - Tự động dập tắt (extinguish) sau chính xác **900ms**.
   - Khi người dùng gõ phím liên tục với tốc độ cao, timer được reset liên tục, không gây hiện tượng nhấp nháy giật cục.
   - Dọn dẹp timer `clearTimeout` an toàn khi unmount `CustomizerPage`.
4. **Giải phóng tài nguyên Hooks (`test/useStaggeredReveal.test.jsx`)**:
   - Fallback ngay lập tức khi môi trường không hỗ trợ `IntersectionObserver`.
   - Ngắt kết nối `observer.disconnect()` và hủy mọi timeout chờ khi unmount.
   - Xử lý mượt mà khi `totalItems <= 0`.

---

### Nhóm 3: Trường hợp thất bại & Kiểm soát quyền (Failure Paths)
1. **Kiểm soát quyền Guest Update (`test/customizerGuestFlow.test.jsx` & `UpdateCustomizationCommandHandlerTests.cs`)**:
   - Khách vãng lai (Guest) cố ý gửi PUT cập nhật thiệp đã thuộc sở hữu của người dùng đăng ký khác -> Backend từ chối với lỗi `CustomizationErrors.Unauthorized` (HTTP 403 Forbidden).
   - Frontend bắt lỗi 403, hiển thị thông báo cảnh báo rõ ràng cho người dùng, đồng thời giữ nguyên bản nháp lưu trữ cục bộ (`localStorage`) để bảo vệ dữ liệu đã nhập.
2. **Xử lý trùng lặp đường dẫn (`DuplicateSlug`)**:
   - Khi người dùng lưu trùng slug với một thiệp khác đã tồn tại trên hệ thống -> Backend trả về lỗi `CustomizationErrors.DuplicateSlug` (HTTP 400 Bad Request).
   - Frontend hiển thị cảnh báo yêu cầu đổi tên slug và không làm mất dữ liệu chỉnh sửa.
3. **Xử lý tài nguyên không tồn tại (`NotFound`)**:
   - Khi truy cập customizationId không có trong cơ sở dữ liệu (HTTP 404 NotFound) -> Frontend tự động phục hồi về mẫu thiệp cưới mặc định, ngăn chặn hoàn toàn lỗi crash màn hình trắng.

---

## 3. Bằng chứng thực thi lệnh kiểm thử

### A. Frontend Unit Test Suite (`npm test`)
```text
 ✓ test/loginPage.test.jsx (8 tests)
 ✓ test/homePageNew.test.jsx (6 tests)
 ✓ test/customizerDeferredHighlight.test.jsx (3 tests)
 ✓ test/customizerDynamic.test.jsx (26 tests)
 ✓ test/customizerGuestFlow.test.jsx (9 tests)
 ✓ test/splashScreen.test.jsx (4 tests)
 ✓ test/apiUnwrap.test.js (16 tests)
 ✓ test/useStaggeredReveal.test.jsx (4 tests)
 ✓ test/landingPageSections.test.jsx (16 tests)
 ✓ test/authContext.test.jsx (11 tests)

 Test Files  10 passed (10)
      Tests  103 passed (103)
   Duration  28.94s
```

### B. Frontend Production Build (`npm run build`)
```text
vite v6.4.3 building for production...
transforming...
✓ 1709 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                     0.51 kB │ gzip:   0.33 kB
dist/assets/index-BCgjoi4X.css     63.27 kB │ gzip:  10.52 kB
dist/assets/index-Cv9s3Quf.js   1,367.74 kB │ gzip: 305.53 kB
✓ built in 9.88s (0 errors)
```

### C. Backend Test Suite (`dotnet test`)
```text
Passed!  - Failed: 0, Passed: 323, Skipped: 0, Total: 323, Duration: 3 s - TemplateLandingPage.UnitTests.dll (net10.0)
Passed!  - Failed: 0, Passed:   7, Skipped: 0, Total:   7, Duration: 277 ms - TemplateLandingPage.Architecture.Tests.dll (net10.0)
```

---

## 4. Kết luận Chặng 3 (Tester)
- **Tình trạng chất lượng**: **ĐẠT CHUẨN 100%**.
- Toàn bộ 433 tests từ Frontend đến Backend đều XANH TUYỆT ĐỐI.
- Toàn bộ các yêu cầu về Happy Paths, Edge Cases và Failure Paths đã được kiểm chứng toàn diện.
- Sẵn sàng bàn giao cho Chặng 4: Reviewer.
