# BÁO CÁO THAY ĐỔI VÀ HIỆN THỰC HÓA MÃ NGUỒN (CHẶNG 2: CODER)

## 1. TỔNG QUAN
Dự án đã được triển khai đầy đủ cả 2 phần Backend (.NET 10 CQRS Clean Architecture + MediatR) và Frontend (React 19 + Vite + Tailwind CSS) đúng theo kế hoạch tại `PromtAI/.gemini/results/plan.md`.
- **Backend**: Đã biên dịch thành công (`dotnet build`) với 0 cảnh báo, 0 lỗi. Toàn bộ 93 tests (88 Unit Tests + 5 Architecture NetArchTests) đều vượt qua 100% (`Passed: 93/93`).
- **Frontend**: Đã build thành công (`npm run build`) với Vite 6 và React 19 trong 10.11s, không có bất kỳ lỗi cú pháp hay import nào.

---

## 2. DANH SÁCH FILE THAY ĐỔI & TẠO MỚI

### A. Backend (.NET 10 CQRS Clean Architecture)

#### 1. Domain Layer (`BE/src/Domain/`)
- `BE/src/Domain/Entities/User.cs`: Thực thể User với quản trị Email, PBKDF2 PasswordHash, FullName, Role (`Admin`/`User`), IsActive, Soft Delete.
- `BE/src/Domain/Entities/Template.cs`: Thực thể Master Template với Category (`Wedding`/`Birthday`), ThumbnailUrl, PreviewUrl, DefaultConfigJson.
- `BE/src/Domain/Entities/UserCustomization.cs`: Bản lưu tùy biến của người dùng liên kết Template, Slug độc nhất, ConfigJson và cờ IsPublished.
- `BE/src/Domain/Entities/RsvpEntry.cs`: Thực thể phản hồi tham dự (Tên khách, Email, SĐT, Trạng thái tham dự, Số khách, Ăn kiêng, Lời chúc).
- `BE/src/Domain/Entities/GuestbookEntry.cs`: Thực thể lời chúc trên sổ lưu bút ảo.
- `BE/src/Domain/Repositories/IUserRepository.cs`: Repository interface tìm theo Email, kiểm tra trùng Email.
- `BE/src/Domain/Repositories/ITemplateRepository.cs`: Repository interface tìm theo Slug, kiểm tra trùng Slug.
- `BE/src/Domain/Repositories/ICustomizationRepository.cs`: Repository interface lấy theo Slug, lấy theo UserId, kiểm tra trùng Slug.
- `BE/src/Domain/Repositories/IRsvpRepository.cs`: Repository interface lấy danh sách RSVP theo CustomizationId.
- `BE/src/Domain/Repositories/IGuestbookRepository.cs`: Repository interface lấy danh sách Guestbook theo CustomizationId.

#### 2. Contract Layer (`BE/src/Contract/`)
- `BE/src/Contract/Services/V1/Auth/AuthCommandsAndQueries.cs`: DTO và Command/Query cho Register, Login, Me, TokenResponse.
- `BE/src/Contract/Services/V1/Users/UserCommandsAndQueries.cs`: DTO và Command/Query cho quản lý Users (CRUD, phân quyền Admin).
- `BE/src/Contract/Services/V1/Templates/TemplateCommandsAndQueries.cs`: DTO và Command/Query cho Master Templates.
- `BE/src/Contract/Services/V1/Customizations/CustomizationCommandsAndQueries.cs`: DTO và Command/Query cho User Customizations.
- `BE/src/Contract/Services/V1/Interactions/InteractionCommandsAndQueries.cs`: DTO và Command/Query cho RSVP và Guestbook.

#### 3. Application Layer (`BE/src/Application/`)
- `BE/src/Application/Abstractions/IPasswordHasher.cs` & `IJwtTokenGenerator.cs`: Giao diện trừu tượng bảo mật.
- `BE/src/Application/UseCases/V1/Auth/`: Các Command Handler và FluentValidation Validators cho Đăng ký, Đăng nhập, Lấy profile.
- `BE/src/Application/UseCases/V1/Users/`: Các Handler và Validator cho CRUD Người dùng và phân quyền.
- `BE/src/Application/UseCases/V1/Templates/`: Các Handler và Validator cho CRUD Master Templates, lấy theo Slug/Id.
- `BE/src/Application/UseCases/V1/Customizations/`: Các Handler và Validator cho Tạo/Sửa/Xóa tùy biến, lấy theo Slug cho khách xem public.
- `BE/src/Application/UseCases/V1/Interactions/`: Các Handler và Validator cho Gửi/Lấy danh sách RSVP và Guestbook.

