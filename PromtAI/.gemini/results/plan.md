# Kế Hoạch Triển Khai: Tái Cấu Trúc & Nâng Cấp Trang Home & Giao Diện Customize/Renderer

## 1. CÂU HỎI CÒN BỎ NGỎ
Không có

---

## 2. NHỮNG FILE CẦN TẠO MỚI HOẶC CẦN SỬA

### A. Backend (BE)
- **Không có file nào cần tạo mới hoặc sửa đổi**: Endpoint hiện tại `GET /api/v1/templates?isActiveOnly=true` trong `BE/src/TemplateLandingPage.Presentation/Endpoints/TemplateEndpoints.cs` và `templateApi.getTemplates({ isActiveOnly: true })` đã cung cấp đầy đủ dữ liệu templates gồm `id`, `name`, `slug`, `category`, `thumbnailUrl`, `longPreviewUrl`, `badge`, `musicTitle`, `defaultConfigJson`.

---

### B. Frontend (FE)

#### 1. Các file tạo mới:
1. `FE/src/components/home/SplashScreen.jsx`
   - **Mục đích**: Hiển thị màn hình chào đếm số mượt mà từ 0% đến 100% bằng `requestAnimationFrame` + easing, kèm thanh tiến trình mờ và thương hiệu MotionSites, tự động fade-out khi hoàn tất.
2. `FE/src/hooks/useStaggeredReveal.js`
   - **Mục đích**: Custom hook quản lý trạng thái reveal so le cho danh sách card/section khi cuộn vào viewport bằng `IntersectionObserver`.
3. `FE/src/components/templates/sections/HeroSection.jsx`
   - **Mục đích**: Sub-component hiển thị Hero Section được bọc `React.memo`, nhận props và hiệu ứng highlight Live Edit Feedback khi người dùng sửa tab Hero / Theme.
4. `FE/src/components/templates/sections/PersonsSection.jsx`
   - **Mục đích**: Sub-component hiển thị danh sách Nhân vật (Cô Dâu & Chú Rể / Sinh Nhật / Diễn Giả) được bọc `React.memo`, giữ nguyên toàn bộ grid layout class (`max-w-md mx-auto grid grid-cols-1`, `max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2`, v.v.) tương thích 100% với tests hiện tại.
5. `FE/src/components/templates/sections/EventDetailsSection.jsx`
   - **Mục đích**: Sub-component hiển thị thông tin chi tiết sự kiện, thời gian, địa điểm, bản đồ Google Maps được bọc `React.memo`.
6. `FE/src/components/templates/sections/TimelineSection.jsx`
   - **Mục đích**: Sub-component hiển thị Lịch trình sự kiện (Timeline) được bọc `React.memo`.
7. `FE/src/components/templates/sections/GallerySection.jsx`
   - **Mục đích**: Sub-component hiển thị Album ảnh kỷ niệm được bọc `React.memo`, hỗ trợ kích hoạt Lightbox modal.
8. `FE/src/components/templates/sections/ExtraSections.jsx`
   - **Mục đích**: Sub-component hiển thị các section bổ sung (Thank You, VietQR, Q&A, Custom) được bọc `React.memo`, bảo toàn đầy đủ các id, button copy STK, accordion toggle.
9. `FE/src/components/templates/sections/RsvpSection.jsx`
   - **Mục đích**: Sub-component hiển thị biểu mẫu phản hồi tham dự RSVP (`#rsvp-section`) được bọc `React.memo`.
10. `FE/src/components/templates/sections/WishesSection.jsx`
    - **Mục đích**: Sub-component hiển thị Sổ lưu bút & Lời chúc được bọc `React.memo`.

#### 2. Các file cần sửa đổi:
1. `FE/src/index.css`
   - **Mục đích**: Khai báo font Open Sauce One / Montserrat chuẩn, thêm GPU-accelerated keyframe `@keyframes live-edit-pulse`, `@keyframes live-edit-glow` và class `.animate-live-edit` với `will-change: transform, box-shadow` để tăng tốc phần cứng, tránh layout thrashing.
