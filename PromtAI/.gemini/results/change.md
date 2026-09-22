# BÁO CÁO THAY ĐỔI MÃ NGUỒN (CHẶNG 2 - CODER)

**Dự án**: Nâng Cấp Toàn Diện Nền Tảng Template Landing Page  
**Thời gian hoàn thành**: 2026-09-22  
**Trạng thái**: Hoàn tất 100% theo đúng bản kế hoạch tại `PromtAI/.gemini/results/plan.md`.  
**Kết quả kiểm thử tự động**:
- **Backend .NET 10**: 379/379 tests pass (7 Architecture Tests + 372 Unit Tests, 0 Failed, 0 Skipped - PASS 100%).
- **Frontend React 19 + Vite**: `npm run build` hoàn thành thành công 100% không lỗi biên dịch.

---

## 1. DANH SÁCH FILE THAY ĐỔI / TẠO MỚI

### A. Backend (.NET 10 Clean Architecture)
| STT | Đường dẫn File | Loại | Mục đích sửa đổi |
|:---:|:---|:---:|:---|
| 1 | `BE/src/Domain/Entities/Template.cs` | Sửa | Thêm các thuộc tính `IsCommunity`, `AuthorName`, `CreatedByUserId` và phương thức factory `CreateCommunity(...)`. |
| 2 | `BE/src/Persistence/Configurations/TemplateConfiguration.cs` | Sửa | Cấu hình Fluent API EF Core: `IsCommunity` (default false, có index), `AuthorName` (max 150), `CreatedByUserId`. |
| 3 | `BE/src/Domain/Repositories/ITemplateRepository.cs` | Sửa | Cập nhật chữ ký hàm `GetListAsync` thêm tham số `bool? isCommunity = null`. |
| 4 | `BE/src/Persistence/Repositories/TemplateRepository.cs` | Sửa | Thực thi bộ lọc `isCommunity` trong câu truy vấn `GetListAsync`. |
| 5 | `BE/src/Contract/Services/V1/Templates/Command.cs` | Sửa | Bổ sung record `CreateCommunityTemplateCommand` triển khai `ICommand<Guid>`. |
| 6 | `BE/src/Contract/Services/V1/Templates/Query.cs` | Sửa | Bổ sung `bool? IsCommunity = null` vào `GetTemplatesQuery`. |
| 7 | `BE/src/Contract/Services/V1/Templates/Response.cs` | Sửa | Bổ sung `bool IsCommunity, string? AuthorName` vào record `TemplateResponse`. |
| 8 | `BE/src/Application/UseCases/V1/Templates/Commands/CreateCommunityTemplateCommandHandler.cs` | Tạo mới | Handler MediatR xử lý tạo template cộng đồng, tự động xử lý xung đột slug (append 5 ký tự ngẫu nhiên khi slug đã tồn tại). |
| 9 | `BE/src/Application/UseCases/V1/Templates/Validators/CreateCommunityTemplateCommandValidator.cs` | Sửa | Bổ sung kiểm tra tính hợp lệ JSON cho `DefaultConfigJson` bằng `Must(BeValidJson)` dùng `JsonDocument.Parse` và giới hạn `AuthorName` tối đa 150 ký tự (`MaximumLength(150)`). |
| 10 | `BE/src/Application/UseCases/V1/Templates/Queries/GetTemplatesQueryHandler.cs` | Sửa | Truyền `query.IsCommunity` vào repository và map `IsCommunity`, `AuthorName` vào `TemplateResponse`. |
| 11 | `BE/src/Application/UseCases/V1/Templates/Queries/GetTemplateByIdQueryHandler.cs` | Sửa | Map `IsCommunity` và `AuthorName` vào `TemplateResponse`. |
| 12 | `BE/src/Application/UseCases/V1/Templates/Queries/GetTemplateBySlugQueryHandler.cs` | Sửa | Map `IsCommunity` và `AuthorName` vào `TemplateResponse`. |
| 13 | `BE/src/Presentation/APIs/Templates/TemplateApi.cs` | Sửa | Thêm endpoint public `POST /api/v1/templates/community` (`AllowAnonymous`) và query param `isCommunity` trong `GET /api/v1/templates`. |
| 14 | `BE/src/Persistence/Data/DataSeeder.cs` | Sửa | Bổ sung 4 danh mục mới (`spa-beauty`, `podcast-music`, `tech-startup`, `photography`) và 4 template tương ứng với config JSON chi tiết. |
| 15 | `BE/test/UnitTests/Application/Templates/GetTemplatesQueryHandlerTests.cs` | Sửa | Cập nhật mock setup với 7 tham số và bổ sung test case lọc `isCommunity`. |
| 16 | `BE/test/UnitTests/Application/Templates/CreateCommunityTemplateCommandHandlerTests.cs` | Tạo mới | Unit tests cho `CreateCommunityTemplateCommandHandler` (tạo thành công, xử lý trùng slug) và validator. |
| 17 | `BE/test/UnitTests/Persistence/DataSeederTests.cs` | Sửa | Cập nhật số lượng danh mục (19) và templates (23), kiểm tra map chính xác 4 template mới. |