#### 4. Infrastructure Layer (`BE/src/Infrastructure/`)
- `BE/src/Infrastructure/TemplateLandingPage.Infrastructure.csproj`: Bổ sung `Microsoft.IdentityModel.Tokens`, `System.IdentityModel.Tokens.Jwt`, `Microsoft.Extensions.Configuration.Abstractions`, `Microsoft.Extensions.Options.ConfigurationExtensions`.
- `BE/src/Infrastructure/Authentication/JwtSettings.cs`: POCO cấu hình SecretKey, Issuer, Audience, Expiration.
- `BE/src/Infrastructure/Services/PasswordHasher.cs`: Băm mật khẩu bằng PBKDF2 SHA-512 với cryptographic salt chuẩn RFC 2898. Bọc `Convert.FromBase64String` trong khối `try ... catch (FormatException)` để trả về `false` một cách an toàn khi chuỗi hash chứa ký tự không hợp lệ, không gây gián đoạn hệ thống.
- `BE/src/Infrastructure/Services/JwtTokenGenerator.cs`: Sinh JWT Bearer token kèm Claims (Id, Email, Name, Role).
- `BE/src/Infrastructure/DependencyInjection/Extensions/ServiceCollectionExtensions.cs`: Đăng ký DI cho JWT Settings, Hasher và Token Generator.

#### 5. Persistence Layer (`BE/src/Persistence/`)
- `BE/src/Persistence/Constants/TableNames.cs`: Khai báo bảng `Users`, `Templates`, `UserCustomizations`, `RsvpEntries`, `GuestbookEntries`.
- `BE/src/Persistence/ApplicationDbContext.cs`: Khai báo DbSet cho 5 thực thể.
- `BE/src/Persistence/Configurations/`: Cấu hình Fluent API EF Core cho từng bảng (Index, Unique Constraint trên Email/Slug, nvarchar max cho Json).
- `BE/src/Persistence/Repositories/`: Cài đặt UserRepository, TemplateRepository, CustomizationRepository, RsvpRepository, GuestbookRepository.
- `BE/src/Persistence/Data/DataSeeder.cs`: Tự động khởi tạo dữ liệu mẫu cho Admin (`admin@template.com`), User (`user@template.com`), cùng 2 Master Template chi tiết ("Elegance Blossom" - Wedding, "Golden Glamour" - Birthday).
- `BE/src/Persistence/DependencyInjection/Extensions/ServiceCollectionExtensions.cs`: Đăng ký DI các repositories.

#### 6. Presentation & API Layer (`BE/src/Presentation/`, `BE/src/API/`)
- `BE/src/Presentation/APIs/Auth/AuthApi.cs`: Endpoint `/api/v1/auth` (Register, Login, Me).
- `BE/src/Presentation/APIs/Users/UserApi.cs`: Endpoint `/api/v1/users` (CRUD User - Yêu cầu Role Admin).
- `BE/src/Presentation/APIs/Templates/TemplateApi.cs`: Endpoint `/api/v1/templates` (Lấy danh sách public, Admin thêm/sửa/xóa).
- `BE/src/Presentation/APIs/Customizations/CustomizationApi.cs`: Endpoint `/api/v1/customizations` (Lưu cấu hình, sửa, xóa, lấy theo slug).
- `BE/src/Presentation/APIs/Interactions/InteractionApi.cs`: Endpoint `/api/v1/rsvp` và `/api/v1/guestbook` (Gửi phản hồi và xem danh sách).
- `BE/src/API/Program.cs`: Cấu hình JWT Bearer Authentication, Swagger UI kèm Authorize Bearer token, DataSeeder khi chạy.
- `BE/src/API/appsettings.json`: Cấu hình chuỗi kết nối và thông số JWT.

#### 7. Unit Tests & Architecture Tests (`BE/test/`)
- `BE/test/UnitTests/Application/Auth/`: Test cho Register, Login (thành công, trùng email, sai mật khẩu).
- `BE/test/UnitTests/Application/Templates/`: Test tạo template, trùng slug.
- `BE/test/UnitTests/Application/Customizations/`: Test tạo customization và sinh slug.
- `BE/test/Architecture.Tests/ArchitectureTests.cs`: Kiểm tra 5 luật Clean Architecture của dự án.

---

### B. Frontend (React 19 + Vite + Tailwind CSS)

