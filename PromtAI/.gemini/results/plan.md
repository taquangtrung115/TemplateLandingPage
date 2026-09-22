# KẾ HOẠCH TRIỂN KHAI: NÂNG CẤP TOÀN DIỆN NỀN TẢNG TEMPLATE LANDING PAGE

---

## 1. CÂU HỎI CÒN BỎ NGỎ
**Không có câu hỏi bỏ ngỏ.**  
Toàn bộ 9 yêu cầu đã được phân tích thấu đáo, cấu trúc dữ liệu và giải pháp kỹ thuật trên cả Backend (.NET 10, Clean Architecture, EF Core, PostgreSQL) và Frontend (React 19, Tailwind CSS, Vite) đã được xác định cụ thể, nhất quán và sẵn sàng để triển khai.

---

## 2. DANH SÁCH CÁC FILE CẦN TẠO MỚI VÀ CẦN SỬA

### A. Backend (.NET 10 Clean Architecture)
1. `c:\Source\TemplateLandingPage\BE\src\Domain\Entities\Template.cs` (Sửa): Bổ sung các thuộc tính `IsCommunity` (bool), `AuthorName` (string?), `CreatedByUserId` (Guid?) và phương thức factory tạo mẫu cộng đồng.
2. `c:\Source\TemplateLandingPage\BE\src\Persistence\Configurations\TemplateConfiguration.cs` (Sửa): Cấu hình Fluent API cho `IsCommunity`, `AuthorName`, `CreatedByUserId`.
3. `c:\Source\TemplateLandingPage\BE\src\Domain\Repositories\ITemplateRepository.cs` (Sửa): Cập nhật chữ ký hàm `GetListAsync` thêm tham số lọc `bool? isCommunity = null`.
4. `c:\Source\TemplateLandingPage\BE\src\Persistence\Repositories\TemplateRepository.cs` (Sửa): Triển khai điều kiện lọc `isCommunity` trong `GetListAsync`.
5. `c:\Source\TemplateLandingPage\BE\src\Contract\Services\V1\Templates\Command.cs` (Sửa): Bổ sung record `CreateCommunityTemplateCommand`.
6. `c:\Source\TemplateLandingPage\BE\src\Contract\Services\V1\Templates\Query.cs` (Sửa): Bổ sung thuộc tính `bool? IsCommunity = null` vào `GetTemplatesQuery`.
7. `c:\Source\TemplateLandingPage\BE\src\Contract\Services\V1\Templates\Response.cs` (Sửa): Bổ sung `bool IsCommunity, string? AuthorName` vào `TemplateResponse`.
8. `c:\Source\TemplateLandingPage\BE\src\Application\UseCases\V1\Templates\Commands\CreateCommunityTemplateCommandHandler.cs` (Tạo mới): Handler xử lý lưu mẫu thiết kế do người dùng công khai lên kho chung.
9. `c:\Source\TemplateLandingPage\BE\src\Application\UseCases\V1\Templates\Validators\CreateCommunityTemplateCommandValidator.cs` (Tạo mới): Validator kiểm tra hợp lệ tên, slug, configJson.
10. `c:\Source\TemplateLandingPage\BE\src\Application\UseCases\V1\Templates\Queries\GetTemplatesQueryHandler.cs` (Sửa): Ánh xạ thêm trường `IsCommunity` và `AuthorName` vào `TemplateResponse`.
11. `c:\Source\TemplateLandingPage\BE\src\Presentation\APIs\Templates\TemplateApi.cs` (Sửa): Bổ sung endpoint `POST /api/v1/templates/community` (AllowAnonymous) và query param `isCommunity` trong `GET /api/v1/templates`.
12. `c:\Source\TemplateLandingPage\BE\src\Persistence\Data\DataSeeder.cs` (Sửa): Seed thêm 4 danh mục (`spa-beauty`, `podcast-music`, `tech-startup`, `photography`) và 4 Template tương ứng với dữ liệu mẫu hoàn chỉnh.

