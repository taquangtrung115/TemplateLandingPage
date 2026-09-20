# BÁO CÁO BÀN GIAO MÃ NGUỒN (CHANGE LOG)
**Tính năng**: Clone UI Cinelove & Dynamic Navigation Menu Engine  
**Thời gian thực hiện**: 2026-09-20  
**Vai trò**: Coder (Senior Implementation Engineer)  

---

## 1. DANH SÁCH FILE ĐÃ THAY ĐỔI / TẠO MỚI

### 1.1. Backend (.NET 10 Clean Architecture)

#### Domain Layer (`BE/src/Domain/`)
- `BE/src/Domain/Entities/Category.cs` *(Tạo mới)*: Thực thể Category quản lý danh mục thiệp với Name, Slug, Description, Icon, OrderIndex, IsActive.
- `BE/src/Domain/Entities/NavigationMenu.cs` *(Tạo mới)*: Thực thể NavigationMenu quản lý hệ thống menu cha & submenu phân cấp với ParentId, OrderIndex, Target, Badge, BadgeColor, Icon, IsActive.
- `BE/src/Domain/Repositories/ICategoryRepository.cs` *(Tạo mới)*: Interface repository cho danh mục (`GetBySlugAsync`, `ExistsBySlugAsync`, `GetAllOrderedAsync`, `HasAssociatedTemplatesAsync`).
- `BE/src/Domain/Repositories/INavigationMenuRepository.cs` *(Tạo mới)*: Interface repository cho menu động (`GetTreeAsync`, `HasChildrenAsync`).
- `BE/src/Domain/Entities/Template.cs` *(Chỉnh sửa)*: Bổ sung các trường `CategoryId`, `CategoryRef`, `Badge`, `AudioUrl`, `MusicTitle`, `LongPreviewUrl`; cập nhật factory `Create` và `Update`.
- `BE/src/Domain/Repositories/ITemplateRepository.cs` *(Chỉnh sửa)*: Mở rộng `GetListAsync` hỗ trợ lọc theo Category, CategoryId, Badge, Search, IsActiveOnly.

#### Contract Layer (`BE/src/Contract/`)
- `BE/src/Contract/Services/V1/Categories/Command.cs` *(Tạo mới)*: CQRS Commands cho Category (`CreateCategoryCommand`, `UpdateCategoryCommand`, `DeleteCategoryCommand`).
- `BE/src/Contract/Services/V1/Categories/Query.cs` *(Tạo mới)*: CQRS Queries cho Category (`GetCategoriesQuery`, `GetCategoryByIdQuery`, `GetCategoryBySlugQuery`).
- `BE/src/Contract/Services/V1/Categories/Response.cs` *(Tạo mới)*: DTO `CategoryResponse` và định nghĩa lỗi `CategoryErrors`.
- `BE/src/Contract/Services/V1/NavigationMenus/Command.cs` *(Tạo mới)*: CQRS Commands cho Menu (`CreateNavigationMenuCommand`, `UpdateNavigationMenuCommand`, `DeleteNavigationMenuCommand`).
- `BE/src/Contract/Services/V1/NavigationMenus/Query.cs` *(Tạo mới)*: CQRS Queries cho Menu (`GetNavigationMenusQuery`, `GetNavigationMenuByIdQuery`).
- `BE/src/Contract/Services/V1/NavigationMenus/Response.cs` *(Tạo mới)*: DTO `NavigationMenuResponse` kèm cây `SubMenus` và lỗi `NavigationMenuErrors`.
- `BE/src/Contract/Services/V1/Templates/Command.cs` *(Chỉnh sửa)*: Bổ sung `CategoryId`, `LongPreviewUrl`, `Badge`, `AudioUrl`, `MusicTitle` vào Create và Update Command.
- `BE/src/Contract/Services/V1/Templates/Query.cs` *(Chỉnh sửa)*: Bổ sung bộ lọc `CategoryId`, `Badge`, `Search` vào `GetTemplatesQuery`.
- `BE/src/Contract/Services/V1/Templates/Response.cs` *(Chỉnh sửa)*: Bổ sung `CategoryId`, `LongPreviewUrl`, `Badge`, `AudioUrl`, `MusicTitle` vào `TemplateResponse`.

