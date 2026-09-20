# KẾ HOẠCH TRIỂN KHAI: HOMEPAGE PROMPT ANIMATIONS & DIVERSE LANDING PAGE TEMPLATES

## CÂU HỎI CÒN BỎ NGỎ
Không có.

---

## 1. MỤC TIÊU & PHẠM VI TRIỂN KHAI

Bản kế hoạch này hiện thực hóa 2 yêu cầu trọng tâm từ người dùng:
1. **Hoàn thiện trọn bộ kỹ thuật Animation cốt lõi trên trang Home theo đúng Prompt gốc**:
   - Bộ đôi Hook `useMaskPositions` (ResizeObserver tính offset {x, y, sw, sh}) và `useImageWidth` (tính renderWidth theo sectionHeight).
   - Component `MaskedCard` chia sẻ ảnh nền chung (`bgImage`), tính `overflow` và `focalOffset = overflow * focalX` (focalX desktop = 0.8, mobile = 0.7) với background-position âm chuẩn xác tạo hiệu ứng mosaic liền mạch.
   - **Section 1 (Hero)**: 3 Feature Bars + Main Hero card dùng chung `HERO_IMAGE` qua `MaskedCard`, animated bằng `useStaggeredReveal`, headline clamp `text-[clamp(3rem,11vw,11rem)]`.
   - **Section 2 (Smile Gallery / Template Mosaic)**: Grid 4 card dùng chung `SECTION2_IMAGE` (Card 0 top left, Card 1 top right span 2 rows, Card 2 bottom left, Card 3 bottom full-width chứa sub-cards dịch vụ/template) qua `MaskedCard`, animated bằng `useStaggeredReveal`.
   - **Section 3 (Scroll-Driven Feature Showcase)**: Layout 2 cột desktop với Left column STICKY (`lg:sticky lg:top-0 lg:h-screen`) có các nút nav chuyển động bám theo card cuộn; Right column các card cuộn slide-in từ phải sang (`translate-x-16` -> `translate-x-0`, `opacity-0` -> `1`) qua IntersectionObserver.
   - **SplashScreen chuẩn prompt**: Counter ở góc dưới bên trái (`bottom-left`, `items-end justify-start`), số to `text-7xl md:text-9xl font-bold tabular-nums`, đếm từ 0 đến 100 trong đúng 2000ms (20ms/bước), sau đó chờ 200ms và fade-out `opacity-0 duration-700`.
   - **Navbar chuẩn prompt**: Logo xếp tầng 2 dòng, desktop nav nút Menu viền đen, mobile hamburger với 3 spans chuyển động mượt mà thành chữ X (`cubic-bezier(0.76,0,0.24,1)`), mobile drawer trượt và links so le (`transitionDelay: 100 + i * 60ms`).

2. **Nghiên cứu & Bổ sung 6 Format Landing Page phong phú, khác biệt hoàn toàn**:
   - **Format 1**: Thiệp Cưới & Đính Hôn Lãng Mạn (*Motion Romance* - Wedding / Engagement).
   - **Format 2**: Hội Nghị Công Nghệ & AI (*Virtual AI Summit 2026* - Countdown timer, Speaker lineup cards có bio/avatar, Agenda timeline, Vé Early-Bird pricing, FAQ accordion, Sticky registration CTA).
   - **Format 3**: Ứng Dụng Quản Lý Năng Suất & Sức Khỏe Tinh Thần (*Drift ADHD-Friendly Planner* - Video background, triết lý Gentle Productivity, 3 scroll-driven feature cards, CTA Start for free).
   - **Format 4**: Phòng Khám & Dịch Vụ Nha Khoa Cao Cấp (*Dental Health Clinic* - Masked cards mosaic, 4 dịch vụ Veneers/Crowns/Whitening/Implants, Quy trình điều trị, Booking appointment).
   - **Format 5**: Nền Tảng Công Nghệ SaaS (*Modern Cloud SaaS Platform* - 6 feature cards grid 3x2, automated workflows, metrics, pricing tiers).
   - **Format 6**: Tiệc Sinh Nhật & Sự Kiện Vui Nhộn (*Kids & Birthday Celebration* - Confetti, Wishlist quà tặng, Party games timeline, RSVP đa dạng).
   - Nạp vào Backend database (`BE/src/Persistence/Data/DataSeeder.cs`) và frontend default templates (`FE/src/utils/defaultTemplates.js`).
   - Nâng cấp `LandingPageRenderer.jsx` và `CustomizerSidebar.jsx` để tự động nhận diện và render/edit linh hoạt các khối đặc thù của từng format template.

