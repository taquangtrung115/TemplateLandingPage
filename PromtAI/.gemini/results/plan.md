# BẢN KẾ HOẠCH TRIỂN KHAI: NÂNG CẤP TRANG CUSTOMIZER VÀ RENDERER

## 1. CÂU HỎI CÒN BỎ NGỎ
Không có.

---

## 2. DANH SÁCH FILE CẦN TẠO MỚI HOẶC CẦN SỬA

### A. Backend (.NET Clean Architecture)
1. `BE/src/Presentation/APIs/Customizations/CustomizationApi.cs` (SỬA)
   - Bỏ `.RequireAuthorization()` khỏi endpoint `group.MapPut("{id:guid}", ...)` để cho phép khách vãng lai (Guest) cập nhật các customization do chính họ tạo (các bản ghi có `UserId == null`).
2. `BE/src/Application/UseCases/V1/Customizations/Commands/UpdateCustomizationCommandHandler.cs` (SỬA)
   - Điều chỉnh logic kiểm tra quyền sở hữu:
     - Nếu `customization.UserId.HasValue` (thiệp thuộc về User đã đăng ký): Bắt buộc `request.CurrentUserRole == "Admin"` hoặc `(request.CurrentUserId.HasValue && request.CurrentUserId.Value == customization.UserId.Value)`. Nếu không khớp thì trả về `Result.Failure(CustomizationErrors.Unauthorized)`.
     - Nếu `customization.UserId == null` (thiệp do khách vãng lai Guest tạo): Cho phép cập nhật mà không bắt buộc quyền đăng nhập.
3. `BE/test/UnitTests/Application/Customizations/UpdateCustomizationCommandHandlerTests.cs` (TẠO MỚI / BỔ SUNG)
   - Thêm unit tests kiểm tra: Guest cập nhật customization `UserId == null` thành công; Guest hoặc user khác cập nhật customization có `UserId` của người khác bị chặn Unauthorized; Chủ sở hữu hoặc Admin cập nhật thành công.

### B. Frontend (React 19 + Tailwind CSS + Vite)
1. `FE/src/routes/index.jsx` (SỬA)
   - Bỏ component `<ProtectedRoute>` bọc quanh hai tuyến đường:
     - `/customize/:templateId`
     - `/customize/:templateId/:customizationId`
   - Đảm bảo bất kỳ ai (kể cả Guest chưa đăng nhập) đều truy cập được trang Customizer.
2. `FE/src/utils/animationConstants.js` (TẠO MỚI)
   - Định nghĩa danh sách các kiểu animation: `none`, `fade-up`, `fade-down`, `fade-left`, `fade-right`, `zoom-in`, `zoom-out`, `flip-up`, `bounce`, `float`, `pulse`.
   - Định nghĩa mapping class CSS và helper lấy class tương ứng cho từng hiệu ứng.
3. `FE/src/index.css` (SỬA)
   - Bổ sung các animation keyframes và CSS utility classes: `.animate-fade-up`, `.animate-fade-down`, `.animate-fade-left`, `.animate-fade-right`, `.animate-zoom-in`, `.animate-zoom-out`, `.animate-flip-up`, `.animate-bounce-subtle`, `.animate-float-slow`, `.animate-pulse-glow`, và trạng thái ban đầu (`.reveal-init`, `.revealed`).
4. `FE/src/components/common/ScrollReveal.jsx` (TẠO MỚI)
   - Component bọc animation dựa trên `IntersectionObserver` kích hoạt hiệu ứng khi phần tử cuộn vào khung nhìn (scroll-triggered). Hỗ trợ `animation`, `delay`, `duration`, `threshold`, `className`.
5. `FE/src/components/customizer/AnimationSelector.jsx` (TẠO MỚI)
   - Component UI dropdown dùng chung trong sidebar để chọn hiệu ứng animation trực quan cho từng section và từng object.