#### Application Layer (`BE/src/Application/`)
- `BE/src/Application/UseCases/V1/Categories/Commands/CreateCategoryCommandHandler.cs` *(Tạo mới)*: Xử lý tạo danh mục, kiểm tra trùng slug.
- `BE/src/Application/UseCases/V1/Categories/Commands/CreateCategoryCommandValidator.cs` *(Tạo mới)*: FluentValidation cho Create Category.
- `BE/src/Application/UseCases/V1/Categories/Commands/UpdateCategoryCommandHandler.cs` *(Tạo mới)*: Xử lý cập nhật danh mục.
- `BE/src/Application/UseCases/V1/Categories/Commands/UpdateCategoryCommandValidator.cs` *(Tạo mới)*: FluentValidation cho Update Category.
- `BE/src/Application/UseCases/V1/Categories/Commands/DeleteCategoryCommandHandler.cs` *(Tạo mới)*: Xử lý xóa danh mục an toàn, chặn xóa nếu có template đang dùng.
- `BE/src/Application/UseCases/V1/Categories/Queries/GetCategoriesQueryHandler.cs` *(Tạo mới)*: Truy vấn danh mục kèm thống kê số template đang dùng.
- `BE/src/Application/UseCases/V1/Categories/Queries/GetCategoryByIdQueryHandler.cs` *(Tạo mới)*: Truy vấn danh mục theo Id.
- `BE/src/Application/UseCases/V1/Categories/Queries/GetCategoryBySlugQueryHandler.cs` *(Tạo mới)*: Truy vấn danh mục theo Slug.
- `BE/src/Application/UseCases/V1/NavigationMenus/Commands/CreateNavigationMenuCommandHandler.cs` *(Tạo mới)*: Xử lý tạo menu, kiểm tra ParentId hợp lệ.
- `BE/src/Application/UseCases/V1/NavigationMenus/Commands/CreateNavigationMenuCommandValidator.cs` *(Tạo mới)*: FluentValidation cho Create Menu.
- `BE/src/Application/UseCases/V1/NavigationMenus/Commands/UpdateNavigationMenuCommandHandler.cs` *(Tạo mới)*: Xử lý sửa menu, kiểm tra vòng lặp tự làm cha (`CannotBeSelfParent`).
- `BE/src/Application/UseCases/V1/NavigationMenus/Commands/UpdateNavigationMenuCommandValidator.cs` *(Tạo mới)*: FluentValidation cho Update Menu.
- `BE/src/Application/UseCases/V1/NavigationMenus/Commands/DeleteNavigationMenuCommandHandler.cs` *(Tạo mới)*: Xử lý xóa menu, chặn xóa nếu đang có menu con (`HasChildMenus`).
- `BE/src/Application/UseCases/V1/NavigationMenus/Queries/GetNavigationMenusQueryHandler.cs` *(Tạo mới)*: Xây dựng và trả về cây menu phân cấp đệ quy.
- `BE/src/Application/UseCases/V1/NavigationMenus/Queries/GetNavigationMenuByIdQueryHandler.cs` *(Tạo mới)*: Truy vấn menu theo Id kèm danh sách submenu con.
- `BE/src/Application/UseCases/V1/Templates/Commands/CreateTemplateCommandHandler.cs` *(Chỉnh sửa)*: Tiếp nhận các thuộc tính mới của Template khi tạo.
- `BE/src/Application/UseCases/V1/Templates/Commands/UpdateTemplateCommandHandler.cs` *(Chỉnh sửa)*: Tiếp nhận các thuộc tính mới của Template khi cập nhật.
- `BE/src/Application/UseCases/V1/Templates/Queries/GetTemplatesQueryHandler.cs` *(Chỉnh sửa)*: Áp dụng các bộ lọc mới và map đầy đủ trường vào Response.
- `BE/src/Application/UseCases/V1/Templates/Queries/GetTemplateByIdQueryHandler.cs` *(Chỉnh sửa)*: Map các trường mới vào Response.
- `BE/src/Application/UseCases/V1/Templates/Queries/GetTemplateBySlugQueryHandler.cs` *(Chỉnh sửa)*: Map các trường mới vào Response.