### B. Frontend (React 19, Tailwind CSS, Vite)
13. `c:\Source\TemplateLandingPage\FE\vercel.json` (Tạo mới): Cấu hình rewrites `/(.*)` về `/index.html` khắc phục triệt để lỗi F5 404 trên Vercel.
14. `c:\Source\TemplateLandingPage\FE\src\components\common\DeviceSimulator.jsx` (Tạo mới): Khung mô phỏng thiết bị thực tế chuyển đổi iOS vs Android (iPhone 15 Pro Max, 15/14, SE, iPad, Galaxy S24 Ultra, Pixel 8 Pro, Galaxy Z Fold, Xiaomi 14) kèm bezel, dynamic island, punch hole, status bar và auto-fit zoom scale.
15. `c:\Source\TemplateLandingPage\FE\src\utils\colorPalettes.js` (Tạo mới): Danh mục 10 Color Palettes chuẩn chuyên nghiệp kèm hàm áp dụng 1-click vào theme config.
16. `c:\Source\TemplateLandingPage\FE\src\utils\animationConstants.js` (Sửa): Bổ sung nhóm hiệu ứng Entrance (`bounce`, `flip-up`, `flip-down`, `roll-in`, `slide-up`), Continuous (`float`, `pulse`, `shimmer`, `wiggle`, `heartbeat`) và Particles (`petals`, `confetti`, `sparkles`, `snow`, `bubbles`, `fireflies`, `cyber-grid`).
17. `c:\Source\TemplateLandingPage\FE\src\components\templates\MotionParticles.jsx` (Sửa): Nâng cấp Canvas render hiệu ứng hạt mới: `sparkles`, `snow`, `bubbles`, `fireflies`, `cyber-grid`.
18. `c:\Source\TemplateLandingPage\FE\src\components\customizer\AnimationSelector.jsx` (Sửa): Phân nhóm hiệu ứng trực quan (Xuất hiện / Chuyển động liên tục / Hạt bay) kèm icon động.
19. `c:\Source\TemplateLandingPage\FE\src\components\templates\sections\HierarchicalCardsSection.jsx` (Tạo mới): Component trình tạo và hiển thị cấu trúc thẻ lồng nhau động (Card -> Header Card -> Sub Header -> Content -> Sub Cards).
20. `c:\Source\TemplateLandingPage\FE\src\components\templates\LandingPageRenderer.jsx` (Sửa): Tích hợp render `HierarchicalCardsSection` khi `config.hierarchicalCards` có dữ liệu.
21. `c:\Source\TemplateLandingPage\FE\src\utils\defaultTemplates.js` (Sửa): Bổ sung 4 template config (`DEFAULT_SPA_BEAUTY_CONFIG`, `DEFAULT_PODCAST_MUSIC_CONFIG`, `DEFAULT_TECH_STARTUP_CONFIG`, `DEFAULT_PHOTOGRAPHY_CONFIG`) và hỗ trợ danh mục mới trong `getDefaultConfigByCategory`.
22. `c:\Source\TemplateLandingPage\FE\src\components\customizer\CustomizerSidebar.jsx` (Sửa):
    - Thêm Tab mới "Khối Thẻ Động (Card Builder)" cho phép tạo thẻ lồng nhau (Add Card, Add Header Card, Add Sub Header, Add Content, Style Preset).
    - Thêm Bộ chọn 1-click Color Palettes trong Tab Theme.
    - Cập nhật danh mục hạt particles trong Tab Theme.