6. `FE/src/components/customizer/CustomizerSidebar.jsx` (SỬA)
   - Mở rộng toàn bộ các trường cấu hình theo schema chuẩn:
     + `theme`: thêm `accentColor`, `textColor`, `stylePreset`, `defaultAnimation`.
     + `hero`: thêm `animation`.
     + `coupleOrCelebrant`: quản lý danh sách Dynamic Persons (`person1`, `person2`, `person3`, ...). Cho phép bấm "+ Thêm nhân vật / Người đại diện", sửa tên, danh xưng, avatar, bio, bố mẹ, và `animation` cho từng person. Cho phép xóa person bất kỳ (giữ tối thiểu 1). Thêm trường `animation` cho section.
     + `eventDetails`: thêm `mapEmbedUrl` và `animation`.
     + `timeline`: thêm `animation` cho từng item và section.
     + `gallery`: thêm `animation` cho từng ảnh và section.
     + `rsvp`: thêm `allowPlusOnes` (toggle) và `animation`.
     + `music`: thêm `autoPlay` (toggle).
     + `wishes`: thêm `animation`.
     + Tab mới `extraSections`: Quản lý danh sách các section mở rộng (Lời cảm ơn, Quà mừng QR, Q&A, Custom text). Cho phép thêm section, toggle bật/tắt, sửa nội dung, chọn animation, và xóa.
7. `FE/src/components/templates/LandingPageRenderer.jsx` (SỬA)
   - Layout dàn trang cực kỳ động theo số lượng nhân vật:
     + 1 người: Căn giữa sang trọng (`max-w-md mx-auto grid grid-cols-1`).
     + 2 người: Hai bên cân đối (`max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8`).
     + 3 người: Ba cột (`max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6`).
     + 4+ người: Grid linh hoạt responsive (`max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`).
   - Tích hợp `ScrollReveal` vào từng object và section (Hero, Person Card, Event Details, Timeline Item, Gallery Image, RSVP, Wishes, Extra Sections).
   - Render các `extraSections` (Lời cảm ơn, Quà cưới QR với thông tin STK & QR code VietQR, Q&A accordion, Custom block).
8. `FE/src/pages/CustomizerPage.jsx` (SỬA)
   - Cập nhật logic lưu dành cho khách vãng lai:
     + Khi chưa đăng nhập (`!user`), vẫn gọi `customizationApi.saveCustomization` (backend lưu `userId = null`).
     + Lưu backup vào `localStorage` (`guest_customizations`) để tránh mất dữ liệu khi đóng tab.
     + Thông báo lưu thành công rõ ràng, hướng dẫn xuất HTML hoặc JSON offline.
9. `FE/src/utils/defaultTemplates.js` (SỬA)
   - Bổ sung cấu trúc đầy đủ các trường mới (`accentColor`, `textColor`, `stylePreset`, `defaultAnimation`, `animation` cho từng object, `allowPlusOnes`, `autoPlay`, `extraSections` mẫu) vào `DEFAULT_WEDDING_CONFIG` và `DEFAULT_BIRTHDAY_CONFIG`.
10. `FE/src/utils/htmlExporter.js` (SỬA)
    - Cập nhật hàm xuất HTML độc lập:
      + Render động danh sách persons (1, 2, 3, 4+ người).
      + Render các `extraSections`.
      + Nhúng CSS keyframes cho toàn bộ animation engine và đoạn JavaScript `IntersectionObserver` tự động kích hoạt animation khi cuộn trang offline.
11. `FE/test/customizerDynamic.test.jsx` (TẠO MỚI)
    - Unit tests cho helper xử lý persons, animation constants, và khả năng render động không bị lỗi runtime.

---

## 3. CHỮ KÝ HÀM HOẶC INTERFACE CẦN CÓ