---

### B. Frontend (React 19 + Tailwind CSS + Vite)
| STT | Đường dẫn File | Loại | Mục đích sửa đổi |
|:---:|:---|:---:|:---|
| 18 | `FE/vercel.json` | Tạo mới | Cấu hình rewrites `/(.*)` về `/index.html` khắc phục triệt để lỗi F5 404 trên Vercel. |
| 19 | `FE/src/components/common/DeviceSimulator.jsx` | Tạo mới | Khung mô phỏng thiết bị thực tế chuyển đổi iOS vs Android (iPhone 15 Pro Max, 15/14, SE, iPad, S24 Ultra, Pixel 8 Pro, Z Fold, Xiaomi 14) kèm bezel, dynamic island, punch hole, status bar và auto-fit scale observer. |
| 20 | `FE/src/utils/colorPalettes.js` | Tạo mới | Danh mục 10 Color Palettes chuẩn chuyên nghiệp (`Luxury Gold`, `Cyberpunk`, `Romantic Rose`, `Ocean Breeze`, `Emerald Garden`, `Sunset Glow`, `Minimalist Mono`, `Pastel Dream`, `Vintage Sepia`, `Midnight Velvet`) kèm hàm áp dụng tức thì `applyPaletteToConfig`. |
| 21 | `FE/tailwind.config.js` | Sửa | Bổ sung animation keyframes: `shimmer`, `wiggle`, `heartbeat`, `float-slow`, `fade-up`, `zoom-in`. |
| 22 | `FE/src/utils/animationConstants.js` | Sửa | Phân nhóm hiệu ứng Entrance, Continuous, Particles (`petals`, `confetti`, `sparkles`, `snow`, `bubbles`, `fireflies`, `cyber-grid`). |
| 23 | `FE/src/components/templates/MotionParticles.jsx` | Sửa | Nâng cấp canvas particle engine hỗ trợ trọn vẹn 7 hiệu ứng hạt với physics và blend mode phù hợp. |
| 24 | `FE/src/components/customizer/AnimationSelector.jsx` | Sửa | Bộ chọn animation phân nhóm trực quan với optgroup và icon động. |
| 25 | `FE/src/components/templates/sections/HierarchicalCardsSection.jsx` | Tạo mới | Khối thẻ lồng nhau động (Card -> Header Card -> Sub Header -> Content -> Sub Cards) với 5 preset style (`glass`, `solid`, `gradient`, `minimal`, `luxury`). |
| 26 | `FE/src/components/templates/LandingPageRenderer.jsx` | Sửa | Tích hợp render an toàn `HierarchicalCardsSection` khi `config.hierarchicalCards` có dữ liệu. |
| 27 | `FE/src/utils/defaultTemplates.js` | Sửa | Cung cấp cấu hình mặc định phong phú cho 4 danh mục mới (`DEFAULT_SPA_BEAUTY_CONFIG`, `DEFAULT_PODCAST_MUSIC_CONFIG`, `DEFAULT_TECH_STARTUP_CONFIG`, `DEFAULT_PHOTOGRAPHY_CONFIG`). |
| 28 | `FE/src/components/customizer/CustomizerSidebar.jsx` | Sửa | Thêm Tab "Khối Thẻ Động (Cards)", bộ chọn 1-click Color Palettes trong Tab Theme, và cập nhật 7 loại hạt Particles. |
| 29 | `FE/src/components/customizer/CustomizerToolbar.jsx` | Sửa | Tối ưu responsive trên màn hình điện thoại, thêm nút "Chia sẻ cộng đồng" mở modal đóng góp mẫu. |
| 30 | `FE/src/pages/CustomizerPage.jsx` | Sửa | Tích hợp `DeviceSimulator` cho mobile viewport, responsive tabs ("Chỉnh Sửa" vs "Xem Trước") kèm bottom bar trên di động, modal đóng góp template cộng đồng. |
| 31 | `FE/src/components/templates/QuickPreviewModal.jsx` | Sửa | Tích hợp `DeviceSimulator` cho phép chọn OS và thiết bị thực tế khi xem trước ở Home và Preview. |
| 32 | `FE/src/components/templates/TemplateCard.jsx` | Sửa | Hiển thị huy hiệu "Cộng đồng" (`Globe`) và tác giả đóng góp (`User`) trên card khi `template.isCommunity` là true. |
| 33 | `FE/src/components/common/QrCodeModal.jsx` | Tạo mới | Modal hiển thị mã QR Code chuẩn SVG/PNG không phụ thuộc thư viện nặng, nút sao chép link và nút tải ảnh QR PNG về máy. |
| 34 | `FE/src/pages/PublicLandingPage.jsx` | Tạo mới | Trang công khai độc lập cho `/p/:slug` và `/live/:slug` với sticky footer bản quyền / watermark cố định (`?ref=watermark`) và thanh công cụ nổi (Sao chép link, Mã QR, Chia sẻ). |
| 35 | `FE/src/routes/index.jsx` | Sửa | Đăng ký route `/p/:slug` và `/live/:slug` trỏ về `PublicLandingPage`. |
| 36 | `FE/src/api/templateApi.js` | Sửa | Thêm API method `publishCommunityTemplate(templateData)`. |
| 37 | `FE/src/pages/TemplatesPage.jsx` | Sửa | Thêm bộ Tabs nguồn: "Tất Cả Mẫu", "Mẫu Hệ Thống (Official)", "Cộng Đồng Đóng Góp (Community)" kèm bộ đếm số lượng thực tế. |