23. `c:\Source\TemplateLandingPage\FE\src\components\customizer\CustomizerToolbar.jsx` (Sửa): Tối ưu giao diện thu gọn trên mobile, thêm nút "Chia Sẻ Mẫu Cộng Đồng (Public Template)".
24. `c:\Source\TemplateLandingPage\FE\src\pages\CustomizerPage.jsx` (Sửa): Tối ưu responsive trên màn hình điện thoại (Bottom Bar chuyển đổi Chỉnh sửa vs Xem trước), tích hợp `DeviceSimulator` cho viewport mobile.
25. `c:\Source\TemplateLandingPage\FE\src\components\templates\QuickPreviewModal.jsx` (Sửa): Tích hợp `DeviceSimulator` cho phép chọn OS và thiết bị thực tế khi xem trước ở Home và Preview.
26. `c:\Source\TemplateLandingPage\FE\src\components\common\QrCodeModal.jsx` (Tạo mới): Modal hiển thị mã QR Code cho link trang thiệp kèm nút tải ảnh QR về máy.
27. `c:\Source\TemplateLandingPage\FE\src\pages\PublicLandingPage.jsx` (Tạo mới): Route độc lập sạch sẽ cho `/p/:slug` và `/live/:slug` với Footer Watermark / Web License cố định và thanh công cụ Chia sẻ, Sao chép link, Mã QR.
28. `c:\Source\TemplateLandingPage\FE\src\routes\index.jsx` (Sửa): Bổ sung các Route `/p/:slug` và `/live/:slug`.
29. `c:\Source\TemplateLandingPage\FE\src\api\templateApi.js` (Sửa): Thêm hàm `publishCommunityTemplate(data)` và hỗ trợ query param `isCommunity`.
30. `c:\Source\TemplateLandingPage\FE\src\pages\TemplatesPage.jsx` (Sửa): Thêm Tabs lọc "Tất cả mẫu", "Mẫu hệ thống (Official)", "Cộng đồng đóng góp (Community)" kèm huy hiệu tác giả.
31. `c:\Source\TemplateLandingPage\FE\tailwind.config.js` (Sửa): Thêm keyframes và utility classes cho các hiệu ứng `shimmer`, `wiggle`, `heartbeat`, `float-slow`.

---

## 3. CHỮ KÝ HÀM / INTERFACE / DATA STRUCTURE / PACKAGE NUGET

### A. Backend (.NET 10)
- **NuGet Packages**: Sử dụng các package hiện có trong dự án (`Microsoft.EntityFrameworkCore`, `Npgsql.EntityFrameworkCore.PostgreSQL`, `MediatR`, `FluentValidation`). Không cần cài thêm thư viện lạ ngoài.

- **Entity `Template.cs`**:
  ```csharp
  public bool IsCommunity { get; private set; }
  public string? AuthorName { get; private set; }
  public Guid? CreatedByUserId { get; private set; }

  public static Template CreateCommunity(
      string name,
      string slug,
      string? description,
      string category,
      string thumbnailUrl,
      string defaultConfigJson,
      string? authorName,
      Guid? createdByUserId = null);
  ```

- **Contract Command & Query**:
  ```csharp
  // Contract/Services/V1/Templates/Command.cs
  public record CreateCommunityTemplateCommand(
      string Name,
      string Slug,
      string? Description,
      string Category,
      string ThumbnailUrl,
      string DefaultConfigJson,
      string? AuthorName,
      Guid? CreatedByUserId = null) : ICommand<Guid>;

  // Contract/Services/V1/Templates/Query.cs
  public record GetTemplatesQuery(
      string? Category = null,
      Guid? CategoryId = null,
      string? Badge = null,
      string? Search = null,
      bool? IsActiveOnly = null,
      bool? IsCommunity = null) : IQuery<List<TemplateResponse>>;

  // Contract/Services/V1/Templates/Response.cs
  public record TemplateResponse(
      Guid Id,
      string Name,
      string Slug,
      string? Description,
      Guid? CategoryId,
      string Category,
      string ThumbnailUrl,
      string? PreviewUrl,
      string? LongPreviewUrl,
      string? Badge,
      string? AudioUrl,
      string? MusicTitle,
      string DefaultConfigJson,
      bool IsActive,
      bool IsCommunity,
      string? AuthorName,
      DateTime CreatedAtUtc);
  ```

- **Minimal API Endpoint (`TemplateApi.cs`)**:
  ```csharp
  group.MapPost("community", async (CreateCommunityTemplateCommand command, ISender sender) =>
  {
      var result = await sender.Send(command);
      return HandleResult(result, () => Results.Created($"/api/v1/templates/{result.Value}", result));
  })
  .AllowAnonymous()
  .WithName("CreateCommunityTemplate")
  .Produces<Result<Guid>>(StatusCodes.Status201Created)
  .Produces<ValidationResult>(StatusCodes.Status400BadRequest);
  ```

### B. Frontend Data Structures & Interfaces

- **File `FE/vercel.json`**:
  ```json
  {
    "rewrites": [
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ]
  }
  ```