2. `FE/src/components/Navbar.jsx`
   - **Mục đích**: Nâng cấp giao diện Navbar sang trọng với phong cách fixed glassmorphism mờ nhẹ (`backdrop-blur-md bg-white/80 border-b border-gray-100/60`), mobile hamburger drawer trượt mượt mà (slide-in) cùng lớp overlay tối màu cao cấp.
3. `FE/src/pages/HomePage.jsx`
   - **Mục đích**: Tái cấu trúc thành giao diện 3 section toàn màn hình liền mạch:
     - Tích hợp `SplashScreen` đếm 0-100%.
     - **Section 1 (Hero Section)**: Typography Montserrat / Open Sauce One với clamp responsive, ambient lighting glow, badge glassmorphism và nút CTA sang trọng.
     - **Section 2 (Masked Cards / Mosaic Showcase)**: Nạp templates thật qua `templateApi.getTemplates({ isActiveOnly: true })`, trình bày dạng Mosaic / Bento Grid với hiệu ứng Masked Cards, kích hoạt xuất hiện so le bằng `useStaggeredReveal`, tích hợp nút xem demo (`/preview/:id`), tùy biến ngay (`/customize/:id`), xem kho mẫu (`/templates`).
     - **Section 3 (Experience Workflow & High-Impact CTA)**: Bố cục 3 bước trực quan tinh giản, card bento hiện đại, banner CTA kích thích hành động, chuyển tiếp tự nhiên vào footer.
4. `FE/src/components/customizer/CustomizerSidebar.jsx`
   - **Mục đích**: Bổ sung prop callback `onSectionEdit(sectionName)` và trigger tại các hàm sửa đổi (`updateConfig`, `updateNestedConfig`, `handlePersonFieldChange`, `handleTimelineChange`, `handleGalleryChange`, `handleExtraSectionChange`, v.v.) để phát tín hiệu vị trí vừa thay đổi cho Preview.
5. `FE/src/pages/CustomizerPage.jsx`
   - **Mục đích**:
     - Áp dụng `useDeferredValue(config)` khi truyền config xuống `LandingPageRenderer` để giữ tốc độ gõ phím tại Sidebar luôn đạt 60fps không bị đơ giật.
     - Tiếp nhận callback `onSectionEdit(sectionName)` từ `CustomizerSidebar`, cập nhật state `activeEditSection` và timestamp để truyền xuống `LandingPageRenderer`.
6. `FE/src/components/templates/LandingPageRenderer.jsx`
   - **Mục đích**: Tái cấu trúc thành Orchestrator Component:
     - Nhập và render 8 sub-components memoized (`HeroSection`, `PersonsSection`, `EventDetailsSection`, `TimelineSection`, `GallerySection`, `ExtraSections`, `RsvpSection`, `WishesSection`).
     - Tiếp nhận props `activeEditSection`, truyền cờ `isHighlighted` cho từng sub-component tương ứng để kích hoạt visual feedback.
     - Giữ nguyên cả named export `export const LandingPageRenderer` và `export default LandingPageRenderer` để tương thích 100% với các trang và test suites hiện có.

---

## 3. CHỮ KÝ HÀM HOẶC INTERFACE CẦN CÓ

### A. Custom Hook: `useStaggeredReveal`
**File**: `FE/src/hooks/useStaggeredReveal.js`
```javascript
/**
 * Hook quan sát danh sách phần tử và kích hoạt hiển thị so le
 * @param {Object} options
 * @param {number} [options.threshold=0.15]
 * @param {string} [options.rootMargin='0px 0px -50px 0px']
 * @param {number} [options.staggerMs=120]
 * @param {number} [options.totalItems=0]
 * @returns {{ containerRef: React.RefObject, isItemVisible: (index: number) => boolean, visibleIndices: Set<number> }}
 */
export function useStaggeredReveal({ threshold = 0.15, rootMargin = '0px 0px -50px 0px', staggerMs = 120, totalItems = 0 } = {})
```

### B. Component: `SplashScreen`
**File**: `FE/src/components/home/SplashScreen.jsx`
```javascript
/**
 * Component hiển thị màn hình tải mở đầu đếm số mượt từ 0% đến 100%
 * @param {Object} props
 * @param {Function} props.onComplete Callback khi đếm xong 100% và kết thúc animation fade out
 * @param {number} [props.durationMs=1200] Tổng thời gian đếm từ 0 đến 100
 */
export default function SplashScreen({ onComplete, durationMs = 1200 })
```