---

## 2. CHI TIẾT MỖI CHỖ SỬA ĐỂ LÀM GÌ

1. **Khắc phục lỗi F5 404 trên Vercel**: Tạo `FE/vercel.json` định tuyến toàn bộ request `/(.*)` về `/index.html` của SPA React.
2. **Trình mô phỏng thiết bị thực tế iOS vs Android (`DeviceSimulator.jsx`)**: Giúp khách hàng xem trước giao diện trang web trên các dòng máy iPhone (Dynamic Island, Bezel) và Android (Samsung, Pixel, Fold, Xiaomi - Punch Hole). Tự động co giãn scale bằng ResizeObserver để tránh tràn màn hình laptop/máy tính bàn.
3. **Bộ màu 1-Click Color Palettes (`colorPalettes.js`)**: Cho phép người dùng chuyển đổi toàn bộ màu chủ đạo, phụ, nền, chữ của trang chỉ với 1 cú click.
4. **Hệ thống hiệu ứng chuyển động & Hạt rơi (`animationConstants.js`, `MotionParticles.jsx`)**: Mở rộng hiệu ứng từ 2 loại lên 7 loại hạt (petals, confetti, sparkles, snow, bubbles, fireflies, cyber-grid) chạy trên canvas mượt mà 60fps.
5. **Cấu trúc Khối Thẻ Động Lồng Nhau (`HierarchicalCardsSection.jsx`)**: Cho phép tạo nội dung phân tầng linh hoạt (Card -> Header -> Sub Header -> Content -> Sub Cards) với các preset kính mờ (glassmorphism), viền gradient, tối giản, sang trọng.
6. **Mở rộng 4 Chủ đề & Mẫu Thiết kế mới (`DataSeeder.cs`, `defaultTemplates.js`)**: Bổ sung đầy đủ dữ liệu mẫu cho Spa & Làm Đẹp, Podcast & Âm Nhạc, Công Nghệ & Startup, Nhiếp Ảnh Studio.
7. **Chia sẻ và Khám phá Mẫu Cộng Đồng (`TemplateApi.cs`, `CustomizerToolbar.jsx`, `CustomizerPage.jsx`, `TemplatesPage.jsx`)**: Cho phép bất kỳ người dùng nào sau khi tùy biến trang thiệp/landing page có thể chia sẻ lên kho mẫu cộng đồng. Hệ thống tự động phát hiện và xử lý hậu tố trùng slug, hiển thị badge tác giả và tab lọc riêng biệt.
8. **Trang hiển thị công khai có Watermark & QR Code (`PublicLandingPage.jsx`, `QrCodeModal.jsx`, `routes/index.jsx`)**: Hỗ trợ chia sẻ đường dẫn ngắn gọn `/p/:slug` hoặc `/live/:slug` với footer bản quyền cố định kèm link dẫn về trang chủ và modal quét mã QR tải về máy.
9. **Bổ sung Validator cho Mẫu Cộng Đồng (`CreateCommunityTemplateCommandValidator.cs`)**: Thêm kiểm tra định dạng JSON hợp lệ cho `DefaultConfigJson` bằng `Must(BeValidJson)` (sử dụng `JsonDocument.Parse`) và ràng buộc độ dài tối đa 150 ký tự cho `AuthorName` khi có giá trị (`MaximumLength(150)`). Đảm bảo 100% (372/372) Unit Tests vượt qua thành công.