### A. Backend Interface & Command Handlers
```csharp
// BE/src/Contract/Services/V1/Customizations/Command.cs
public record UpdateCustomizationCommand(
    Guid Id,
    string Title,
    string Slug,
    string ConfigJson,
    bool IsPublished,
    Guid? CurrentUserId,
    string CurrentUserRole) : ICommand;

// BE/src/Application/UseCases/V1/Customizations/Commands/UpdateCustomizationCommandHandler.cs
public sealed class UpdateCustomizationCommandHandler : ICommandHandler<UpdateCustomizationCommand>
{
    public async Task<Result> Handle(UpdateCustomizationCommand request, CancellationToken cancellationToken);
}
```
**Logic kiểm tra quyền trong Handler:**
```csharp
if (request.CurrentUserRole != "Admin")
{
    // Nếu thiệp thuộc về một user xác định mà request không phải user đó -> chặn
    if (customization.UserId.HasValue)
    {
        if (!request.CurrentUserId.HasValue || customization.UserId.Value != request.CurrentUserId.Value)
        {
            return Result.Failure(CustomizationErrors.Unauthorized);
        }
    }
    // Nếu customization.UserId == null: Cho phép Guest cập nhật tự do
}
```

---

### B. Frontend Schema, Constants & Components

#### 1. Cấu trúc JSON Schema hoàn chỉnh
```typescript
interface TemplateConfig {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string; // 'Playfair Display' | 'Cinzel' | 'Montserrat' | 'Great Vibes'
    stylePreset: string; // 'romantic' | 'luxury' | 'minimal' | 'modern'
    particlesEffect: string; // 'petals' | 'confetti' | 'none'
    defaultAnimation: string; // 'fade-up' | 'zoom-in' ...
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    eventDate: string;
    coverImageUrl: string;
    callToActionText: string;
    animation: string;
  };
  coupleOrCelebrant: {
    type: 'wedding' | 'birthday' | 'event';
    // Hỗ trợ dynamic persons: person1, person2, person3... hoặc persons array
    [key: `person${number}`]: {
      name: string;
      title: string;
      avatarUrl: string;
      bio: string;
      parents: string;
      animation: string;
    };
    storyQuote: string;
    animation: string;
  };
  eventDetails: {
    ceremonyName: string;
    time: string;
    venueName: string;
    address: string;
    mapEmbedUrl?: string;
    mapDirectLink?: string;
    dressCode?: string;
    animation: string;
  };
  timeline: Array<{
    id: string;
    time: string;
    title: string;
    description: string;
    icon: string;
    animation: string;
  }>;
  gallery: Array<{
    id: string;
    url: string;
    caption: string;
    animation: string;
  }>;
  rsvp: {
    enabled: boolean;
    deadline: string;
    note: string;
    allowDietaryNotes: boolean;
    allowPlusOnes: boolean;
    animation: string;
  };
  music: {
    enabled: boolean;
    audioUrl: string;
    title: string;
    autoPlay: boolean;
  };
  wishes: {
    enabled: boolean;
    title: string;
    subtitle: string;
    animation: string;
  };
  extraSections?: Array<{
    id: string;
    type: 'thankYou' | 'giftQr' | 'qa' | 'custom';
    enabled: boolean;
    title: string;
    subtitle?: string;
    content?: string;
    imageUrl?: string;
    qrBank?: {
      bankName: string;
      accountNumber: string;
      accountHolder: string;
      qrImageUrl?: string;
    };
    items?: Array<{ question: string; answer: string }>;
    animation: string;
  }>;
}
```