#### Persistence Layer (`BE/src/Persistence/`)
- `BE/src/Persistence/Constants/TableNames.cs` *(Chỉnh sửa)*: Thêm constants `Categories` và `NavigationMenus`.
- `BE/src/Persistence/Configurations/CategoryConfiguration.cs` *(Tạo mới)*: Cấu hình bảng Categories, Unique Index Slug, soft delete query filter.
- `BE/src/Persistence/Configurations/NavigationMenuConfiguration.cs` *(Tạo mới)*: Cấu hình bảng NavigationMenus, quan hệ tự tham chiếu Parent-SubMenus với `DeleteBehavior.Restrict`.
- `BE/src/Persistence/Configurations/TemplateConfiguration.cs` *(Chỉnh sửa)*: Cấu hình quan hệ với Category (`OnDelete(DeleteBehavior.SetNull)`), cấu hình các cột `Badge`, `AudioUrl`, `MusicTitle`, `LongPreviewUrl`.
- `BE/src/Persistence/Repositories/CategoryRepository.cs` *(Tạo mới)*: Triển khai EF Core cho ICategoryRepository.
- `BE/src/Persistence/Repositories/NavigationMenuRepository.cs` *(Tạo mới)*: Triển khai EF Core cho INavigationMenuRepository (lấy cây menu phân cấp).
- `BE/src/Persistence/Repositories/TemplateRepository.cs` *(Chỉnh sửa)*: Triển khai `GetListAsync` hỗ trợ lọc theo Category/CategoryId, Badge, Search, IsActiveOnly.
- `BE/src/Persistence/ApplicationDbContext.cs` *(Chỉnh sửa)*: Thêm `DbSet<Category> Categories` và `DbSet<NavigationMenu> NavigationMenus`.
- `BE/src/Persistence/DependencyInjection/Extensions/ServiceCollectionExtensions.cs` *(Chỉnh sửa)*: Đăng ký DI cho `ICategoryRepository` và `INavigationMenuRepository`.
- `BE/src/Persistence/Data/DataSeeder.cs` *(Chỉnh sửa)*: Nạp sẵn 5 danh mục chuẩn Cinelove, hệ thống menu cha và submenu mẫu, 6 mẫu thiệp phong phú kèm âm thanh và hình ảnh mockup.

#### Presentation Layer (`BE/src/Presentation/`)
- `BE/src/Presentation/APIs/Categories/CategoryApi.cs` *(Tạo mới)*: Minimal API `/api/v1/categories` (CRUD danh mục).
- `BE/src/Presentation/APIs/NavigationMenus/NavigationMenuApi.cs` *(Tạo mới)*: Minimal API `/api/v1/menus` (CRUD menu phân cấp).
- `BE/src/Presentation/APIs/Templates/TemplateApi.cs` *(Chỉnh sửa)*: Nhận thêm query parameters (`categoryId`, `badge`, `search`) và mở rộng `UpdateTemplateRequest`.