---

## 2. DANH SÁCH FILE CẦN TẠO MỚI HOẶC CẦN SỬA

### A. Frontend (`FE/`)
| STT | Đường dẫn file | Thao tác | Mục đích |
|---|---|---|---|
| 1 | `FE/src/hooks/useMaskPositions.js` | **Tạo mới** | Hook dùng `ResizeObserver` đo đạc container và tính toán offset `{x, y, sw, sh}` cho từng card con |
| 2 | `FE/src/hooks/useImageWidth.js` | **Tạo mới** | Hook tính toán `renderWidth` của ảnh nền chung theo `sectionHeight`, `aspectRatio` và viewport width |
| 3 | `FE/src/components/home/MaskedCard.jsx` | **Tạo mới** | Component hiển thị thẻ có nền cắt ghép từ ảnh chung dựa trên offset âm và focal point |
| 4 | `FE/src/components/home/SplashScreen.jsx` | **Sửa đổi** | Đưa counter về bottom-left, font `text-7xl md:text-9xl`, đếm 2000ms (20ms/step), chờ 200ms, fade-out 700ms |
| 5 | `FE/src/components/Navbar.jsx` | **Sửa đổi** | Cập nhật logo 2 dòng, desktop nav nút Menu viền đen, mobile hamburger 3 spans cubic-bezier X-morph, drawer staggered delay |
| 6 | `FE/src/pages/HomePage.jsx` | **Sửa đổi** | Thay thế Hero section, Showcase mosaic section và Scroll-Driven feature showcase bằng MaskedCard và Sticky left column |
| 7 | `FE/src/utils/defaultTemplates.js` | **Sửa đổi** | Thêm 6 cấu hình format templates chuẩn và cập nhật `getDefaultConfigByCategory` |
| 8 | `FE/src/components/templates/sections/SpeakersSection.jsx` | **Tạo mới** | Render danh sách diễn giả (Avatar, Name, Role, Company, Bio, Social) |
| 9 | `FE/src/components/templates/sections/PricingSection.jsx` | **Tạo mới** | Render bảng vé hội nghị / bảng giá dịch vụ SaaS (Tiers, Perks, CTA Mua vé) |
| 10 | `FE/src/components/templates/sections/ServicesSection.jsx` | **Tạo mới** | Render danh sách dịch vụ nha khoa/y tế (Veneers, Crowns, Whitening, Implants) + Booking CTA |
| 11 | `FE/src/components/templates/sections/FeatureCardsSection.jsx` | **Tạo mới** | Render grid 3x2 tính năng SaaS hoặc 3 feature cards ADHD Gentle Productivity |
| 12 | `FE/src/components/templates/sections/HeroSection.jsx` | **Sửa đổi** | Hỗ trợ video background/mockup (`hero.videoUrl`) và format-specific badges |
| 13 | `FE/src/components/templates/LandingPageRenderer.jsx` | **Sửa đổi** | Nhận diện format template và render linh hoạt các sub-sections: Speakers, Pricing, Services, FeatureCards |
| 14 | `FE/src/components/customizer/CustomizerSidebar.jsx` | **Sửa đổi** | Tự động kích hoạt các tab chuyên biệt (Diễn giả, Gói vé, Dịch vụ, Tính năng) dựa trên dữ liệu format |
| 15 | `FE/test/useMaskAnimation.test.jsx` | **Tạo mới** | Unit test cho `useMaskPositions`, `useImageWidth` và `MaskedCard` |
| 16 | `FE/test/diverseTemplates.test.jsx` | **Tạo mới** | Unit test cho 6 formats, `LandingPageRenderer` với Speakers, Pricing, Services, Features |
| 17 | `FE/test/splashScreen.test.jsx` | **Sửa đổi** | Cập nhật kiểm thử thời gian 2000ms, 200ms delay, vị trí bottom-left |
| 18 | `FE/test/homePageNew.test.jsx` | **Sửa đổi** | Cập nhật kiểm thử các section mới trên HomePage với MaskedCards |

### B. Backend (`BE/`)
| STT | Đường dẫn file | Thao tác | Mục đích |
|---|---|---|---|
| 1 | `BE/src/Persistence/Data/DataSeeder.cs` | **Sửa đổi** | Bổ sung Categories mới (`conference`, `app-showcase`, `medical`, `saas`), seed 6 Format Templates hoàn chỉnh và UserCustomizations mẫu |