#### 2. Animation Constants & Helper (`FE/src/utils/animationConstants.js`)
```javascript
export const ANIMATION_OPTIONS = [
  { value: 'none', label: 'Không hiệu ứng (None)' },
  { value: 'fade-up', label: 'Mờ dần từ dưới lên (Fade Up)' },
  { value: 'fade-down', label: 'Mờ dần từ trên xuống (Fade Down)' },
  { value: 'fade-left', label: 'Mờ dần từ trái sang (Fade Left)' },
  { value: 'fade-right', label: 'Mờ dần từ phải sang (Fade Right)' },
  { value: 'zoom-in', label: 'Phóng to xuất hiện (Zoom In)' },
  { value: 'zoom-out', label: 'Thu nhỏ xuất hiện (Zoom Out)' },
  { value: 'flip-up', label: 'Lật 3D từ dưới lên (Flip Up)' },
  { value: 'bounce', label: 'Nảy vui nhộn (Bounce)' },
  { value: 'float', label: 'Bồng bềnh lơ lửng (Float)' },
  { value: 'pulse', label: 'Nhịp đập phát sáng (Pulse)' },
];

export const getAnimationClass = (animationType, isVisible) => { ... };
```

#### 3. Component `ScrollReveal` (`FE/src/components/common/ScrollReveal.jsx`)
```javascript
export const ScrollReveal = ({
  animation = 'fade-up',
  delay = 0,
  duration = 700,
  className = '',
  children,
  style = {},
}) => { ... };
```

#### 4. Component `AnimationSelector` (`FE/src/components/customizer/AnimationSelector.jsx`)
```javascript
export const AnimationSelector = ({
  label = 'Hiệu ứng xuất hiện',
  value = 'fade-up',
  onChange,
  className = '',
}) => { ... };
```

#### 5. Dynamic Persons Helpers
```javascript
// Trích xuất danh sách nhân vật từ coupleOrCelebrant
export const extractPersonsList = (coupleOrCelebrant = {}) => {
  // Quét các key có dạng person1, person2, person3... sắp xếp theo index
  const keys = Object.keys(coupleOrCelebrant)
    .filter(k => /^person\d+$/.test(k))
    .sort((a, b) => parseInt(a.replace('person', ''), 10) - parseInt(b.replace('person', ''), 10));
  
  if (keys.length === 0) {
    return [{ key: 'person1', name: 'Nhân vật chính', title: 'Chủ Tiệc', avatarUrl: '', bio: '', parents: '', animation: 'fade-up' }];
  }
  return keys.map(key => ({ key, ...coupleOrCelebrant[key] }));
};

// Thêm nhân vật mới: tự sinh key person tiếp theo (ví dụ: person3, person4...)
export const addPersonHelper = (currentConfig) => { ... };

// Xóa nhân vật: xóa key chỉ định và re-index các key còn lại (person1, person2...) để giữ tính liên tục
export const removePersonHelper = (currentConfig, personKey) => { ... };
```

---

## 4. CÁC TRƯỜNG HỢP BIÊN BẮT BUỘC PHẢI XỬ LÝ (EDGE CASES)

1. **Số lượng nhân vật tối thiểu**:
   - Khi chỉ còn duy nhất 1 person (`person1`), nút Xóa nhân vật phải bị vô hiệu hóa (`disabled`) để đảm bảo landing page luôn có ít nhất 1 nhân vật đại diện.
2. **Re-indexing danh sách person khi xóa giữa chừng**:
   - Nếu có 4 person (`person1`, `person2`, `person3`, `person4`) và người dùng xóa `person2`, hàm helper phải tự động sắp xếp lại thành `person1`, `person2`, `person3` mới, tránh tình trạng bị khuyết index gây lỗi render hoặc sót dữ liệu.
3. **Khách vãng lai (Guest) thao tác liên tục mà không có Token**:
   - Lần 1: Bấm Lưu -> Gửi `POST /api/v1/customizations` với `UserId = null` -> Server trả về Guid mới -> Client chuyển route sang `/customize/:templateId/:newId`.
   - Lần 2: Sửa tiếp và bấm Lưu -> Gửi `PUT /api/v1/customizations/:newId` -> Nhờ backend bỏ `.RequireAuthorization()` và Handler chấp nhận `customization.UserId == null`, request được thực thi mượt mà không bị lỗi 401.
   - Trường hợp mất kết nối mạng: Frontend lưu bản nháp vào `localStorage.setItem('guest_draft_' + templateId, ...)` kèm thông báo để khách hàng không bị mất công sức chỉnh sửa.