### C. Sub-Components của `LandingPageRenderer`
**Thư mục**: `FE/src/components/templates/sections/`

1. **`HeroSection.jsx`**:
```javascript
/**
 * @param {Object} props
 * @param {Object} props.hero
 * @param {Object} props.theme
 * @param {Object} props.timeLeft
 * @param {boolean} props.rsvpEnabled
 * @param {boolean} props.isHighlighted
 */
export const HeroSection = React.memo(function HeroSection({ hero, theme, timeLeft, rsvpEnabled, isHighlighted }) { ... });
```

2. **`PersonsSection.jsx`**:
```javascript
/**
 * @param {Object} props
 * @param {Object} props.couple
 * @param {Array} props.personsList
 * @param {string} props.primaryColor
 * @param {boolean} props.isHighlighted
 */
export const PersonsSection = React.memo(function PersonsSection({ couple, personsList, primaryColor, isHighlighted }) { ... });
```

3. **`EventDetailsSection.jsx`**:
```javascript
/**
 * @param {Object} props
 * @param {Object} props.eventDetails
 * @param {string} props.primaryColor
 * @param {boolean} props.isHighlighted
 */
export const EventDetailsSection = React.memo(function EventDetailsSection({ eventDetails, primaryColor, isHighlighted }) { ... });
```

4. **`TimelineSection.jsx`**:
```javascript
/**
 * @param {Object} props
 * @param {Array} props.timeline
 * @param {string} props.timelineAnimation
 * @param {string} props.primaryColor
 * @param {string} props.secondaryColor
 * @param {boolean} props.isHighlighted
 */
export const TimelineSection = React.memo(function TimelineSection({ timeline, timelineAnimation, primaryColor, secondaryColor, isHighlighted }) { ... });
```

5. **`GallerySection.jsx`**:
```javascript
/**
 * @param {Object} props
 * @param {Array} props.gallery
 * @param {string} props.galleryAnimation
 * @param {string} props.primaryColor
 * @param {Function} props.onOpenLightbox
 * @param {boolean} props.isHighlighted
 */
export const GallerySection = React.memo(function GallerySection({ gallery, galleryAnimation, primaryColor, onOpenLightbox, isHighlighted }) { ... });
```

6. **`ExtraSections.jsx`**:
```javascript
/**
 * @param {Object} props
 * @param {Array} props.extraSections
 * @param {string} props.primaryColor
 * @param {Object} props.openQaIndex
 * @param {Function} props.toggleQa
 * @param {boolean} props.copiedStk
 * @param {Function} props.handleCopyStk
 * @param {boolean} props.isHighlighted
 * @param {string|null} props.activeEditSection
 */
export const ExtraSections = React.memo(function ExtraSections({ extraSections, primaryColor, openQaIndex, toggleQa, copiedStk, handleCopyStk, isHighlighted, activeEditSection }) { ... });
```

7. **`RsvpSection.jsx`**:
```javascript
/**
 * @param {Object} props
 * @param {Object} props.rsvp
 * @param {string} props.primaryColor
 * @param {string|null} props.customizationId
 * @param {boolean} props.isHighlighted
 */
export const RsvpSection = React.memo(function RsvpSection({ rsvp, primaryColor, customizationId, isHighlighted }) { ... });
```

8. **`WishesSection.jsx`**:
```javascript
/**
 * @param {Object} props
 * @param {Object} props.wishes
 * @param {string} props.primaryColor
 * @param {string|null} props.customizationId
 * @param {boolean} props.isHighlighted
 */
export const WishesSection = React.memo(function WishesSection({ wishes, primaryColor, customizationId, isHighlighted }) { ... });
```

### D. Props bổ sung cho `CustomizerSidebar` & `LandingPageRenderer`
- **`CustomizerSidebar`**:
  - Thêm prop: `onSectionEdit?: (sectionKey: string) => void`
  - Các giá trị `sectionKey`: `'theme'`, `'hero'`, `'couple'`, `'eventDetails'`, `'timeline'`, `'gallery'`, `'rsvp'`, `'wishes'`, `'extra'`, hoặc `extra-${id}`.