---

## 3. CHỮ KÝ HÀM, COMPONENT & INTERFACE CẦN CÓ

### 3.1. Frontend Hooks

#### `useMaskPositions(totalCards)`
- **File**: `FE/src/hooks/useMaskPositions.js`
- **Mô tả**: Sử dụng `ResizeObserver` theo dõi container và tính toán offset của từng card con so với container.
```javascript
/**
 * @param {number} totalCards Số lượng card cần tính offset
 * @returns {{
 *   containerRef: React.RefObject<HTMLElement>,
 *   cardRefs: React.MutableRefObject<Array<HTMLElement | null>>,
 *   registerCardRef: (index: number) => (el: HTMLElement | null) => void,
 *   positions: Array<{ x: number, y: number, sw: number, sh: number, width: number, height: number }>,
 *   containerSize: { width: number, height: number }
 * }}
 */
export function useMaskPositions(totalCards = 0) { ... }
```

#### `useImageWidth(sectionHeight, naturalAspectRatio)`
- **File**: `FE/src/hooks/useImageWidth.js`
- **Mô tả**: Tính toán renderWidth của ảnh nền chung theo sectionHeight và aspectRatio.
```javascript
/**
 * @param {number} sectionHeight Chiều cao hiện tại của section container (px)
 * @param {number} [naturalAspectRatio=16/9] Tỷ lệ tự nhiên của ảnh gốc (mặc định 16/9 hoặc 1920/1080)
 * @returns {{
 *   renderWidth: number,
 *   isMobile: boolean,
 *   focalX: number // 0.8 trên desktop, 0.7 trên mobile
 * }}
 */
export function useImageWidth(sectionHeight, naturalAspectRatio = 16 / 9) { ... }
```

### 3.2. Frontend Components

#### `MaskedCard`
- **File**: `FE/src/components/home/MaskedCard.jsx`
- **Props**:
```javascript
/**
 * @param {Object} props
 * @param {string} props.bgImage URL của ảnh nền chung
 * @param {Object} props.position { x: number, y: number, sw: number, sh: number, width: number, height: number }
 * @param {number} props.renderWidth Chiều rộng render của ảnh nền tính từ useImageWidth
 * @param {number} props.renderHeight Chiều cao render của ảnh nền (thường bằng container sh)
 * @param {number} [props.focalX=0.8] Điểm tiêu cự (desktop=0.8, mobile=0.7)
 * @param {string} [props.className='']
 * @param {React.ReactNode} props.children
 * @param {React.CSSProperties} [props.style={}]
 */
export default function MaskedCard({
  bgImage,
  position,
  renderWidth,
  renderHeight,
  focalX = 0.8,
  className = '',
  children,
  style = {},
  ...rest
}) { ... }
```
- **Công thức CSS cốt lõi**:
  - `overflow = Math.max(0, renderWidth - (position.sw || renderWidth))`
  - `focalOffset = overflow * focalX`
  - `backgroundPosition: `-${(position.x || 0) + focalOffset}px -${position.y || 0}px``
  - `backgroundSize: `${renderWidth}px ${renderHeight || position.sh}px``

#### `SplashScreen`
- **File**: `FE/src/components/home/SplashScreen.jsx`
- **Props**:
```javascript
/**
 * @param {Object} props
 * @param {Function} props.onComplete Callback khi đếm xong và kết thúc fade-out
 * @param {number} [props.durationMs=2000] Tổng thời gian đếm từ 0 đến 100% (20ms/bước = 2000ms)
 * @param {number} [props.holdDelayMs=200] Thời gian dừng lại ở 100% trước khi fade-out
 * @param {number} [props.fadeDurationMs=700] Thời gian hiệu ứng mờ dần
 */
export default function SplashScreen({
  onComplete,
  durationMs = 2000,
  holdDelayMs = 200,
  fadeDurationMs = 700,
}) { ... }
```
- **Bố cục**: Góc dưới bên trái `fixed inset-0 z-50 flex items-end justify-start p-8 md:p-16 bg-gray-950 text-white select-none`.
- **Số đếm**: `text-7xl md:text-9xl font-bold tabular-nums tracking-tighter`.

#### Format Sections mới cho `LandingPageRenderer`
- `SpeakersSection({ speakers = [], primaryColor, isHighlighted })`
- `PricingSection({ pricingTickets = [], primaryColor, isHighlighted, onSelectTicket })`
- `ServicesSection({ servicesGrid = [], primaryColor, isHighlighted, onBookService })`
- `FeatureCardsSection({ featureCardsGrid = [], primaryColor, isHighlighted })`