4. **Hiệu ứng Scroll Animation bên trong Preview Container**:
   - Trong Customizer, vùng preview là một container có `overflow-y-auto` (không phải `window` scroll toàn trang). `ScrollReveal` phải sử dụng `IntersectionObserver` linh hoạt với tùy chọn fallback tự động hiển thị sau 300ms nếu observer không kích hoạt trong chế độ preview, đảm bảo trải nghiệm trực quan không bị giật hay mất chữ.
5. **Dữ liệu cấu hình cũ (Legacy Config Compatibility)**:
   - Các template hoặc customization cũ chưa có các field mới (`accentColor`, `textColor`, `stylePreset`, `extraSections`, `animation` trong từng item): Tất cả các component đều phải sử dụng toán tử fallback an toàn (`config?.theme?.primaryColor || '#e11d48'`, `item.animation || 'fade-up'`), tuyệt đối không được gây lỗi trắng trang (`undefined reading property`).
6. **Mã độc XSS khi render Standalone HTML hoặc Q&A Content**:
   - Khi nhúng config vào file standalone HTML (`exportStandaloneHtml`), toàn bộ JSON phải được escape chuỗi chuẩn (`replace(/</g, '\\u003c')`).
7. **Trường hợp URL QR Ngân hàng (VietQR)**:
   - Nếu người dùng nhập thông tin ngân hàng và số tài khoản, hệ thống tự động sinh link ảnh VietQR chuẩn: `https://img.vietqr.io/image/{bankId}-{accountNumber}-compact2.jpg?accountName={accountHolder}&amount=0`. Nếu có ảnh QR tải lên riêng thì ưu tiên dùng ảnh người dùng cung cấp.

---

## 5. QUY ƯỚC CẦN BÁM THEO (KÈM TÊN FILE)

Tất cả các thay đổi phải tuân thủ nghiêm ngặt các quy tắc đã được định nghĩa trong:
`PromtAI/.gemini/agents/coder.md`

Cụ thể:
1. **Phần A --- Quy chuẩn Backend (.NET Clean Architecture + CQRS + MediatR)**:
   - Command và Query định nghĩa trong project Contract (`TemplateLandingPage.Contract/Services/V1/Customizations`).
   - Handler nằm trong Application (`TemplateLandingPage.Application/UseCases/V1/Customizations/Commands`).
   - Presentation API dùng Minimal API (`TemplateLandingPage.Presentation/APIs/Customizations/CustomizationApi.cs`).
   - Luôn trả về `Result` hoặc `Result<T>`, không ném exception cho các lỗi nghiệp vụ hoặc phân quyền.
2. **Phần B --- Quy chuẩn Frontend (React 19 + Tailwind CSS + Lucide Icons + Vite)**:
   - Toàn bộ gọi API phải thông qua file trong thư mục `src/api/` (cụ thể `customizationApi.js`), không dùng axios trực tiếp trong component.
   - Đặt tên file component theo `PascalCase.jsx` (`ScrollReveal.jsx`, `AnimationSelector.jsx`).
   - Đặt tên file util/helper theo `camelCase.js` (`animationConstants.js`).
   - Trạng thái loading, saving, error phải được quản lý chặt chẽ để tránh double-submit và treo giao diện.
   - Tuân thủ palette màu và kiểu dáng thiết kế hiện đại của hệ thống (Tailwind classes, Lucide icons, bo góc tròn 2xl/3xl, backdrop blur).
3. **Phần C --- Nguyên tắc chung & Build sạch**:
   - Không để lại code chết (`console.log`, comment cũ không cần thiết).
   - Frontend chạy sạch `npm run build` và `npm run test`.
   - Backend `dotnet build` sạch và các unit tests pass 100%.