---

## 3. VỊ TRÍ TRỌNG YẾU MÀ TESTER NÊN SOI KỸ

1. **Kiểm tra va chạm Slug khi đăng tải Mẫu Cộng Đồng**:
   - Thao tác: Vào trang Customizer, nhấn "Chia sẻ cộng đồng", nhập tên và slug đã tồn tại (ví dụ: `cinelove-classic`).
   - Kết quả kỳ vọng: Backend tự động sinh slug mới kèm hậu tố ngẫu nhiên (ví dụ: `cinelove-classic-a1b2c`) và lưu thành công, không văng lỗi 500 hay Duplicate Key.
2. **Kiểm tra Bộ Lọc Nguồn trên `TemplatesPage`**:
   - Thao tác: Chuyển đổi giữa 3 tabs: "Tất Cả Mẫu", "Mẫu Hệ Thống", "Cộng Đồng Đóng Góp".
   - Kết quả kỳ vọng: Tab "Mẫu Hệ Thống" chỉ hiển thị các mẫu có `isCommunity = false`; Tab "Cộng Đồng Đóng Góp" chỉ hiển thị các mẫu cộng đồng có gắn huy hiệu "Cộng đồng" và tên tác giả.
3. **Kiểm tra Device Simulator và Auto-fit Scale**:
   - Thao tác: Trên trang Customizer (chế độ Mobile) hoặc mở QuickPreviewModal, bấm đổi giữa iPhone 15 Pro Max, iPhone SE, Samsung S24 Ultra, Pixel 8 Pro, Galaxy Fold.
   - Kết quả kỳ vọng: Màn hình simulator tự động căn chỉnh tỷ lệ (scale transform) vừa vặn khung hình xem trước, hiển thị đúng Dynamic Island / Punch Hole / Status Bar tương ứng với OS và máy đã chọn.
4. **Kiểm tra Responsive trên Mobile (< 768px) tại Customizer**:
   - Thao tác: Giả lập màn hình điện thoại (F12 Responsive 375px) vào trang `/customize/:templateId`.
   - Kết quả kỳ vọng: Màn hình không bị vỡ giao diện; hiển thị thanh bottom bar cố định với 2 nút "Chỉnh Sửa" và "Xem Trước", chuyển đổi qua lại mượt mà giữa Sidebar và Canvas.
5. **Kiểm tra Khối Thẻ Động (Hierarchical Cards)**:
   - Thao tác: Trong Customizer, mở Tab "Khối Thẻ Động", thêm thẻ chính, thêm thẻ con (Sub-cards), đổi preset style (`glass`, `luxury`, `gradient`).
   - Kết quả kỳ vọng: Canvas hiển thị ngay lập tức khối thẻ lồng nhau theo đúng style preset và dữ liệu đã nhập; xuất bản trang `/p/:slug` hiển thị đầy đủ và không bị lỗi JavaScript `undefined`.
6. **Kiểm tra Mã QR Code và Tải ảnh (`QrCodeModal`)**:
   - Thao tác: Trên trang `/p/:slug`, bấm nút QR Code trên thanh công cụ nổi, bấm "Sao chép" và bấm "Tải ảnh QR".
   - Kết quả kỳ vọng: Ảnh QR hiển thị rõ ràng, tải về file PNG thành công và camera điện thoại quét dẫn đúng URL trang.
7. **Kiểm tra Validation khi tạo Mẫu Cộng Đồng (`CreateCommunityTemplateCommandValidator`)**:
   - Thao tác: Gửi request tạo template cộng đồng với `defaultConfigJson` sai cú pháp JSON hoặc `authorName` vượt quá 150 ký tự.
   - Kết quả kỳ vọng: Request bị chặn bởi FluentValidation với thông báo lỗi validation rõ ràng tương ứng cho thuộc tính đó, không bị lỗi 500.