#### Tests Layer (`BE/test/`)
- `BE/test/UnitTests/Application/Categories/CategoryCommandHandlerTests.cs` *(Tạo mới)*: Unit tests cho Create, Update, Delete Category.
- `BE/test/UnitTests/Application/NavigationMenus/NavigationMenuCommandHandlerTests.cs` *(Tạo mới)*: Unit tests cho Create, Update, Delete NavigationMenu.
- `BE/test/UnitTests/Application/Templates/CreateTemplateCommandHandlerTests.cs` *(Chỉnh sửa)*: Cập nhật dữ liệu test tương thích với các trường mới của Template.
- `BE/test/UnitTests/Application/Templates/GetTemplatesQueryHandlerTests.cs` *(Chỉnh sửa)*: Cập nhật mock repository theo phương thức `GetListAsync`.

---

### 1.2. Frontend (React 19 + Vite + Tailwind CSS)

#### API Layer (`FE/src/api/`)
- `FE/src/api/categoryApi.js` *(Tạo mới)*: Client API giao tiếp với `/api/v1/categories`.
- `FE/src/api/navigationMenuApi.js` *(Tạo mới)*: Client API giao tiếp với `/api/v1/menus`.
- `FE/src/api/templateApi.js` *(Chỉnh sửa)*: Đảm bảo unwrap an toàn dữ liệu trả về từ backend.

#### Tiện ích (`FE/src/utils/`)
- `FE/src/utils/iconResolver.jsx` *(Tạo mới)*: Bộ giải quyết icon Lucide động an toàn (fallback về Sparkles nếu icon nhập trong database không tồn tại).

#### Navigation & Layout (`FE/src/components/` & `FE/src/routes/`)
- `FE/src/components/Navbar.jsx` *(Chỉnh sửa toàn diện)*: Tải động cây menu từ API backend, hỗ trợ dropdown submenu trên desktop (hover), accordion collapsible trên mobile, nhãn badge theo màu, phân biệt liên kết nội bộ (`<Link>`) và liên kết ngoài (`<a>`).
- `FE/src/components/admin/AdminLayout.jsx` *(Chỉnh sửa)*: Thêm liên kết Sidebar đến `/admin/categories` và `/admin/menus`.
- `FE/src/routes/index.jsx` *(Chỉnh sửa)*: Khai báo 2 route admin `/admin/categories` và `/admin/menus`.

#### Trang Mẫu Thiệp Cinelove Clone (`FE/src/pages/` & `FE/src/components/templates/`)
- `FE/src/pages/TemplatesPage.jsx` *(Chỉnh sửa toàn diện)*:
  - Giao diện Breadcrumb + Hero Banner chuẩn Cinelove.
  - Thanh Category Tabs cuộn ngang nạp động từ `categoryApi`.
  - Bộ lọc Huy hiệu gói (Tất cả, Free, Basic, Premium, Hot, New).
  - Tìm kiếm tức thời theo từ khóa.
  - Quản lý trình phát Audio tập trung (Centralized Audio Player) duy nhất 1 bài phát tại 1 thời điểm, tự động tắt khi rời trang.
- `FE/src/components/templates/TemplateCard.jsx` *(Chỉnh sửa toàn diện)*:
  - Khung card mockup điện thoại chuẩn phong cách Cinelove.
  - Hiệu ứng cuộn ảnh mockup dài dọc tự động khi hover (`auto-scroll mockup`), mượt mà quay về ban đầu khi rời chuột.
  - Nút nghe thử nhạc trực tiếp trên thẻ kèm hoạt ảnh sóng nhạc (equalizer wave).
  - Huy hiệu gói (Badge) góc thẻ.
  - Nút thao tác nhanh "Xem demo" và "Dùng mẫu".
- `FE/src/components/templates/QuickPreviewModal.jsx` *(Chỉnh sửa)*:
  - Trình nghe nhạc xem thử tích hợp trên modal topbar.
  - Bộ chuyển đổi mô phỏng Mobile (375px notch) và Desktop toàn màn hình.
  - Nút điều hướng trực tiếp sang trang tùy biến `/customize/:id`.