- **`LandingPageRenderer`**:
  - Thêm props:
    `activeEditSection?: string | null`
    `editFeedbackKey?: number | string`

---

## 4. CÁC TRƯỜNG HỢP BIÊN BẮT BUỘC PHẢI XỬ LÝ

1. **Splash screen không bao giờ bị kẹt**:
   - Trường hợp người dùng chuyển tab hoặc `requestAnimationFrame` bị hoãn, có fallback timer `setTimeout` (1.8s) bảo đảm splash screen kết thúc và mở giao diện người dùng bình thường.
   - Thêm cờ lưu phiên (`sessionStorage.getItem('splash_shown')`) hoặc chạy mượt mà ngay cả khi API nạp templates bị chậm.
2. **Xử lý danh sách templates rỗng hoặc lỗi API tại HomePage**:
   - Khi `templateApi.getTemplates({ isActiveOnly: true })` trả về mảng rỗng hoặc lỗi kết nối, hiển thị khung Skeleton Loader tinh xảo và fallback sang danh sách mẫu mặc định tối thiểu từ `defaultTemplates.js`, không để trang bị crash hay vỡ giao diện Mosaic.
3. **Hiệu năng 60 FPS khi gõ phím nhanh (Fast Input Throttle / Concurrency)**:
   - Dùng `useDeferredValue(config)` tại `CustomizerPage` để truyền xuống `LandingPageRenderer`. Nhờ đó React 19 trì hoãn cập nhật preview mà không khóa luồng nhập liệu ở input sidebar.
   - Visual edit feedback highlight tự động dập tắt sau 900ms (clear timeout) để không bị nhấp nháy liên tục khi người dùng gõ chuỗi ký tự dài liên tiếp.
4. **Bảo toàn 100% cấu trúc DOM cho các test suites hiện tại**:
   - Sub-component `PersonsSection` phải bảo lưu chính xác các class Tailwind:
     - 1 người: `max-w-md mx-auto grid grid-cols-1`
     - 2 người: `max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2`
     - 3 người: `max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3`
     - 4+ người: `max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
   - Sub-component `RsvpSection` phải giữ đúng id container: `id="rsvp-section"`.
   - Sub-component `ExtraSections` phải giữ nguyên các thuộc tính alt và title:
     - `alt="VietQR code"`
     - `alt="Thank you"`
     - `title="Sao chép số tài khoản"`
   - `LandingPageRenderer.jsx` phải giữ nguyên cả hai cách xuất khẩu:
     - `export const LandingPageRenderer`
     - `export default LandingPageRenderer`
5. **Giải phóng tài nguyên và Passive Event Listeners**:
   - Mọi `IntersectionObserver` trong `useStaggeredReveal` và `ScrollReveal` phải gọi `unobserve()` / `disconnect()` khi component unmount.
   - Nếu có event listener cuộn (`scroll`), phải sử dụng `{ passive: true }` để trình duyệt tối ưu hóa compositing thread.

---

## 5. QUY ƯỚC CẦN BÁM THEO

Sao chép quy ước từ:
- **TÊN FILE QUY ƯỚC**: `PromtAI/.gemini/agents/coder.md` (Phần B: Quy chuẩn Frontend React + Vite + Tailwind CSS và Phần C: Checklist review).
- **Quy tắc đặt tên file & component**:
  - Component: `PascalCase.jsx` (`SplashScreen.jsx`, `HeroSection.jsx`, `PersonsSection.jsx`, ...)
  - Custom Hook: `camelCase.js` (`useStaggeredReveal.js`)
  - Sub-components đặt trong thư mục `FE/src/components/templates/sections/`.
- **Thư viện Styling**:
  - Tailwind CSS + Lucide React (`lucide-react`).
  - Sử dụng typography clamp (`clamp(2.5rem, 6vw, 4.5rem)`), Montserrat / Open Sauce One, glassmorphism (`backdrop-blur-md bg-white/80 border border-white/20`).
- **Kỷ luật mã nguồn**:
  - Build sạch: `npm run build` và `npm test` trong thư mục `FE` phải pass 100%.
  - Không để lại `console.log` hay code thừa không sử dụng.