#### 1. API Services & State (`FE/src/api/`, `FE/src/contexts/`, `FE/src/hooks/`)
- `FE/src/api/axios.js`: Tự động đính kèm `Authorization: Bearer <token>`, bắt mã 401 để xóa token và điều hướng về trang đăng nhập.
- `FE/src/api/authApi.js`: Gọi endpoint login, register, me.
- `FE/src/api/userApi.js`: Gọi CRUD người dùng cho trang Admin.
- `FE/src/api/templateApi.js`: Lấy danh sách master templates, chi tiết theo Id/Slug, CRUD cho Admin.
- `FE/src/api/customizationApi.js`: Lưu/sửa/xóa cấu hình cá nhân hóa, lấy theo slug để hiển thị landing page.
- `FE/src/api/interactionApi.js`: Gửi RSVP, lấy danh sách RSVP, gửi lưu bút, lấy danh sách lưu bút.
- `FE/src/contexts/AuthContext.jsx`: Cung cấp context đăng nhập toàn cục, lưu trạng thái token, user, hàm `login`, `register`, `logout`, cờ `isAdmin`.
- `FE/src/hooks/useAuth.js`: Custom hook truy cập AuthContext tiện lợi.

#### 2. Tiện ích (`FE/src/utils/`)
- `FE/src/utils/defaultTemplates.js`: Bộ cấu hình JSON mẫu chi tiết chuẩn mực cho cả đám cưới (Wedding - Elegance Blossom) và sinh nhật (Birthday - Golden Glamour).
- `FE/src/utils/htmlExporter.js`: Hàm xuất trọn vẹn file HTML độc lập (`standalone-template.html`) có sẵn Tailwind CDN, Google Fonts, đồng hồ đếm ngược, hiệu ứng canvas cánh hoa/confetti và trình phát nhạc mà không cần cài đặt thêm bất kỳ thư viện nào.

#### 3. Components (`FE/src/components/`)
- `FE/src/components/ProtectedRoute.jsx`: Bảo vệ các route yêu cầu đăng nhập hoặc yêu cầu quyền Admin.
- `FE/src/components/templates/MotionParticles.jsx`: Hiệu ứng canvas chuyển động cánh hoa rơi (Wedding) hoặc giấy confetti (Birthday).
- `FE/src/components/templates/FloatingMusicPlayer.jsx`: Nút phát nhạc nổi góc màn hình kèm sóng âm chuyển động, có xử lý bắt ngoại lệ chính sách Autoplay của trình duyệt.
- `FE/src/components/templates/LandingPageRenderer.jsx`: Engine trung tâm nạp JSON config bất kỳ để hiển thị trang web hoàn chỉnh:
  + Hero Section: Countdown đếm ngược theo thời gian thực, nút CTA cuộn nhanh xuống RSVP.
  + Couple/Celebrant Section: Avatar tròn, viền màu chủ đạo, tiểu sử, thông tin cha mẹ, quote tình yêu.
  + Event Details Section: Thời gian, địa điểm The Adora / Sky Lounge, bản đồ chỉ đường Google Maps, Dress Code.
  + Interactive Timeline: Lịch trình sự kiện với các biểu tượng phong phú.
  + Photo Gallery: Lưới hình ảnh kèm Lightbox phóng to khi click.
  + RSVP Section: Biểu mẫu xác nhận số lượng khách, chế độ ăn kiêng, gửi lời nhắn trực tiếp vào CSDL.
  + Guestbook Wall: Sổ lưu bút ảo cho phép khách để lại lời chúc mừng tức thì.
- `FE/src/components/templates/TemplateCard.jsx`: Thẻ hiển thị mẫu kèm hình ảnh, nhãn danh mục, nút Xem nhanh và Tùy biến.
- `FE/src/components/templates/QuickPreviewModal.jsx`: Modal xem trước trực tiếp kèm nút chuyển đổi giữa Desktop và Mobile (375px).
- `FE/src/components/customizer/CustomizerToolbar.jsx`: Thanh công cụ trên đầu Customizer: Switch Viewport, Nút Lưu, Tải JSON, Xuất Standalone HTML, Xem toàn màn hình.
- `FE/src/components/customizer/CustomizerSidebar.jsx`: Thanh công cụ tùy biến bên trái với 10 tabs (Cài đặt chung, Giao diện/Màu sắc, Hero, Nhân vật chính, Sự kiện, Lịch trình, Album ảnh, Biểu mẫu RSVP, Nhạc nền, Lời chúc).
- `FE/src/components/admin/AdminLayout.jsx`: Bố cục trang quản trị với Sidebar điều hướng và thông tin người dùng.
- `FE/src/components/Navbar.jsx`: Navbar mới phong cách MotionSites với Logo, Kho Mẫu, Thiệp Của Tôi, Menu User Dropdown, Link Quản trị.
- `FE/src/components/Footer.jsx`: Footer giao diện tối thanh lịch phong cách motionsites.ai.