### 3.3. Template Configurations Structure (`FE/src/utils/defaultTemplates.js`)

Mỗi format template được định nghĩa với cấu trúc JSON module hóa:
```javascript
// Format 1: Thiệp Cưới & Đính Hôn Lãng Mạn (Motion Romance)
export const DEFAULT_WEDDING_CONFIG = { ... };

// Format 2: Hội Nghị Công Nghệ & AI (Virtual AI Summit 2026)
export const DEFAULT_AI_SUMMIT_CONFIG = {
  format: 'summit',
  theme: { primaryColor: '#2563eb', secondaryColor: '#3b82f6', backgroundColor: '#090d16', textColor: '#f8fafc', fontFamily: 'Inter' },
  hero: { badge: 'GLOBAL VIRTUAL SUMMIT 2026', title: 'Generative AI & Future Intelligence', subtitle: 'Hội nghị cấp cao quy tụ 50+ chuyên gia AI hàng đầu thế giới', eventDate: '2026-11-20T09:00:00', callToActionText: 'Đặt Vé Ngay' },
  speakers: [
    { id: '1', name: 'Dr. Elena Rostova', role: 'Chief AI Scientist', company: 'DeepNexus Labs', bio: 'Tiên phong trong kiến trúc Large Reasoning Models và Autonomous Agents.', avatarUrl: '...' },
    // ...
  ],
  agenda: [
    { time: '09:00', title: 'Khai mạc & Keynote: The Dawn of System-3 AI', speaker: 'Dr. Elena Rostova', room: 'Main Stage' },
    // ...
  ],
  pricingTickets: [
    { id: 'early-bird', name: 'Standard Pass', price: '1.490.000 đ', originalPrice: '2.500.000 đ', badge: 'EARLY BIRD', perks: ['Truy cập toàn bộ livestream', 'Bộ slide thuyết trình', 'Chứng nhận tham dự NFT'] },
    { id: 'vip-pass', name: 'VIP Executive', price: '4.990.000 đ', badge: 'POPULAR', perks: ['Bao gồm quyền lợi Standard', 'Phòng thảo luận kín với Speakers', 'Tài khoản Pro 1 năm đối tác AI'] },
  ],
  qa: [ ... ],
};

// Format 3: Ứng Dụng Quản Lý Năng Suất (Drift ADHD-Friendly Planner)
export const DEFAULT_DRIFT_PLANNER_CONFIG = {
  format: 'app-showcase',
  theme: { primaryColor: '#10b981', backgroundColor: '#0f172a', textColor: '#f8fafc' },
  hero: { title: 'Drift — Năng Suất Nhẹ Nhàng Dành Riêng Cho Não Bộ ADHD', videoUrl: 'https://cdn.pixabay.com/video/demo-preview.mp4' },
  featureCardsGrid: [
    { id: '1', title: 'Time-Blocking Trực Quan', description: 'Biến những danh sách công việc ngột ngạt thành các dòng sông thời gian êm dịu, không áp lực.' },
    { id: '2', title: 'Âm Thanh Tập Trung Song Nhĩ', description: 'Tần số sóng não 40Hz kích thích dopamin tự nhiên, đưa bạn vào trạng thái deep work trong 3 phút.' },
    { id: '3', title: 'Chia Nhỏ Nhiệm Vụ Tự Động', description: 'AI tự động rã một dự án khó thành các bước 5 phút dễ như ăn kẹo.' },
  ],
  metrics: [ { value: '50K+', label: 'Người dùng ADHD phục hồi năng lượng' }, { value: '4.9/5', label: 'Đánh giá trên App Store' } ],
};

// Format 4: Phòng Khám Nha Khoa Cao Cấp (SmileCraft Dental Clinic)
export const DEFAULT_DENTAL_CLINIC_CONFIG = {
  format: 'dental-services',
  theme: { primaryColor: '#0ea5e9', backgroundColor: '#ffffff', textColor: '#0f172a' },
  hero: { title: 'Kiến Tạo Nụ Cười Hoàn Hảo & Tự Tin', subtitle: 'Phòng khám chuẩn Châu Âu với công nghệ Scan 3D không xâm lấn' },
  servicesGrid: [
    { id: 'veneers', name: 'Veneers Sứ Siêu Mỏng', description: 'Bảo tồn 100% răng thật, độ trong bóng tự nhiên như ngọc trai.', priceFrom: '6.000.000 đ/răng' },
    { id: 'crowns', name: 'Bọc Răng Sứ Thẩm Mỹ', description: 'Khắc phục hoàn toàn răng thưa, ố vàng nặng, chịu lực gấp 5 lần răng thật.', priceFrom: '4.500.000 đ/răng' },
    { id: 'whitening', name: 'Tẩy Trắng Laser Extra-White', description: 'Nâng 3-5 tone ngay sau 45 phút, an toàn tuyệt đối cho men răng.', priceFrom: '2.500.000 đ' },
    { id: 'implants', name: 'Cấy Ghép Implant Kỹ Thuật Số', description: 'Trồng răng trọn gói, tích hợp xương sinh học vĩnh viễn không đau.', priceFrom: '15.000.000 đ/trụ' },
  ],
  treatmentProcess: [
    { step: '01', title: 'Thăm khám & Chụp CT 3D ConeBeam', desc: 'Đánh giá chính xác cấu trúc hàm mặt và viền nướu' },
    { step: '02', title: 'Mô phỏng Nụ Cười DSD (Digital Smile)', desc: 'Xem trước kết quả thẩm mỹ trên màn hình trước khi làm' },
    { step: '03', title: 'Điều trị nhẹ nhàng & Không đau', desc: 'Bác sĩ chuyên khoa 15 năm kinh nghiệm thực hiện' },
    { step: '04', title: 'Bảo hành & Chăm sóc trọn đời', desc: 'Thẻ bảo hành điện tử chính hãng toàn cầu' },
  ],
  booking: { enabled: true, title: 'Đặt Lịch Hẹn Tư Vấn Miễn Phí' },
};

// Format 5: Nền Tảng Công Nghệ SaaS (CloudFlow Modern SaaS)
export const DEFAULT_MODERN_SAAS_CONFIG = {
  format: 'saas',
  theme: { primaryColor: '#6366f1', backgroundColor: '#0b0f19', textColor: '#f8fafc' },
  hero: { title: 'Nền Tảng Tự Động Hóa Dòng Chảy Dữ Liệu Doanh Nghiệp', subtitle: 'Kết nối mọi API, xử lý 10 triệu events/giây với độ trễ dưới 5ms' },
  featureCardsGrid: [
    { title: 'API-First Architecture', desc: 'Tích hợp mượt mà với GraphQL, REST và Webhooks bảo mật cao.' },
    { title: 'Realtime Stream Engine', desc: 'Phân tích dữ liệu theo thời gian thực không độ trễ.' },
    { title: 'Multi-Tenant Security', desc: 'Mã hóa AES-256 từ đầu cuối đến cơ sở dữ liệu.' },
    { title: 'Automated CI/CD Workflows', desc: 'Tự động triển khai và roll-back chỉ với 1 cú click chuột.' },
    { title: 'Global Edge Network', desc: 'Mạng lưới máy chủ phân tán 320 điểm trên toàn thế giới.' },
    { title: 'Smart Cost Optimization', desc: 'Tự động mở rộng và thu nhỏ tài nguyên, tiết kiệm tới 40% chi phí đám mây.' },
  ],
  pricingPackages: [ ... ],
};

// Format 6: Tiệc Sinh Nhật & Sự Kiện Trẻ Em (WonderKids Party Celebration)
export const DEFAULT_KIDS_PARTY_CONFIG = {
  format: 'kids-birthday',
  theme: { primaryColor: '#ec4899', secondaryColor: '#f59e0b', backgroundColor: '#fffbeb', textColor: '#1e293b', particlesEffect: 'confetti' },
  hero: { badge: 'WONDERLAND BIRTHDAY 5TH', title: 'Sinh Nhật Xứ Sở Thần Tiên Của Bé Mia', subtitle: 'Cùng hòa mình vào bữa tiệc sắc màu, bong bóng khổng lồ và ảo thuật kỳ thú!' },
  partyGames: [
    { time: '16:00', title: 'Đón bé & Vẽ mặt hóa trang nghệ thuật' },
    { time: '17:00', title: 'Show diễn Ảo thuật & Chú hề bóng bay' },
    { time: '18:00', title: 'Đập kẹo Piñata khổng lồ & Nhận quà' },
    { time: '18:30', title: 'Thổi nến bánh kem lâu đài 3 tầng' },
  ],
  wishlist: [
    { title: 'Bộ xếp hình Lego Disney Castle', link: '#' },
    { title: 'Hộp màu nước sáng tạo Pastel', link: '#' },
  ],
};
```

