# BẢN KẾ HOẠCH TRIỂN KHAI (IMPLEMENTATION PLAN)
**Tính năng**: Hệ thống Quản lý & Tùy biến Landing Page Thiệp cưới / Thiệp sinh nhật (Template Engine, Customizer Editor, Live Preview, Export Standalone HTML & Admin Management)

---

## 1. CÂU HỎI CÒN BỎ NGỎ
Không có.

---

## 2. QUY ƯỚC CẦN BÁM THEO
- **Quy ước Backend**: Bám sát toàn bộ quy chuẩn tại [PromtAI/.gemini/agents/coder.md](file:///e:/Code/TemplateLandingPage/PromtAI/.gemini/agents/coder.md) (Phần A: Clean Architecture .NET 10 + CQRS + MediatR + EF Core SQL Server; Phần C: Checklist review & Naming).
  - Domain không phụ thuộc project khác.
  - Contract chứa Commands, Queries, Responses, Errors, Interfaces Message.
  - Application chứa UseCases (Command/Query Handlers), FluentValidation Validators, Pipeline Behaviors. Handlers bắt buộc có hậu tố `Handler`.
  - Persistence chứa EF Core DbContext, Configurations, Repositories kế thừa `RepositoryBase<T, Guid>`.
  - Infrastructure chứa External services (PasswordHasher PBKDF2 SHA-512, JwtTokenGenerator).
  - Presentation chứa Minimal API endpoints kế thừa `IEndpoint`, gửi request qua `ISender`.
- **Quy ước Frontend**: Bám sát [PromtAI/.gemini/agents/coder.md](file:///e:/Code/TemplateLandingPage/PromtAI/.gemini/agents/coder.md) (Phần B & C) kết hợp codebase hiện tại: React 19, Vite, Tailwind CSS 3, Lucide React, React Router DOM 7, Axios instance có Auth interceptor.
- **Quy ước Test**: Đảm bảo toàn bộ 5 test kiến trúc NetArchTest trong [ArchitectureTests.cs](file:///e:/Code/TemplateLandingPage/BE/test/Architecture.Tests/ArchitectureTests.cs) và các Unit Tests tiếp tục PASS 100%.

---

## 3. CẤU TRÚC JSON CONFIG SCHEMA CHO TEMPLATE
Mỗi Master Template và User Customization lưu trữ cấu hình dưới dạng JSON chuỗi string (`ConfigJson`) tuân thủ schema linh hoạt sau:
```json
{
  "theme": {
    "primaryColor": "#e11d48",
    "secondaryColor": "#f43f5e",
    "accentColor": "#fef08a",
    "backgroundColor": "#fff1f2",
    "textColor": "#1e293b",
    "fontFamily": "Playfair Display",
    "stylePreset": "romantic",
    "particlesEffect": "petals"
  },
  "hero": {
    "badge": "SAVE THE DATE",
    "title": "Minh & Linh",
    "subtitle": "Hân hoan thông báo ngày chung đôi",
    "eventDate": "2026-10-25T18:00:00",
    "coverImageUrl": "https://images.unsplash.com/photo-1519741497674-611481863552",
    "callToActionText": "Xác nhận tham dự"
  },
  "coupleOrCelebrant": {
    "type": "wedding",
    "person1": {
      "name": "Nguyễn Văn Minh",
      "title": "Chú Rể",
      "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      "bio": "Kỹ sư phần mềm, yêu âm nhạc và nhiếp ảnh",
      "parents": "Ông Nguyễn Văn A & Bà Trần Thị B"
    },
    "person2": {
      "name": "Lê Thùy Linh",
      "title": "Cô Dâu",
      "avatarUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      "bio": "Nhà thiết kế đồ họa, thích hoa và du lịch",
      "parents": "Ông Lê Văn C & Bà Phạm Thị D"
    },
    "storyQuote": "Tình yêu không phải là nhìn nhau, mà là cùng nhau nhìn về một hướng."
  },
  "eventDetails": {
    "ceremonyName": "Lễ Thành Hôn",
    "time": "17:30 - Chủ Nhật, 25/10/2026",
    "venueName": "The Adora Center",
    "address": "431 Hoàng Văn Thụ, Phường 4, Tân Bình, TP. Hồ Chí Minh",
    "mapEmbedUrl": "https://maps.google.com",
    "mapDirectLink": "https://maps.google.com",
    "dressCode": "Trắng / Pastel / Be"
  },
  "timeline": [
    { "id": "1", "time": "17:00", "title": "Đón khách & Chụp ảnh", "description": "Chào đón khách quý và chụp ảnh kỷ niệm", "icon": "Camera" },
    { "id": "2", "time": "18:00", "title": "Làm lễ Thành hôn", "description": "Nghi thức trao nhẫn và cắt bánh cưới", "icon": "Heart" },
    { "id": "3", "time": "19:00", "title": "Khai tiệc mừng", "description": "Dùng tiệc cùng gia đình và bạn bè", "icon": "Utensils" },
    { "id": "4", "time": "20:30", "title": "Âm nhạc & Khiêu vũ", "description": "Giao lưu văn nghệ và tung hoa cưới", "icon": "Music" }
  ],
  "gallery": [
    { "id": "1", "url": "https://images.unsplash.com/photo-1519741497674-611481863552", "caption": "Khoảnh khắc hạnh phúc" },
    { "id": "2", "url": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc", "caption": "Nụ cười rạng rỡ" }
  ],
  "rsvp": {
    "enabled": true,
    "deadline": "2026-10-15",
    "note": "Xin vui lòng phản hồi trước ngày 15/10 để chúng mình đón tiếp chu đáo nhất!",
    "allowDietaryNotes": true,
    "allowPlusOnes": true
  },
  "music": {
    "enabled": true,
    "audioUrl": "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3",
    "title": "A Thousand Years - Instrumental",
    "autoPlay": true
  },
  "wishes": {
    "enabled": true,
    "title": "Sổ Lưu Bút & Lời Chúc",
    "subtitle": "Gửi những lời chúc yêu thương nhất tới chúng mình"
  }
}
```

---

## 4. DANH SÁCH FILE CẦN TẠO MỚI HOẶC CẦN SỬA

### 4.1. BACKEND (.NET 10)

#### A. Project `TemplateLandingPage.Domain`
- **File tạo mới**:
  1. `BE/src/Domain/Entities/User.cs`: AggregateRoot đại diện User hệ thống.
  2. `BE/src/Domain/Entities/Template.cs`: AggregateRoot đại diện Master Template.
  3. `BE/src/Domain/Entities/UserCustomization.cs`: AggregateRoot lưu bản tùy biến của user.
  4. `BE/src/Domain/Entities/RsvpEntry.cs`: Entity lưu phản hồi xác nhận tham dự.
  5. `BE/src/Domain/Entities/GuestbookEntry.cs`: Entity lưu lời chúc của khách mời.
  6. `BE/src/Domain/Repositories/IUserRepository.cs`: Repository interface cho User.
  7. `BE/src/Domain/Repositories/ITemplateRepository.cs`: Repository interface cho Template.
  8. `BE/src/Domain/Repositories/ICustomizationRepository.cs`: Repository interface cho Customization.
  9. `BE/src/Domain/Repositories/IRsvpRepository.cs`: Repository interface cho RsvpEntry.
  10. `BE/src/Domain/Repositories/IGuestbookRepository.cs`: Repository interface cho GuestbookEntry.

#### B. Project `TemplateLandingPage.Contract`
- **File tạo mới**:
  1. `BE/src/Contract/Services/V1/Auth/Command.cs`: `RegisterCommand`, `LoginCommand`.
  2. `BE/src/Contract/Services/V1/Auth/Query.cs`: `GetCurrentUserQuery`.
  3. `BE/src/Contract/Services/V1/Auth/Response.cs`: `LoginResponse`, `UserResponse`, `AuthErrors`.
  4. `BE/src/Contract/Services/V1/Users/Command.cs`: `CreateUserCommand`, `UpdateUserCommand`, `DeleteUserCommand`.
  5. `BE/src/Contract/Services/V1/Users/Query.cs`: `GetUsersQuery`, `GetUserByIdQuery`.
  6. `BE/src/Contract/Services/V1/Users/Response.cs`: `UserErrors`.
  7. `BE/src/Contract/Services/V1/Templates/Command.cs`: `CreateTemplateCommand`, `UpdateTemplateCommand`, `DeleteTemplateCommand`.
  8. `BE/src/Contract/Services/V1/Templates/Query.cs`: `GetTemplatesQuery`, `GetTemplateByIdQuery`, `GetTemplateBySlugQuery`.
  9. `BE/src/Contract/Services/V1/Templates/Response.cs`: `TemplateResponse`, `TemplateErrors`.
  10. `BE/src/Contract/Services/V1/Customizations/Command.cs`: `CreateCustomizationCommand`, `UpdateCustomizationCommand`, `DeleteCustomizationCommand`.
  11. `BE/src/Contract/Services/V1/Customizations/Query.cs`: `GetCustomizationByIdQuery`, `GetCustomizationBySlugQuery`, `GetMyCustomizationsQuery`.
  12. `BE/src/Contract/Services/V1/Customizations/Response.cs`: `CustomizationResponse`, `CustomizationErrors`.
  13. `BE/src/Contract/Services/V1/Interactions/Command.cs`: `SubmitRsvpCommand`, `SubmitGuestbookCommand`.
  14. `BE/src/Contract/Services/V1/Interactions/Query.cs`: `GetRsvpsByCustomizationIdQuery`, `GetGuestbookByCustomizationIdQuery`.
  15. `BE/src/Contract/Services/V1/Interactions/Response.cs`: `RsvpResponse`, `GuestbookResponse`.

#### C. Project `TemplateLandingPage.Application`
- **File tạo mới**:
  - *Feature Auth*:
    1. `BE/src/Application/UseCases/V1/Auth/Commands/RegisterCommandHandler.cs`
    2. `BE/src/Application/UseCases/V1/Auth/Commands/RegisterCommandValidator.cs`
    3. `BE/src/Application/UseCases/V1/Auth/Commands/LoginCommandHandler.cs`
    4. `BE/src/Application/UseCases/V1/Auth/Commands/LoginCommandValidator.cs`
    5. `BE/src/Application/UseCases/V1/Auth/Queries/GetCurrentUserQueryHandler.cs`
  - *Feature Users*:
    6. `BE/src/Application/UseCases/V1/Users/Commands/CreateUserCommandHandler.cs`
    7. `BE/src/Application/UseCases/V1/Users/Commands/CreateUserCommandValidator.cs`
    8. `BE/src/Application/UseCases/V1/Users/Commands/UpdateUserCommandHandler.cs`
    9. `BE/src/Application/UseCases/V1/Users/Commands/UpdateUserCommandValidator.cs`
    10. `BE/src/Application/UseCases/V1/Users/Commands/DeleteUserCommandHandler.cs`
    11. `BE/src/Application/UseCases/V1/Users/Queries/GetUsersQueryHandler.cs`
    12. `BE/src/Application/UseCases/V1/Users/Queries/GetUserByIdQueryHandler.cs`
  - *Feature Templates*:
    13. `BE/src/Application/UseCases/V1/Templates/Commands/CreateTemplateCommandHandler.cs`
    14. `BE/src/Application/UseCases/V1/Templates/Commands/CreateTemplateCommandValidator.cs`
    15. `BE/src/Application/UseCases/V1/Templates/Commands/UpdateTemplateCommandHandler.cs`
    16. `BE/src/Application/UseCases/V1/Templates/Commands/UpdateTemplateCommandValidator.cs`
    17. `BE/src/Application/UseCases/V1/Templates/Commands/DeleteTemplateCommandHandler.cs`
    18. `BE/src/Application/UseCases/V1/Templates/Queries/GetTemplatesQueryHandler.cs`
    19. `BE/src/Application/UseCases/V1/Templates/Queries/GetTemplateByIdQueryHandler.cs`
    20. `BE/src/Application/UseCases/V1/Templates/Queries/GetTemplateBySlugQueryHandler.cs`
  - *Feature Customizations*:
    21. `BE/src/Application/UseCases/V1/Customizations/Commands/CreateCustomizationCommandHandler.cs`
    22. `BE/src/Application/UseCases/V1/Customizations/Commands/CreateCustomizationCommandValidator.cs`
    23. `BE/src/Application/UseCases/V1/Customizations/Commands/UpdateCustomizationCommandHandler.cs`
    24. `BE/src/Application/UseCases/V1/Customizations/Commands/UpdateCustomizationCommandValidator.cs`
    25. `BE/src/Application/UseCases/V1/Customizations/Commands/DeleteCustomizationCommandHandler.cs`
    26. `BE/src/Application/UseCases/V1/Customizations/Queries/GetCustomizationByIdQueryHandler.cs`
    27. `BE/src/Application/UseCases/V1/Customizations/Queries/GetCustomizationBySlugQueryHandler.cs`
    28. `BE/src/Application/UseCases/V1/Customizations/Queries/GetMyCustomizationsQueryHandler.cs`
  - *Feature Interactions*:
    29. `BE/src/Application/UseCases/V1/Interactions/Commands/SubmitRsvpCommandHandler.cs`
    30. `BE/src/Application/UseCases/V1/Interactions/Commands/SubmitRsvpCommandValidator.cs`
    31. `BE/src/Application/UseCases/V1/Interactions/Queries/GetRsvpsByCustomizationIdQueryHandler.cs`
    32. `BE/src/Application/UseCases/V1/Interactions/Commands/SubmitGuestbookCommandHandler.cs`
    33. `BE/src/Application/UseCases/V1/Interactions/Commands/SubmitGuestbookCommandValidator.cs`
    34. `BE/src/Application/UseCases/V1/Interactions/Queries/GetGuestbookByCustomizationIdQueryHandler.cs`

#### D. Project `TemplateLandingPage.Infrastructure`
- **File sửa**:
  1. `BE/src/Infrastructure/TemplateLandingPage.Infrastructure.csproj`: Thêm package `System.IdentityModel.Tokens.Jwt` (8.5.0) và `Microsoft.IdentityModel.Tokens` (8.5.0).
  2. `BE/src/Infrastructure/DependencyInjection/Extensions/ServiceCollectionExtensions.cs`: Đăng ký `IPasswordHasher`, `IJwtTokenGenerator`, JwtSettings.
- **File tạo mới**:
  3. `BE/src/Infrastructure/Abstractions/IPasswordHasher.cs`
  4. `BE/src/Infrastructure/Abstractions/IJwtTokenGenerator.cs`
  5. `BE/src/Infrastructure/Services/PasswordHasher.cs` (Sử dụng RFC 2898 PBKDF2 SHA-512 + cryptographic salt).
  6. `BE/src/Infrastructure/Services/JwtTokenGenerator.cs`
  7. `BE/src/Infrastructure/Authentication/JwtSettings.cs`

#### E. Project `TemplateLandingPage.Persistence`
- **File sửa**:
  1. `BE/src/Persistence/Constants/TableNames.cs`: Thêm tên bảng `Users`, `Templates`, `UserCustomizations`, `RsvpEntries`, `GuestbookEntries`.
  2. `BE/src/Persistence/ApplicationDbContext.cs`: Thêm `DbSet<User>`, `DbSet<Template>`, `DbSet<UserCustomization>`, `DbSet<RsvpEntry>`, `DbSet<GuestbookEntry>`.
  3. `BE/src/Persistence/DependencyInjection/Extensions/ServiceCollectionExtensions.cs`: Đăng ký 5 repositories mới.
- **File tạo mới**:
  4. `BE/src/Persistence/Configurations/UserConfiguration.cs`
  5. `BE/src/Persistence/Configurations/TemplateConfiguration.cs`
  6. `BE/src/Persistence/Configurations/UserCustomizationConfiguration.cs`
  7. `BE/src/Persistence/Configurations/RsvpEntryConfiguration.cs`
  8. `BE/src/Persistence/Configurations/GuestbookEntryConfiguration.cs`
  9. `BE/src/Persistence/Repositories/UserRepository.cs`
  10. `BE/src/Persistence/Repositories/TemplateRepository.cs`
  11. `BE/src/Persistence/Repositories/CustomizationRepository.cs`
  12. `BE/src/Persistence/Repositories/RsvpRepository.cs`
  13. `BE/src/Persistence/Repositories/GuestbookRepository.cs`
  14. `BE/src/Persistence/Data/DataSeeder.cs`: Hạt giống khởi tạo Admin, User mẫu, 2 Master Template đầy đủ JSON config.

#### F. Project `TemplateLandingPage.Presentation`
- **File tạo mới**:
  1. `BE/src/Presentation/APIs/Auth/AuthApi.cs`: Endpoint `/api/v1/auth` (Register, Login, Me).
  2. `BE/src/Presentation/APIs/Users/UserApi.cs`: Endpoint `/api/v1/users` (CRUD User).
  3. `BE/src/Presentation/APIs/Templates/TemplateApi.cs`: Endpoint `/api/v1/templates` (CRUD Template, Get By Slug).
  4. `BE/src/Presentation/APIs/Customizations/CustomizationApi.cs`: Endpoint `/api/v1/customizations` (Save, Update, Get by Slug, My).
  5. `BE/src/Presentation/APIs/Interactions/InteractionApi.cs`: Endpoint `/api/v1/rsvp` và `/api/v1/guestbook`.

#### G. Project `TemplateLandingPage.API`
- **File sửa**:
  1. `BE/src/API/TemplateLandingPage.API.csproj`: Thêm Package `Microsoft.AspNetCore.Authentication.JwtBearer` (9.0.2).
  2. `BE/src/API/appsettings.json`: Bổ sung khối `Jwt` (Issuer, Audience, SecretKey, ExpirationMinutes).
  3. `BE/src/API/Program.cs`: Cấu hình JWT Bearer Authentication, Authorization, Swagger Security Definition (Bearer), gọi `DataSeeder` khi chạy Development.

#### H. Project `TemplateLandingPage.UnitTests`
- **File tạo mới**:
  1. `BE/test/UnitTests/Application/Auth/LoginCommandHandlerTests.cs`
  2. `BE/test/UnitTests/Application/Auth/RegisterCommandHandlerTests.cs`
  3. `BE/test/UnitTests/Application/Templates/CreateTemplateCommandHandlerTests.cs`
  4. `BE/test/UnitTests/Application/Customizations/CreateCustomizationCommandHandlerTests.cs`

---

### 4.2. FRONTEND (React 19 + Vite + Tailwind CSS)

#### A. Tầng API Services (`FE/src/api/`)
- **File sửa**:
  1. `FE/src/api/axios.js`: Đính kèm `Authorization: Bearer <token>` từ `localStorage` vào header request; bắt 401 tự động logout & chuyển hướng.
- **File tạo mới**:
  2. `FE/src/api/authApi.js`: `login`, `register`, `getMe`.
  3. `FE/src/api/userApi.js`: `getUsers`, `getUserById`, `createUser`, `updateUser`, `deleteUser`.
  4. `FE/src/api/templateApi.js`: `getTemplates`, `getTemplateById`, `getTemplateBySlug`, `createTemplate`, `updateTemplate`, `deleteTemplate`.
  5. `FE/src/api/customizationApi.js`: `saveCustomization`, `getCustomizationById`, `getCustomizationBySlug`, `getMyCustomizations`, `updateCustomization`, `deleteCustomization`.
  6. `FE/src/api/interactionApi.js`: `submitRsvp`, `getRsvps`, `submitGuestbook`, `getGuestbook`.

#### B. Contexts & Hooks (`FE/src/contexts/`, `FE/src/hooks/`)
- **File tạo mới**:
  1. `FE/src/contexts/AuthContext.jsx`: Quản lý state đăng nhập, user profile, token, `login()`, `register()`, `logout()`, `isAdmin`.
  2. `FE/src/hooks/useAuth.js`: Hook tiện ích truy xuất AuthContext.

#### C. Components Dùng Chung & Layout (`FE/src/components/`)
- **File sửa**:
  1. `FE/src/components/Navbar.jsx`: Bổ sung điều hướng Templates, Dashboard Admin (nếu Role Admin), User Menu (Avatar, My Sites, Đăng xuất), Đăng nhập/Đăng ký.
  2. `FE/src/components/Footer.jsx`: Cập nhật UI hiện đại phong cách motionsites.ai.
- **File tạo mới**:
  3. `FE/src/components/ProtectedRoute.jsx`: Bảo vệ route theo authentication và phân quyền role (`requireAdmin`).
  4. `FE/src/components/templates/TemplateCard.jsx`: Card hiển thị template kèm thumbnail, badge danh mục, hiệu ứng hover, nút Preview và Tùy biến.
  5. `FE/src/components/templates/QuickPreviewModal.jsx`: Modal popup Live Preview có toggle chuyển đổi linh hoạt Desktop (100%) và Mobile Frame (375px).
  6. `FE/src/components/templates/LandingPageRenderer.jsx`: Engine trung tâm nhận bất kỳ `config` JSON nào và render trọn vẹn Landing Page thực tế:
     - Hero Section (Badge, đếm ngược Countdown đến ngày cưới/sinh nhật, nút CTA cuộn nhanh đến RSVP).
     - Couple/Celebrant Section (Avatar, tiểu sử, thông tin cha mẹ, câu nói ý nghĩa).
     - Event Details Section (Thời gian, địa điểm The Adora Center / Sky Lounge, bản đồ chỉ đường, dress code).
     - Interactive Timeline (Các mốc thời gian kèm icon Lucide).
     - Photo Gallery (Lưới ảnh kỷ niệm kèm xem phóng to Lightbox).
     - RSVP Section (Form gửi xác nhận tham dự, số lượng khách, chế độ ăn).
     - Sổ Lưu Bút / Guestbook Wall (Form để lại lời chúc và hiển thị danh sách lời chúc).
  7. `FE/src/components/templates/FloatingMusicPlayer.jsx`: Nút phát nhạc nổi góc màn hình kèm sóng âm chuyển động, play/pause, tắt mở âm thanh.
  8. `FE/src/components/templates/MotionParticles.jsx`: Canvas hiệu ứng chuyển động cánh hoa rơi (Wedding) hoặc pháo hoa giấy confetti bay lơ lửng (Birthday).
  9. `FE/src/components/customizer/CustomizerSidebar.jsx`: Bảng điều khiển tùy biến chia tab trực quan:
     - Tab Giao diện (Theme): Chọn bảng màu preset, color picker, đổi font chữ, hiệu ứng hạt.
     - Tab Hero: Đổi tiêu đề, phụ đề, ngày giờ, ảnh bìa, badge.
     - Tab Nhân vật chính (Couple/Celebrant): Đổi tên, ảnh đại diện, tiểu sử, cha mẹ.
     - Tab Sự kiện: Đổi địa điểm, thời gian, bản đồ, dress code.
     - Tab Lịch trình (Timeline): Thêm/sửa/xóa mốc thời gian, icon, mô tả.
     - Tab Album ảnh (Gallery): Thêm/xóa ảnh, caption.
     - Tab RSVP: Bật/tắt, hạn chót phản hồi, ghi chú.
     - Tab Nhạc nền (Music): Bật/tắt, đổi link MP3, tiêu đề bài hát.
     - Tab Lời chúc (Wishes): Bật/tắt sổ lưu bút.
  10. `FE/src/components/customizer/CustomizerToolbar.jsx`: Thanh công cụ trên đầu Customizer: Toggle Preview Desktop / Mobile, Nút Lưu cấu hình, Tải JSON cấu hình, Xuất Standalone HTML, Xem toàn màn hình.
  11. `FE/src/components/admin/AdminLayout.jsx`: Layout quản trị với Sidebar điều hướng (Thống kê, Quản lý Master Templates, Quản lý Users), Topbar chứa thông tin Admin.

#### D. Tiện Ích (`FE/src/utils/`)
- **File tạo mới**:
  1. `FE/src/utils/defaultTemplates.js`: Chứa mẫu JSON cấu hình mặc định phong phú cho Wedding ("Elegance Blossom") và Birthday ("Golden Glamour").
  2. `FE/src/utils/htmlExporter.js`: Hàm xuất trọn vẹn file HTML độc lập (`standalone-template.html`) chứa:
     - Toàn bộ cấu trúc HTML5 sạch.
     - Google Fonts nạp đúng font chữ đã chọn.
     - Tailwind CSS inline/CDN.
     - Dữ liệu JSON cấu hình nhúng trực tiếp.
     - Script JS cho Countdown, Music player, Form tương tác RSVP/Wishes, và hiệu ứng cánh hoa/confetti chuyển động mượt mà.
     - Người dùng tải về có thể double click mở ngay offline hoặc upload lên static host.

#### E. Pages (`FE/src/pages/`)
- **File sửa**:
  1. `FE/src/pages/HomePage.jsx`: Thiết kế lại mang tinh thần motionsites.ai: Hero chuyển động, Floating Badges, Giới thiệu tính năng, Showcase các template cưới & sinh nhật đẹp nhất, Các bước tùy biến chỉ với 3 phút, CTA kêu gọi sử dụng.
- **File tạo mới**:
  2. `FE/src/pages/TemplatesPage.jsx`: Bộ sưu tập templates với tab phân loại (Tất cả, Đám cưới, Sinh nhật), thanh tìm kiếm, grid card template, nút Live Preview và nút Tùy biến.
  3. `FE/src/pages/CustomizerPage.jsx`: Không gian Customizer thời gian thực: Bên trái là Form tùy biến (Sidebar), Bên phải là Live Canvas hiển thị thay đổi ngay tức thì, hỗ trợ chuyển khung Desktop/Mobile.
  4. `FE/src/pages/LivePreviewPage.jsx`: Trang xem toàn màn hình Live Landing Page (hỗ trợ cả template gốc `/preview/:templateId` và bản tùy biến đã xuất bản `/view/:slug`).
  5. `FE/src/pages/MyCustomizationsPage.jsx`: Trang danh sách thiệp đã tạo của người dùng, xem lại link chia sẻ, tiếp tục sửa hoặc tải file.
  6. `FE/src/pages/auth/LoginPage.jsx`: Trang đăng nhập giao diện sang trọng.
  7. `FE/src/pages/auth/RegisterPage.jsx`: Trang đăng ký tài khoản mới.
  8. `FE/src/pages/admin/AdminDashboardPage.jsx`: Bảng điều khiển thống kê (Tổng templates, tổng người dùng, tổng phản hồi RSVP, tổng lời chúc).
  9. `FE/src/pages/admin/AdminTemplatesPage.jsx`: Quản lý danh sách Master Templates (Tạo mới, chỉnh sửa thông tin & JSON config với syntax highlighter/trình biên tập JSON, xóa, đổi trạng thái).
  10. `FE/src/pages/admin/AdminUsersPage.jsx`: Quản lý danh sách Users (Thêm user, cập nhật phân quyền Admin/User, khóa tài khoản, đổi mật khẩu).

#### F. Routes & Styling (`FE/src/routes/`, `FE/src/`)
- **File sửa**:
  1. `FE/src/routes/index.jsx`: Thiết lập toàn bộ định tuyến:
     - Public: `/`, `/templates`, `/preview/:templateId`, `/view/:slug`, `/login`, `/register`.
     - Protected: `/customize/:templateId`, `/my-sites`.
     - Admin Protected: `/admin`, `/admin/templates`, `/admin/users`.
  2. `FE/src/App.jsx`: Bọc `AuthProvider`, cấu hình Header/Footer hiển thị thông minh (ẩn Navbar/Footer khi ở chế độ Full Preview hoặc Customizer chia đôi màn hình).
  3. `FE/src/index.css`: Thêm nạp font Google Fonts ("Playfair Display", "Cinzel", "Montserrat", "Great Vibes"), hiệu ứng animation hạt chuyển động (`@keyframes float`, `@keyframes pulse-slow`).

---

## 5. CHỮ KÝ HÀM, INTERFACES, DTOS & CQRS

### 5.1. Domain Entities & Repositories

#### `User.cs`
```csharp
namespace TemplateLandingPage.Domain.Entities;

public sealed class User : AggregateRoot<Guid>, IAuditableEntity, ISoftDelete
{
    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public string FullName { get; private set; } = string.Empty;
    public string Role { get; private set; } = "User"; // "Admin", "User"
    public bool IsActive { get; private set; } = true;
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? ModifiedAtUtc { get; set; }

    public static User Create(string email, string passwordHash, string fullName, string role);
    public void UpdateProfile(string fullName, string role, bool isActive);
    public void ChangePassword(string newPasswordHash);
    public void Delete();
}
```

#### `Template.cs`
```csharp
namespace TemplateLandingPage.Domain.Entities;

public sealed class Template : AggregateRoot<Guid>, IAuditableEntity, ISoftDelete
{
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string Category { get; private set; } = "Wedding"; // "Wedding", "Birthday"
    public string ThumbnailUrl { get; private set; } = string.Empty;
    public string? PreviewUrl { get; private set; }
    public string DefaultConfigJson { get; private set; } = string.Empty;
    public bool IsActive { get; private set; } = true;
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? ModifiedAtUtc { get; set; }

    public static Template Create(string name, string slug, string? description, string category, string thumbnailUrl, string? previewUrl, string defaultConfigJson);
    public void Update(string name, string slug, string? description, string category, string thumbnailUrl, string? previewUrl, string defaultConfigJson, bool isActive);
    public void Delete();
}
```

#### `UserCustomization.cs`
```csharp
namespace TemplateLandingPage.Domain.Entities;

public sealed class UserCustomization : AggregateRoot<Guid>, IAuditableEntity, ISoftDelete
{
    public Guid? UserId { get; private set; }
    public Guid TemplateId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string ConfigJson { get; private set; } = string.Empty;
    public bool IsPublished { get; private set; } = true;
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? ModifiedAtUtc { get; set; }

    public static UserCustomization Create(Guid? userId, Guid templateId, string title, string slug, string configJson, bool isPublished);
    public void Update(string title, string slug, string configJson, bool isPublished);
    public void Delete();
}
```

#### `RsvpEntry.cs` & `GuestbookEntry.cs`
```csharp
namespace TemplateLandingPage.Domain.Entities;

public sealed class RsvpEntry : Entity<Guid>
{
    public Guid? CustomizationId { get; private set; }
    public string GuestName { get; private set; } = string.Empty;
    public string? Email { get; private set; }
    public string? Phone { get; private set; }
    public string AttendingStatus { get; private set; } = "attending"; // "attending", "declined"
    public int NumberOfGuests { get; private set; } = 1;
    public string? DietaryNotes { get; private set; }
    public string? Wishes { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }

    public static RsvpEntry Create(Guid? customizationId, string guestName, string? email, string? phone, string attendingStatus, int numberOfGuests, string? dietaryNotes, string? wishes);
}

public sealed class GuestbookEntry : Entity<Guid>
{
    public Guid? CustomizationId { get; private set; }
    public string SenderName { get; private set; } = string.Empty;
    public string Message { get; private set; } = string.Empty;
    public DateTime CreatedAtUtc { get; private set; }

    public static GuestbookEntry Create(Guid? customizationId, string senderName, string message);
}
```

#### Repository Interfaces
```csharp
namespace TemplateLandingPage.Domain.Repositories;

public interface IUserRepository : IRepositoryBase<User, Guid>
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default);
}

public interface ITemplateRepository : IRepositoryBase<Template, Guid>
{
    Task<Template?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<bool> ExistsBySlugAsync(string slug, CancellationToken cancellationToken = default);
}

public interface ICustomizationRepository : IRepositoryBase<UserCustomization, Guid>
{
    Task<UserCustomization?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<List<UserCustomization>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<bool> ExistsBySlugAsync(string slug, CancellationToken cancellationToken = default);
}

public interface IRsvpRepository : IRepositoryBase<RsvpEntry, Guid>
{
    Task<List<RsvpEntry>> GetByCustomizationIdAsync(Guid customizationId, CancellationToken cancellationToken = default);
}

public interface IGuestbookRepository : IRepositoryBase<GuestbookEntry, Guid>
{
    Task<List<GuestbookEntry>> GetByCustomizationIdAsync(Guid customizationId, CancellationToken cancellationToken = default);
}
```

---

### 5.2. Contract Commands, Queries & Responses

#### Feature Auth
```csharp
namespace TemplateLandingPage.Contract.Services.V1.Auth;

public record RegisterCommand(string Email, string Password, string FullName) : ICommand<Guid>;
public record LoginCommand(string Email, string Password) : ICommand<LoginResponse>;
public record GetCurrentUserQuery(Guid UserId) : IQuery<UserResponse>;

public record LoginResponse(string Token, UserResponse User);
public record UserResponse(Guid Id, string Email, string FullName, string Role, bool IsActive, DateTime CreatedAtUtc);

public static class AuthErrors
{
    public static readonly Error DuplicateEmail = new("Auth.DuplicateEmail", "Email đã tồn tại trong hệ thống.");
    public static readonly Error InvalidCredentials = new("Auth.InvalidCredentials", "Email hoặc mật khẩu không chính xác.");
    public static readonly Error UserInactive = new("Auth.UserInactive", "Tài khoản của bạn đã bị khóa.");
}
```

#### Feature Users
```csharp
namespace TemplateLandingPage.Contract.Services.V1.Users;

public record GetUsersQuery() : IQuery<List<UserResponse>>;
public record GetUserByIdQuery(Guid Id) : IQuery<UserResponse>;
public record CreateUserCommand(string Email, string Password, string FullName, string Role) : ICommand<Guid>;
public record UpdateUserCommand(Guid Id, string FullName, string Role, bool IsActive) : ICommand;
public record DeleteUserCommand(Guid Id) : ICommand;

public static class UserErrors
{
    public static readonly Error NotFound = new("User.NotFound", "Không tìm thấy người dùng.");
    public static readonly Error CannotDeleteSelf = new("User.CannotDeleteSelf", "Không thể xóa tài khoản hiện tại đang đăng nhập.");
}
```

#### Feature Templates
```csharp
namespace TemplateLandingPage.Contract.Services.V1.Templates;

public record GetTemplatesQuery(string? Category, bool? IsActiveOnly) : IQuery<List<TemplateResponse>>;
public record GetTemplateByIdQuery(Guid Id) : IQuery<TemplateResponse>;
public record GetTemplateBySlugQuery(string Slug) : IQuery<TemplateResponse>;
public record CreateTemplateCommand(string Name, string Slug, string? Description, string Category, string ThumbnailUrl, string? PreviewUrl, string DefaultConfigJson) : ICommand<Guid>;
public record UpdateTemplateCommand(Guid Id, string Name, string Slug, string? Description, string Category, string ThumbnailUrl, string? PreviewUrl, string DefaultConfigJson, bool IsActive) : ICommand;
public record DeleteTemplateCommand(Guid Id) : ICommand;

public record TemplateResponse(Guid Id, string Name, string Slug, string? Description, string Category, string ThumbnailUrl, string? PreviewUrl, string DefaultConfigJson, bool IsActive, DateTime CreatedAtUtc);

public static class TemplateErrors
{
    public static readonly Error NotFound = new("Template.NotFound", "Không tìm thấy template.");
    public static readonly Error DuplicateSlug = new("Template.DuplicateSlug", "Slug đã tồn tại, vui lòng chọn slug khác.");
    public static readonly Error InvalidConfigJson = new("Template.InvalidConfigJson", "Cấu hình JSON không hợp lệ.");
}
```

#### Feature Customizations
```csharp
namespace TemplateLandingPage.Contract.Services.V1.Customizations;

public record GetCustomizationByIdQuery(Guid Id) : IQuery<CustomizationResponse>;
public record GetCustomizationBySlugQuery(string Slug) : IQuery<CustomizationResponse>;
public record GetMyCustomizationsQuery(Guid UserId) : IQuery<List<CustomizationResponse>>;
public record CreateCustomizationCommand(Guid? UserId, Guid TemplateId, string Title, string Slug, string ConfigJson, bool IsPublished) : ICommand<Guid>;
public record UpdateCustomizationCommand(Guid Id, string Title, string Slug, string ConfigJson, bool IsPublished) : ICommand;
public record DeleteCustomizationCommand(Guid Id) : ICommand;

public record CustomizationResponse(Guid Id, Guid? UserId, Guid TemplateId, string TemplateName, string Title, string Slug, string ConfigJson, bool IsPublished, DateTime CreatedAtUtc);

public static class CustomizationErrors
{
    public static readonly Error NotFound = new("Customization.NotFound", "Không tìm thấy bản tùy biến.");
    public static readonly Error DuplicateSlug = new("Customization.DuplicateSlug", "Đường dẫn (slug) này đã được sử dụng.");
}
```

#### Feature Interactions
```csharp
namespace TemplateLandingPage.Contract.Services.V1.Interactions;

public record SubmitRsvpCommand(Guid? CustomizationId, string GuestName, string? Email, string? Phone, string AttendingStatus, int NumberOfGuests, string? DietaryNotes, string? Wishes) : ICommand<Guid>;
public record GetRsvpsByCustomizationIdQuery(Guid CustomizationId) : IQuery<List<RsvpResponse>>;

public record SubmitGuestbookCommand(Guid? CustomizationId, string SenderName, string Message) : ICommand<Guid>;
public record GetGuestbookByCustomizationIdQuery(Guid CustomizationId) : IQuery<List<GuestbookResponse>>;

public record RsvpResponse(Guid Id, Guid? CustomizationId, string GuestName, string? Email, string? Phone, string AttendingStatus, int NumberOfGuests, string? DietaryNotes, string? Wishes, DateTime CreatedAtUtc);
public record GuestbookResponse(Guid Id, Guid? CustomizationId, string SenderName, string Message, DateTime CreatedAtUtc);
```

---

### 5.3. Infrastructure Services
```csharp
namespace TemplateLandingPage.Infrastructure.Abstractions;

public interface IPasswordHasher
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string passwordHash);
}

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}
```

---

### 5.4. Minimal API Endpoints (Presentation Layer)
Tất cả endpoint kế thừa `IEndpoint` và tự động gom nhóm:
1. `AuthApi`:
   - `POST /api/v1/auth/register` (Anonymous)
   - `POST /api/v1/auth/login` (Anonymous)
   - `GET /api/v1/auth/me` (Authenticated)
2. `UserApi`:
   - `GET /api/v1/users` (Admin)
   - `GET /api/v1/users/{id:guid}` (Admin)
   - `POST /api/v1/users` (Admin)
   - `PUT /api/v1/users/{id:guid}` (Admin)
   - `DELETE /api/v1/users/{id:guid}` (Admin)
3. `TemplateApi`:
   - `GET /api/v1/templates` (Public)
   - `GET /api/v1/templates/{id:guid}` (Public)
   - `GET /api/v1/templates/slug/{slug}` (Public)
   - `POST /api/v1/templates` (Admin)
   - `PUT /api/v1/templates/{id:guid}` (Admin)
   - `DELETE /api/v1/templates/{id:guid}` (Admin)
4. `CustomizationApi`:
   - `GET /api/v1/customizations/{id:guid}` (Public)
   - `GET /api/v1/customizations/slug/{slug}` (Public)
   - `GET /api/v1/customizations/my` (Authenticated)
   - `POST /api/v1/customizations` (Allow Authenticated or Guest)
   - `PUT /api/v1/customizations/{id:guid}` (Owner/Admin)
   - `DELETE /api/v1/customizations/{id:guid}` (Owner/Admin)
5. `InteractionApi`:
   - `POST /api/v1/rsvp` (Public)
   - `GET /api/v1/rsvp/{customizationId:guid}` (Owner/Admin)
   - `POST /api/v1/guestbook` (Public)
   - `GET /api/v1/guestbook/{customizationId:guid}` (Public)

---

## 6. CÁC TRƯỜNG HỢP BIÊN BẮT BUỘC PHẢI XỬ LÝ (EDGE CASES)

1. **Bảo mật & Phân quyền Admin**:
   - Khi token hết hạn hoặc không hợp lệ: Interceptor phía frontend phải lập tức hủy session trong `localStorage`, cập nhật `AuthContext`, và redirect về trang `/login`.
   - Người dùng thường cố tình gõ link `/admin/*`: `ProtectedRoute` chặn lại ngay lập tức và redirect về trang chủ hoặc báo không có quyền hạn.
2. **Cấu hình JSON hỏng hoặc thiếu trường (Corrupted JSON / Null Schema)**:
   - Trong `LandingPageRenderer.jsx`: Luôn sử dụng optional chaining (`config?.timeline ?? []`, `config?.gallery ?? []`) và có đối tượng fallback mặc định để trang không bao giờ bị trắng màn hình (White Screen of Death).
   - Trong Admin Template Form: Bắt buộc parse `JSON.parse(configJson)` để kiểm tra tính hợp lệ trước khi cho phép gửi API lưu Master Template.
3. **Trùng lặp Slug (Slug Collision)**:
   - Khi tạo Customization hoặc Master Template: Nếu người dùng nhập slug đã tồn tại, Handler kiểm tra qua `ExistsBySlugAsync`. Nếu trùng lặp, trả về `Result.Failure(DuplicateSlug)`. Phía UI tự động gợi ý thêm hậu tố ngẫu nhiên (ví dụ `minh-linh-2026`).
4. **Trình duyệt chặn phát âm thanh tự động (Browser Autoplay Policy)**:
   - Trình duyệt hiện đại (Chrome/Edge/Safari) chặn phát nhạc trước khi có tương tác người dùng.
   - `FloatingMusicPlayer` bắt lỗi `.catch(e => ...)` khi gọi `audio.play()`, chuyển trạng thái sang tạm dừng và hiển thị icon mời người dùng click một chạm để bật nhạc.
5. **Ảnh bị lỗi hoặc không tải được (Broken Image URLs)**:
   - Áp dụng `onError` fallback về ảnh placeholder (Unsplash avatar/wedding mockup) để giao diện luôn hoàn mỹ, không bị vỡ bố cục.
6. **Xuất Standalone HTML không cần Internet**:
   - File HTML xuất ra sử dụng cấu trúc độc lập kèm các script xử lý Countdown, audio player, và hiệu ứng cánh hoa/confetti viết thuần JS nhúng trực tiếp trong `<script>`. Dữ liệu cấu hình được serialize an toàn dạng JSON, không bị lỗi escape ký tự đặc biệt (`<`, `>`, `&`).
7. **Responsive & Mobile Viewport trong Customizer**:
   - Khi chuyển sang chế độ Mobile trong Customizer: Canvas bao bọc bên trong khung mô phỏng điện thoại rộng 375px có viền mỏng và thanh cuộn ẩn tinh tế. Đảm bảo toàn bộ hiệu ứng chuyển động và nội dung co giãn trơn tru không bị giật lag hay vỡ layout ngang (`overflow-x-hidden`).

---

## 7. CHIẾN LƯỢC KIỂM THỬ (TEST PLAN)

1. **Kiểm tra kiến trúc (.NET NetArchTest)**:
   - Tiếp tục bảo đảm 5 quy tắc kiến trúc trong `ArchitectureTests.cs`:
     - Domain không reference tầng khác.
     - Contract không reference tầng lõi.
     - Application không reference tầng ngoài.
     - Tất cả Handler kết thúc bằng chữ `Handler`.
     - Presentation không phụ thuộc trực tiếp `ApplicationDbContext`.
2. **Unit Tests Backend**:
   - `RegisterCommandHandlerTests`: Test đăng ký thành công, test thất bại khi trùng email.
   - `LoginCommandHandlerTests`: Test đăng nhập đúng mật khẩu, test thất bại khi sai mật khẩu hoặc tài khoản bị khóa.
   - `CreateTemplateCommandHandlerTests`: Test tạo master template thành công, test lỗi khi trùng slug.
   - `CreateCustomizationCommandHandlerTests`: Test lưu cấu hình cá nhân hóa thành công.
3. **Build Frontend**:
   - Chạy `npm run build` kiểm tra không có lỗi cú pháp, không có import thừa, module bundle thành công.