#### Trang Quản Trị Admin (`FE/src/pages/admin/`)
- `FE/src/pages/admin/AdminCategoriesPage.jsx` *(Tạo mới)*: Quản lý danh mục (danh sách, đếm template, modal thêm/sửa, xóa an toàn).
- `FE/src/pages/admin/AdminMenusPage.jsx` *(Tạo mới)*: Quản lý menu cha và submenu phân cấp dạng cây (thứ tự, đường dẫn, badge, màu badge, icon, target, modal thêm/sửa, xóa an toàn).
- `FE/src/pages/admin/AdminTemplatesPage.jsx` *(Chỉnh sửa)*: Bổ sung chọn Danh mục động, chọn Gói/Badge, nhập `LongPreviewUrl`, nhập `AudioUrl` và `MusicTitle`.

---

## 2. KẾT QUẢ KIỂM TRA (VERIFICATION)

1. **Backend Tests**:
   - Chạy lệnh: `dotnet test BE/TemplateLandingPage.sln /p:AllowMissingPrunePackageData=true`
   - **Kết quả: PASS 100%**
     - `TemplateLandingPage.Architecture.Tests.dll`: **5/5 passed** (Handlers kết thúc bằng `Handler`, kiến trúc phân tầng tuân thủ Clean Architecture).
     - `TemplateLandingPage.UnitTests.dll`: **101/101 passed** (toàn bộ test cases cho Categories, NavigationMenus, Templates, Users, Customizations, Interactions đều xanh).

2. **Frontend Build**:
   - Chạy lệnh: `npm run build` trong `FE/`
   - **Kết quả: PASS 100%** (Vite build thành công, không có lỗi cú pháp hay import hỏng).

---

## 3. CÁC VỊ TRÍ TRỌNG YẾU TESTER NÊN SOI KỸ

1. **Hiệu ứng Cuộn Mockup Dài Trên Card (`TemplateCard.jsx`)**:
   - Rê chuột vào thẻ thiệp có `longPreviewUrl`: kiểm tra ảnh có cuộn mượt mà từ trên xuống dưới không (`transition: transform 3.5s ease-in-out`).
   - Rê chuột ra khỏi thẻ: kiểm tra ảnh có lùi mượt về vị trí ban đầu không.
   - Thẻ không có `longPreviewUrl`: kiểm tra có tự động fallback dùng `thumbnailUrl` và phóng nhẹ (zoom) an toàn không vỡ khung không.

2. **Cơ chế Phát Âm Thanh Tập Trung (Centralized Audio Concurrency)**:
   - Bấm nút Play trên Thẻ A: nhạc thẻ A phát, biểu tượng sóng nhạc nhảy.
   - Bấm nút Play trên Thẻ B: nhạc thẻ A phải lập tức dừng ngay, nhạc thẻ B phát lên.
   - Rời khỏi trang `/templates` hoặc bấm dừng trên banner trạng thái: kiểm tra âm thanh có dừng hoàn toàn không.

3. **Dynamic Navigation Menu Trên Navbar (`Navbar.jsx`)**:
   - Trên Desktop: rê chuột vào "Kho Mẫu Thiệp", dropdown submenu hiển thị đầy đủ danh sách danh mục con kèm icon và badge màu.
   - Trên Mobile: mở menu hamburger, bấm vào mục có submenu kiểm tra accordion gập mở mượt mà.
   - Kiểm tra link ngoại vi (`http/https`) mở tab mới (`target="_blank"`) và link nội bộ chuyển hướng trang SPA mượt mà qua React Router.

4. **Kiểm Tra Ràng Buộc Nghiệp Vụ Tại Trang Admin**:
   - `/admin/categories`: Thử xóa danh mục đang có mẫu thiệp liên kết -> hệ thống phải từ chối và hiển thị thông báo lỗi rõ ràng.
   - `/admin/menus`:
     - Thử chọn chính menu đó làm menu cha của nó -> bị chặn.
     - Thử xóa menu cha đang chứa menu con -> hệ thống phải từ chối và yêu cầu xóa menu con trước.