---

## 4. CÁC TRƯỜNG HỢP BIÊN BẮT BUỘC PHẢI XỬ LÝ (EDGE CASES)

1. **Môi trường không có `ResizeObserver` hoặc SSR/JSDOM Test**:
   - Trong `useMaskPositions`, nếu `window.ResizeObserver` không tồn tại, tự động fallback trả về default layout coordinates `{ x: 0, y: 0, sw: 1200, sh: 800, width: 300, height: 200 }` để test Vitest và môi trường không hỗ trợ không bao giờ bị crash.
2. **`overflow` âm hoặc `renderWidth < containerWidth`**:
   - `overflow = Math.max(0, renderWidth - position.sw)`. Đảm bảo `focalOffset` không bao giờ tạo giá trị âm khiến ảnh bị thụt lùi hở viền trắng.
3. **Chuyển đổi Viewport giữa Mobile (<768px) và Desktop (>=768px)**:
   - `focalX` tự động chuyển đổi: Desktop dùng `0.8` (tập trung trọng tâm ảnh phía bên phải), Mobile dùng `0.7` (cân đối vừa vặn khung dọc).
4. **Left Column STICKY trên Mobile**:
   - Trên màn hình nhỏ (`< 1024px`), không dùng sticky toàn màn hình vì sẽ chặn cuộn của người dùng. Chỉ dùng `lg:sticky lg:top-0 lg:h-screen`. Trên mobile, chuyển thành layout stack dọc tự nhiên.