- **`DeviceSimulator.jsx` Specs**:
  - Props:
    ```javascript
    DeviceSimulator({
      children,              // Component con hiển thị bên trong màn hình điện thoại
      initialOs = 'ios',     // 'ios' | 'android'
      initialDeviceId,       // e.g. 'iphone-15-pro-max'
      showToolbar = true     // Cho phép người dùng chuyển đổi thiết bị và hệ điều hành
    })
    ```
  - Danh sách thiết bị:
    - **iOS**: iPhone 15 Pro Max (430x932, Dynamic Island), iPhone 15/14 (393x852, Dynamic Island), iPhone SE (375x667, Home Button, Top/Bottom Bezel), iPad Mini/Air (768x1024, Tablet).
    - **Android**: Samsung Galaxy S24 Ultra (412x915, Punch-Hole Center), Pixel 8 Pro (412x892, Punch-Hole Center), Xiaomi 14 (393x851, Punch-Hole Center), Galaxy Z Fold Cover (344x882, Narrow Screen).

- **Cấu trúc Thẻ lồng nhau động (Hierarchical Cards)** trong `config.hierarchicalCards`:
  ```javascript
  hierarchicalCards: [
    {
      id: "card-1",
      title: "Header Thẻ Chính",
      subHeader: "Mô tả phụ ngắn gọn",
      content: "Nội dung chi tiết của khối nội dung...",
      stylePreset: "glass", // 'glass' | 'solid' | 'gradient' | 'minimal'
      backgroundColor: "#ffffff",
      textColor: "#1e293b",
      animation: "fade-up",
      subCards: [
        {
          id: "sub-1",
          title: "Thẻ con 1",
          subHeader: "Chi tiết bổ trợ",
          content: "Nội dung mục con...",
          animation: "zoom-in"
        }
      ]
    }
  ]
  ```

- **10 Bảng màu Seed sẵn (`colorPalettes.js`)**:
  1. `Luxury Gold`: Primary `#D4AF37`, Secondary `#AA771C`, Accent `#FFF8DC`, Background `#121214`, Text `#F5F5F0`
  2. `Cyberpunk`: Primary `#00F0FF`, Secondary `#FF003C`, Accent `#FFE600`, Background `#0D0D15`, Text `#FFFFFF`
  3. `Romantic Rose`: Primary `#E11D48`, Secondary `#F43F5E`, Accent `#FEF08A`, Background `#FFF1F2`, Text `#1E293B`
  4. `Ocean Breeze`: Primary `#0284C7`, Secondary `#0EA5E9`, Accent `#38BDF8`, Background `#F0F9FF`, Text `#0F172A`
  5. `Emerald Garden`: Primary `#059669`, Secondary `#10B981`, Accent `#6EE7B7`, Background `#F0FDF4`, Text `#064E3B`
  6. `Sunset Glow`: Primary `#EA580C`, Secondary `#F97316`, Accent `#FDBA74`, Background `#FFF7ED`, Text `#431407`
  7. `Minimalist Mono`: Primary `#18181B`, Secondary `#27272A`, Accent `#71717A`, Background `#FFFFFF`, Text `#09090B`
  8. `Pastel Dream`: Primary `#8B5CF6`, Secondary `#A78BFA`, Accent `#F472B6`, Background `#FAF5FF`, Text `#3B0764`
  9. `Vintage Sepia`: Primary `#78350F`, Secondary `#92400E`, Accent `#FDE68A`, Background `#FEF3C7`, Text `#451A03`
  10. `Midnight Velvet`: Primary `#6366F1`, Secondary `#818CF8`, Accent `#C084FC`, Background `#0B0F19`, Text `#F3F4F6`

---

## 4. CÁC TRƯỜNG HỢP BIÊN BẮT BUỘC PHẢI XỬ LÝ
1. **Co giãn Simulator trên màn hình Laptop độ phân giải nhỏ (Scale Auto-fit)**:
   - Chiều cao các máy như iPhone 15 Pro Max là 932px + viền bezel ~960px. Trên màn hình 1366x768 hoặc 1080p có thanh trình duyệt, nếu không scale sẽ bị tràn hoặc xuất hiện 2 thanh scroll lồng nhau.
   - *Bắt buộc*: Tính toán hệ số `scale = Math.min(1, (viewportContainerHeight - 32) / (deviceHeight + bezelHeight))` và áp dụng CSS `transform: scale(scale)` với `transform-origin: top center` để thiết bị vừa khít màn hình hiển thị.