#### 4. Pages & Routing (`FE/src/pages/`, `FE/src/routes/`)
- `FE/src/pages/HomePage.jsx`: Trang chủ MotionSites hiện đại với Hero chuyển động, Floating Badges, Showcase các mẫu thịnh hành, 3 bước tạo thiệp và CTA.
- `FE/src/pages/TemplatesPage.jsx`: Bộ sưu tập mẫu phân loại theo tab (Tất cả, Đám cưới, Sinh nhật) kèm ô tìm kiếm.
- `FE/src/pages/CustomizerPage.jsx`: Không gian chỉnh sửa thời gian thực chia đôi màn hình (Sidebar tùy biến + Live Canvas xem trước).
- `FE/src/pages/LivePreviewPage.jsx`: Trang xem toàn màn hình Live Landing Page (hỗ trợ cả template gốc `/preview/:templateId` và link thiệp thực tế `/view/:slug`).
- `FE/src/pages/MyCustomizationsPage.jsx`: Quản lý các thiệp người dùng đã tạo kèm tính năng sao chép link chia sẻ, sửa, xem, xuất HTML và xóa.
- `FE/src/pages/auth/LoginPage.jsx`: Trang đăng nhập sang trọng.
- `FE/src/pages/auth/RegisterPage.jsx`: Trang đăng ký tài khoản mới.
- `FE/src/pages/admin/AdminDashboardPage.jsx`: Thống kê tổng số mẫu, người dùng, lượt RSVP và lời chúc.
- `FE/src/pages/admin/AdminTemplatesPage.jsx`: Quản trị Master Templates với trình soạn thảo JSON có kiểm tra cú pháp.
- `FE/src/pages/admin/AdminUsersPage.jsx`: Quản trị danh sách người dùng, cấp quyền Admin và khóa tài khoản.
- `FE/src/routes/index.jsx`: Thiết lập định tuyến đầy đủ.
- `FE/src/App.jsx`: Bọc AuthProvider và ẩn Navbar/Footer khi ở chế độ Full Preview, Customizer hoặc Admin.
- `FE/src/index.css`: Bổ sung font Playfair Display, Cinzel, Montserrat, Great Vibes và keyframe animations.

---

## 3. VỊ TRÍ TRỌNG YẾU MÀ TESTER NÊN SOI KỸ

1. **Kiểm tra luồng xác thực & phân quyền (Auth & RBAC)**:
   - Thử đăng nhập tài khoản Admin (`admin@template.com` / `Admin@123456`) để truy cập `/admin`.
   - Thử đăng nhập tài khoản Thường (`user@template.com` / `User@123456`) và gõ trực tiếp URL `/admin` -> `ProtectedRoute` phải chuyển hướng ra trang chủ.
   - Thử chức năng Đăng ký tài khoản mới tại `/register`.

2. **Kiểm tra Live Customizer (`/customize/:templateId`)**:
   - Thay đổi các giá trị ở Sidebar (Màu chủ đạo, Tiêu đề Hero, Ngày cưới, Danh sách mốc thời gian, Album ảnh) -> Canvas bên phải phải phản hồi tức thời.
   - Nhấn nút chuyển đổi Viewport giữa **Desktop** và **Mobile (375px)** để kiểm tra khung điện thoại.
   - Nhấn **Xuất Standalone HTML** -> Tải về file `.html`, mở trực tiếp bằng trình duyệt ngoại tuyến (double-click) để kiểm tra Countdown, Canvas cánh hoa và giao diện hoạt động độc lập.

3. **Kiểm tra tương tác RSVP & Guestbook trên trang chia sẻ thực tế (`/view/:slug`)**:
   - Truy cập vào trang thiệp đã tạo hoặc đường dẫn `/view/<slug>`.
   - Điền form "Xác nhận tham dự" (RSVP) và form "Sổ lưu bút" -> Kiểm tra dữ liệu được lưu vào CSDL và danh sách lời chúc hiển thị ngay trên màn hình.

4. **Kiểm tra xử lý ngoại lệ JSON trong Quản trị Templates (`/admin/templates`)**:
   - Mở modal sửa hoặc thêm mẫu, cố tình nhập JSON sai cú pháp -> Hệ thống phải chặn lại và hiển thị thông báo lỗi, không làm sập ứng dụng.