5. **SplashScreen an toàn tuyệt đối**:
   - Luôn có safety timeout `fallbackTimer` ở 3000ms phòng trường hợp tab bị ẩn làm requestAnimationFrame bị pause bởi trình duyệt.
   - Bấm Esc hoặc click không chặn người dùng nếu muốn bỏ qua.
   - Sử dụng `sessionStorage.getItem('splash_shown')` để chỉ hiển thị 1 lần trong phiên duyệt web.
6. **Hamburger Animation Smooth X-Morph**:
   - 3 thẻ `<span>` tuyệt đối với timing function chuẩn `cubic-bezier(0.76, 0, 0.24, 1)`:
     - Span 1: `translate-y-2 rotate-45` khi mở.
     - Span 2: `opacity-0 scale-x-0` khi mở.
     - Span 3: `-translate-y-2 -rotate-45` khi mở.
7. **Khả năng tương thích ngược (Backward Compatibility) của Template**:
   - Các template thiệp cưới cũ không có trường `speakers`, `pricingTickets`, `servicesGrid`, `featureCardsGrid` -> `LandingPageRenderer` và `CustomizerSidebar` dùng toán tử Optional Chaining `?.` và kiểm tra mảng rỗng, không render phần thừa và không gây lỗi crash runtime.
8. **Định dạng tiền tệ đa năng**:
   - Hỗ trợ cả chuỗi giá có sẵn (ví dụ `"4.990.000 đ"` hoặc `"$199"`) và số nguyên nguyên bản.

---

## 5. QUY ƯỚC CẦN BÁM THEO (THEO `coder.md`)

- **Backend**:
  - Tuân thủ Clean Architecture theo `BE/src/`: Domain (Entities/ValueObjects) không phụ thuộc lớp ngoài, Application (Commands/Queries/Handlers), Persistence (`DataSeeder.cs`, DbContext).
  - Không hard-code chuỗi connection; lưu ID thực thể bằng `Guid.NewGuid()` hoặc ID cấu trúc có sẵn; `DateTime.UtcNow` thống nhất.
  - Quy ước tham chiếu: `PromtAI/.gemini/agents/coder.md` (Mục A1 đến A8).
- **Frontend**:
  - React 19 + Tailwind CSS + Lucide Icons + Vite.
  - Tên file Component dùng `PascalCase.jsx`, Hooks dùng `camelCase.js` tiền tố `use`, Utils dùng `camelCase.js`.
  - Không gọi trực tiếp API trong Presentation Component nếu đã có `api/` layer.
  - Giữ lại toàn bộ comments docstrings và logic sẵn có.
  - Viết test với `vitest` và `@testing-library/react` theo chuẩn Given-When-Then, bao phủ cả Happy Paths và Edge Cases.
  - Quy ước tham chiếu: `PromtAI/.gemini/agents/coder.md` (Mục B1 đến B4).