2. **Slug Trùng Lặp khi Public Template Cộng Đồng**:
   - Khi người dùng bấm lưu bản thiết kế thành Template công khai, slug do người dùng nhập hoặc sinh tự động có thể trùng với Template hệ thống hoặc của người khác.
   - *Bắt buộc*: Trong `CreateCommunityTemplateCommandHandler`, kiểm tra slug qua `_templateRepository.ExistsBySlugAsync`. Nếu trùng, tự động append chuỗi hậu tố ngẫu nhiên (vd: `slug + "-" + Guid.NewGuid().ToString("N")[..5]`).
3. **An toàn Schema khi Render Thẻ Lồng Nhau (Hierarchical Cards)**:
   - Các template cũ hoặc bản nháp cũ chưa có trường `hierarchicalCards`.
   - *Bắt buộc*: Sử dụng fallback `Array.isArray(config?.hierarchicalCards) ? config.hierarchicalCards : []`, không bao giờ để xảy ra runtime error `undefined.map()`.
4. **Tương thích PostgreSQL UTC DateTime**:
   - Mọi giá trị DateTime gán cho Entity (`CreatedAtUtc`, `ModifiedAtUtc`) bắt buộc dùng `DateTime.UtcNow`. Npgsql v9 sẽ từ chối lưu nếu DateTime có Kind là `Unspecified`.
5. **Mobile Viewport hẹp (< 375px) trên Customizer**:
   - Ở kích thước màn hình nhỏ, tuyệt đối không render song song cả Sidebar và Canvas.
   - *Bắt buộc*: Thiết lập cờ `activeMobileTab = 'edit' | 'preview'`, có Floating Tab Bar ở đáy màn hình giúp chuyển đổi mượt mà giữa chỉnh sửa và xem trước.
6. **Watermark / Web License cố định trên Route `/p/:slug`**:
   - Để chống gỡ bản quyền hoặc bị che khuất bởi nội dung trang landing page, Watermark phải được đặt cố định ở chân trang với cấu trúc phân tầng z-index an toàn (`relative z-30` hoặc `fixed bottom-0` kèm padding bù trừ phía dưới trang).
   - Link trên Watermark trỏ về trang chủ kèm UTM hoặc query `?ref=watermark` để tạo chuyển đổi người dùng mới.
7. **Tạo mã QR Code hoạt động ổn định không cần thư viện nặng**:
   - Dùng endpoint QR chuẩn SVG/PNG (`https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(url)}`) kèm chức năng copy link trực tiếp và nút download ảnh QR về máy, đảm bảo ứng dụng nhẹ và không phụ thuộc package lạ.

---

## 5. QUY ƯỚC CẦN BÁM THEO & TÊN FILE THAM CHIẾU
- **Backend Clean Architecture & CQRS Handler**:
  - Sao chép quy ước từ: `c:\Source\TemplateLandingPage\BE\src\Application\UseCases\V1\Templates\Commands\CreateTemplateCommandHandler.cs`
  - Sao chép quy ước Repository từ: `c:\Source\TemplateLandingPage\BE\src\Persistence\Repositories\TemplateRepository.cs`
  - Sao chép quy ước Minimal API từ: `c:\Source\TemplateLandingPage\BE\src\Presentation\APIs\Templates\TemplateApi.cs`
- **Frontend Component & Section Patterns**:
  - Sao chép quy ước Sidebar từ: `c:\Source\TemplateLandingPage\FE\src\components\customizer\CustomizerSidebar.jsx`
  - Sao chép quy ước Toolbar từ: `c:\Source\TemplateLandingPage\FE\src\components\customizer\CustomizerToolbar.jsx`
  - Sao chép quy ước Section Renderer từ: `c:\Source\TemplateLandingPage\FE\src\components\templates\LandingPageRenderer.jsx`
  - Sao chép quy ước Modal Preview từ: `c:\Source\TemplateLandingPage\FE\src\components\templates\QuickPreviewModal.jsx`
  - Sao chép quy ước API Client từ: `c:\Source\TemplateLandingPage\FE\src\api\templateApi.js`
