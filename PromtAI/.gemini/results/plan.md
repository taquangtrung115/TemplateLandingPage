# KẾ HOẠCH TRIỂN KHAI TÍNH NĂNG: CLONE UI CINELOVE & DYNAMIC NAVIGATION MENU ENGINE

## CÂU HỎI CÒN BỎ NGỎ
Không có.

---

## 1. QUY ƯỚC CẦN BÁM THEO
- **Tên file quy ước**: `PromtAI/.gemini/agents/coder.md`
- **Backend**: .NET 10 Clean Architecture + CQRS + MediatR + EF Core SQL Server + FluentValidation.
  - Tuân thủ nguyên tắc phân tầng: Domain -> Contract -> Application -> Persistence -> Presentation -> API.
  - Command thay đổi trạng thái trả về `Result` hoặc `Result<TResponse>`, Query chỉ đọc trả về `Result<TResponse>`. Sử dụng `AsNoTracking()` cho queries.
  - Naming: `{Action}{Entity}Command`, `{Action}{Entity}Query`, `{Command/Query}Handler`, `{Entity}Response`.
  - Không để business logic trong Presentation/API layer. Presentation triển khai qua `IEndpoint` Minimal API.
  - Kế thừa `AggregateRoot<Guid>`, `IAuditableEntity`, `ISoftDelete` cho các thực thể chính.
- **Frontend**: React 19 + Vite + Tailwind CSS + Lucide Icons + React Router.
  - Tách tầng API riêng biệt trong `src/api/` sử dụng `axiosInstance`. Xử lý unwrap data qua `response.data?.value ?? response.data`.
  - Component tuân thủ cấu trúc thư mục, xử lý loading/error đầy đủ, không để lộ console.log hay dead code.

---

## 2. DANH SÁCH FILE CẦN TẠO MỚI HOẶC CẦN SỬA

### 2.1. Backend (.NET 10)

#### Layer Domain (`BE/src/Domain/`)
- **Tạo mới**:
  1. `BE/src/Domain/Entities/Category.cs`: Thực thể quản lý danh mục thiệp.
  2. `BE/src/Domain/Entities/NavigationMenu.cs`: Thực thể quản lý menu và submenu đa cấp.
  3. `BE/src/Domain/Repositories/ICategoryRepository.cs`: Interface repository cho Category.
  4. `BE/src/Domain/Repositories/INavigationMenuRepository.cs`: Interface repository cho NavigationMenu.
- **Sửa**:
  5. `BE/src/Domain/Entities/Template.cs`: Bổ sung `CategoryId`, `CategoryRef`, `Badge`, `AudioUrl`, `MusicTitle`, `LongPreviewUrl`, cập nhật constructor, phương thức `Create` và `Update`.
  6. `BE/src/Domain/Repositories/ITemplateRepository.cs`: Bổ sung tham số truy vấn nâng cao (CategoryId, Badge, Search).

#### Layer Contract (`BE/src/Contract/`)
- **Tạo mới**:
  7. `BE/src/Contract/Services/V1/Categories/Command.cs`: Các command Create, Update, Delete Category.
  8. `BE/src/Contract/Services/V1/Categories/Query.cs`: Các query GetCategories, GetCategoryById, GetCategoryBySlug.
  9. `BE/src/Contract/Services/V1/Categories/Response.cs`: `CategoryResponse`, `CategoryErrors`.
  10. `BE/src/Contract/Services/V1/NavigationMenus/Command.cs`: Các command Create, Update, Delete NavigationMenu.
  11. `BE/src/Contract/Services/V1/NavigationMenus/Query.cs`: Các query GetNavigationMenus (cây phân cấp), GetNavigationMenuById.
  12. `BE/src/Contract/Services/V1/NavigationMenus/Response.cs`: `NavigationMenuResponse`, `NavigationMenuErrors`.
- **Sửa**:
  13. `BE/src/Contract/Services/V1/Templates/Command.cs`: Bổ sung `CategoryId`, `Badge`, `AudioUrl`, `MusicTitle`, `LongPreviewUrl` vào `CreateTemplateCommand`, `UpdateTemplateCommand`.
  14. `BE/src/Contract/Services/V1/Templates/Query.cs`: Bổ sung `CategoryId`, `Badge`, `Search` vào `GetTemplatesQuery`.
  15. `BE/src/Contract/Services/V1/Templates/Response.cs`: Bổ sung `CategoryId`, `Badge`, `AudioUrl`, `MusicTitle`, `LongPreviewUrl` vào `TemplateResponse`.

#### Layer Application (`BE/src/Application/`)
- **Tạo mới**:
  16. `BE/src/Application/UseCases/V1/Categories/Commands/CreateCategoryCommandHandler.cs`
  17. `BE/src/Application/UseCases/V1/Categories/Commands/CreateCategoryCommandValidator.cs`
  18. `BE/src/Application/UseCases/V1/Categories/Commands/UpdateCategoryCommandHandler.cs`
  19. `BE/src/Application/UseCases/V1/Categories/Commands/UpdateCategoryCommandValidator.cs`
  20. `BE/src/Application/UseCases/V1/Categories/Commands/DeleteCategoryCommandHandler.cs`
  21. `BE/src/Application/UseCases/V1/Categories/Queries/GetCategoriesQueryHandler.cs`
  22. `BE/src/Application/UseCases/V1/Categories/Queries/GetCategoryByIdQueryHandler.cs`
  23. `BE/src/Application/UseCases/V1/Categories/Queries/GetCategoryBySlugQueryHandler.cs`
  24. `BE/src/Application/UseCases/V1/NavigationMenus/Commands/CreateNavigationMenuCommandHandler.cs`
  25. `BE/src/Application/UseCases/V1/NavigationMenus/Commands/CreateNavigationMenuCommandValidator.cs`
  26. `BE/src/Application/UseCases/V1/NavigationMenus/Commands/UpdateNavigationMenuCommandHandler.cs`
  27. `BE/src/Application/UseCases/V1/NavigationMenus/Commands/UpdateNavigationMenuCommandValidator.cs`
  28. `BE/src/Application/UseCases/V1/NavigationMenus/Commands/DeleteNavigationMenuCommandHandler.cs`
  29. `BE/src/Application/UseCases/V1/NavigationMenus/Queries/GetNavigationMenusQueryHandler.cs`
  30. `BE/src/Application/UseCases/V1/NavigationMenus/Queries/GetNavigationMenuByIdQueryHandler.cs`
- **Sửa**:
  31. `BE/src/Application/UseCases/V1/Templates/Commands/CreateTemplateCommandHandler.cs`
  32. `BE/src/Application/UseCases/V1/Templates/Commands/CreateTemplateCommandValidator.cs`
  33. `BE/src/Application/UseCases/V1/Templates/Commands/UpdateTemplateCommandHandler.cs`
  34. `BE/src/Application/UseCases/V1/Templates/Commands/UpdateTemplateCommandValidator.cs`
  35. `BE/src/Application/UseCases/V1/Templates/Queries/GetTemplatesQueryHandler.cs`
  36. `BE/src/Application/UseCases/V1/Templates/Queries/GetTemplateByIdQueryHandler.cs`
  37. `BE/src/Application/UseCases/V1/Templates/Queries/GetTemplateBySlugQueryHandler.cs`

#### Layer Persistence (`BE/src/Persistence/`)
- **Tạo mới**:
  38. `BE/src/Persistence/Configurations/CategoryConfiguration.cs`: Cấu hình Fluent API bảng Categories.
  39. `BE/src/Persistence/Configurations/NavigationMenuConfiguration.cs`: Cấu hình Fluent API bảng NavigationMenus (self-referencing ParentId).
  40. `BE/src/Persistence/Repositories/CategoryRepository.cs`: Triển khai `ICategoryRepository`.
  41. `BE/src/Persistence/Repositories/NavigationMenuRepository.cs`: Triển khai `INavigationMenuRepository`.
- **Sửa**:
  42. `BE/src/Persistence/Constants/TableNames.cs`: Thêm constants `Categories` và `NavigationMenus`.
  43. `BE/src/Persistence/ApplicationDbContext.cs`: Thêm `DbSet<Category>` và `DbSet<NavigationMenu>`.
  44. `BE/src/Persistence/Configurations/TemplateConfiguration.cs`: Cập nhật cấu hình quan hệ với Category và các cột mới.
  45. `BE/src/Persistence/Repositories/TemplateRepository.cs`: Cập nhật logic truy vấn và Include/Filter theo Category, Badge, Search.
  46. `BE/src/Persistence/DependencyInjection/Extensions/ServiceCollectionExtensions.cs`: Đăng ký Scoped cho `ICategoryRepository` và `INavigationMenuRepository`.
  47. `BE/src/Persistence/Data/DataSeeder.cs`: Nạp dữ liệu mặc định ban đầu: 5 danh mục chuẩn Cinelove, hệ thống menu & submenu động, các mẫu thiệp có âm nhạc và ảnh mockup cuộn dài.

#### Layer Presentation (`BE/src/Presentation/`)
- **Tạo mới**:
  48. `BE/src/Presentation/APIs/Categories/CategoryApi.cs`: Minimal API cho Category (`/api/v1/categories`).
  49. `BE/src/Presentation/APIs/NavigationMenus/NavigationMenuApi.cs`: Minimal API cho NavigationMenu (`/api/v1/menus`).
- **Sửa**:
  50. `BE/src/Presentation/APIs/Templates/TemplateApi.cs`: Cập nhật tham số truy vấn `GetTemplates` và request DTOs của `CreateTemplate`, `UpdateTemplate`.

#### Layer Tests (`BE/test/`)
- **Tạo mới**:
  51. `BE/test/UnitTests/Application/Categories/CategoryCommandHandlerTests.cs`: Unit test cho Create, Update, Delete Category.
  52. `BE/test/UnitTests/Application/NavigationMenus/NavigationMenuCommandHandlerTests.cs`: Unit test cho Create, Update, Delete NavigationMenu.
- **Sửa**:
  53. `BE/test/UnitTests/Application/Templates/CreateTemplateCommandHandlerTests.cs`: Cập nhật test case khớp với các trường mới của Template.

---

### 2.2. Frontend (React 19 + Vite)

#### Tầng API Client (`FE/src/api/`)
- **Tạo mới**:
  54. `FE/src/api/categoryApi.js`: Quản lý gọi API danh mục (getCategories, getCategoryById, createCategory, updateCategory, deleteCategory).
  55. `FE/src/api/navigationMenuApi.js`: Quản lý gọi API menu động (getMenus, getMenuById, createMenu, updateMenu, deleteMenu).
- **Sửa**:
  56. `FE/src/api/templateApi.js`: Cập nhật tham số filter (category, categoryId, badge, search) và unwrap an toàn.

#### Tầng Layout & Navigation (`FE/src/components/` & `FE/src/routes/`)
- **Sửa**:
  57. `FE/src/components/Navbar.jsx`: Thay thế menu tĩnh bằng Dynamic Navigation Tree lấy từ backend API `navigationMenuApi.getMenus({ isActiveOnly: true })`. Hỗ trợ render dropdown submenu đa cấp trên desktop, menu gập mở collapsible trên mobile, nhãn badge theo màu, dynamic Lucide icon resolver.
  58. `FE/src/components/admin/AdminLayout.jsx`: Thêm mục "Quản Lý Menu Động" (`/admin/menus`) và "Quản Lý Danh Mục" (`/admin/categories`) vào Sidebar navigation.
  59. `FE/src/routes/index.jsx`: Thêm 2 route admin mới: `/admin/menus` và `/admin/categories`.

#### Trang Mẫu Thiệp & Card Component (`FE/src/pages/` & `FE/src/components/templates/`)
- **Sửa**:
  60. `FE/src/pages/TemplatesPage.jsx`:
      - Thiết kế lại 100% phong cách Cinelove: Breadcrumb, Hero Title lãng mạn, thanh Category tabs cuộn ngang lấy từ `categoryApi`.
      - Bộ lọc huy hiệu / gói: Tất cả, Miễn phí (Free), Tiêu chuẩn (Basic), Cao cấp (Premium), Hot, New.
      - Thanh tìm kiếm tức thời (Search).
      - Quản lý Audio Controller tập trung: Cho phép phát nghe thử nhạc trên từng thẻ, dừng bài cũ khi bấm bài mới, hiển thị trạng thái đang phát.
  61. `FE/src/components/templates/TemplateCard.jsx`:
      - Khung card mockup điện thoại chuẩn Cinelove, bo góc mềm, hiệu ứng nâng nhẹ khi hover.
      - Auto-scroll mockup on hover: Vùng chứa ảnh cuộn tự động từ trên xuống dưới (`transition: transform 3.5s ease-in-out` với `translateY(calc(-100% + height))`) khi hover và lùi mượt về ban đầu khi unhover. Sử dụng `longPreviewUrl` (hoặc fallback `thumbnailUrl`).
      - Huy hiệu gói (Badge) góc trên: FREE (xám), BASIC (xanh dương), PREMIUM (tím), HOT (cam hổ phách), NEW (xanh ngọc).
      - Nút nghe thử nhạc (Audio preview button) trực tiếp trên card: Icon Play/Pause với animation cột sóng nhạc nhấp nháy, kèm tiêu đề bài hát `musicTitle`.
      - Hover action overlay: Nút "Xem demo" (mở modal Quick Preview) và nút "Dùng mẫu" (chuyển sang Customize Editor `/customize/:id`).
  62. `FE/src/components/templates/QuickPreviewModal.jsx`: Bổ sung trình nghe nhạc thử tích hợp, nút chuyển đổi giả lập thiết bị (Mobile/Desktop), hiển thị thông tin gói và nút "Bắt đầu tạo thiệp".

#### Các Trang Quản Trị Admin (`FE/src/pages/admin/`)
- **Tạo mới**:
  63. `FE/src/pages/admin/AdminMenusPage.jsx`:
      - Bảng danh sách menu cha & submenu phân cấp dạng cây rõ ràng.
      - Modal Thêm / Chỉnh sửa Menu: Tiêu đề, Đường dẫn (URL), Menu cha (ParentId dropdown), Thứ tự hiển thị (OrderIndex), Target (`_self` / `_blank`), Huy hiệu (Badge: HOT/NEW/PRO...), Màu huy hiệu (BadgeColor: rose/blue/purple/amber/emerald), Biểu tượng (Icon name), Trạng thái kích hoạt (IsActive).
      - Thao tác xóa có xác nhận và kiểm tra ràng buộc menu con.
  64. `FE/src/pages/admin/AdminCategoriesPage.jsx`:
      - Bảng quản lý danh mục: Biểu tượng, Tên danh mục, Slug, Mô tả, Số lượng mẫu thiệp đang dùng, Thứ tự hiển thị, Trạng thái.
      - Modal Thêm / Chỉnh sửa Danh mục: Tên, Slug tự sinh hoặc chỉnh tay, Biểu tượng Lucide, Mô tả, OrderIndex, IsActive.
      - Xóa danh mục an toàn.
- **Sửa**:
  65. `FE/src/pages/admin/AdminTemplatesPage.jsx`:
      - Cập nhật form Thêm / Sửa Template:
        * Chọn Danh mục từ danh sách Categories động (thay vì cố định 2 option Wedding/Birthday).
        * Chọn Huy hiệu / Gói: Free, Basic, Premium, Hot, New.
        * Nhập URL Ảnh Mockup Dài (`longPreviewUrl`) để hiển thị hiệu ứng cuộn ảnh.
        * Cấu hình Nhạc preview: URL File nhạc (`audioUrl`) và Tên bài hát (`musicTitle`).
      - Cập nhật hiển thị Badge và Danh mục trong bảng danh sách.

---

## 3. CHỮ KÝ HÀM VÀ INTERFACE CHI TIẾT

### 3.1. Backend Entities & Interfaces

#### Entity `NavigationMenu` (`BE/src/Domain/Entities/NavigationMenu.cs`)
```csharp
namespace TemplateLandingPage.Domain.Entities;

using TemplateLandingPage.Domain.Abstractions;

public sealed class NavigationMenu : AggregateRoot<Guid>, IAuditableEntity, ISoftDelete
{
    public string Title { get; private set; } = string.Empty;
    public string Url { get; private set; } = string.Empty;
    public Guid? ParentId { get; private set; }
    public int OrderIndex { get; private set; }
    public string Target { get; private set; } = "_self";
    public string? Badge { get; private set; }
    public string? BadgeColor { get; private set; }
    public string? Icon { get; private set; }
    public bool IsActive { get; private set; } = true;
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? ModifiedAtUtc { get; set; }

    public NavigationMenu? Parent { get; private set; }
    public ICollection<NavigationMenu> SubMenus { get; private set; } = new List<NavigationMenu>();

    public static NavigationMenu Create(
        string title,
        string url,
        Guid? parentId,
        int orderIndex,
        string? target = "_self",
        string? badge = null,
        string? badgeColor = null,
        string? icon = null,
        bool isActive = true);

    public void Update(
        string title,
        string url,
        Guid? parentId,
        int orderIndex,
        string? target,
        string? badge,
        string? badgeColor,
        string? icon,
        bool isActive);

    public void Delete();
}
```

#### Entity `Category` (`BE/src/Domain/Entities/Category.cs`)
```csharp
namespace TemplateLandingPage.Domain.Entities;

using TemplateLandingPage.Domain.Abstractions;

public sealed class Category : AggregateRoot<Guid>, IAuditableEntity, ISoftDelete
{
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string? Icon { get; private set; }
    public int OrderIndex { get; private set; }
    public bool IsActive { get; private set; } = true;
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? ModifiedAtUtc { get; set; }

    public ICollection<Template> Templates { get; private set; } = new List<Template>();

    public static Category Create(
        string name,
        string slug,
        string? description,
        string? icon,
        int orderIndex,
        bool isActive = true);

    public void Update(
        string name,
        string slug,
        string? description,
        string? icon,
        int orderIndex,
        bool isActive);

    public void Delete();
}
```

#### Cập nhật Entity `Template` (`BE/src/Domain/Entities/Template.cs`)
```csharp
// Thêm các thuộc tính mới:
public Guid? CategoryId { get; private set; }
public Category? CategoryRef { get; private set; }
public string? Badge { get; private set; }           // "Free", "Basic", "Premium", "Hot", "New"
public string? AudioUrl { get; private set; }        // URL file audio mp3 preview
public string? MusicTitle { get; private set; }      // Tên bài hát nhạc nền
public string? LongPreviewUrl { get; private set; }  // Ảnh mockup dài dọc cuộn animation

public static Template Create(
    string name,
    string slug,
    string? description,
    Guid? categoryId,
    string category,
    string thumbnailUrl,
    string? previewUrl,
    string? longPreviewUrl,
    string? badge,
    string? audioUrl,
    string? musicTitle,
    string defaultConfigJson);

public void Update(
    string name,
    string slug,
    string? description,
    Guid? categoryId,
    string category,
    string thumbnailUrl,
    string? previewUrl,
    string? longPreviewUrl,
    string? badge,
    string? audioUrl,
    string? musicTitle,
    string defaultConfigJson,
    bool isActive);
```

#### Repositories Interfaces
- `BE/src/Domain/Repositories/INavigationMenuRepository.cs`:
```csharp
public interface INavigationMenuRepository : IRepositoryBase<NavigationMenu, Guid>
{
    Task<List<NavigationMenu>> GetTreeAsync(bool? isActiveOnly = null, CancellationToken cancellationToken = default);
    Task<bool> HasChildrenAsync(Guid id, CancellationToken cancellationToken = default);
}
```
- `BE/src/Domain/Repositories/ICategoryRepository.cs`:
```csharp
public interface ICategoryRepository : IRepositoryBase<Category, Guid>
{
    Task<Category?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<bool> ExistsBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<List<Category>> GetAllOrderedAsync(bool? isActiveOnly = null, CancellationToken cancellationToken = default);
    Task<bool> HasAssociatedTemplatesAsync(Guid categoryId, CancellationToken cancellationToken = default);
}
```
- `BE/src/Domain/Repositories/ITemplateRepository.cs`:
```csharp
public interface ITemplateRepository : IRepositoryBase<Template, Guid>
{
    Task<Template?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<bool> ExistsBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<List<Template>> GetListAsync(
        string? category = null,
        Guid? categoryId = null,
        string? badge = null,
        string? search = null,
        bool? isActiveOnly = null,
        CancellationToken cancellationToken = default);
}
```

---

### 3.2. CQRS Commands & Queries (Contract)

#### NavigationMenus (`BE/src/Contract/Services/V1/NavigationMenus/`)
- `Command.cs`:
```csharp
public record CreateNavigationMenuCommand(
    string Title,
    string Url,
    Guid? ParentId,
    int OrderIndex,
    string? Target = "_self",
    string? Badge = null,
    string? BadgeColor = null,
    string? Icon = null,
    bool IsActive = true) : ICommand<Guid>;

public record UpdateNavigationMenuCommand(
    Guid Id,
    string Title,
    string Url,
    Guid? ParentId,
    int OrderIndex,
    string? Target,
    string? Badge,
    string? BadgeColor,
    string? Icon,
    bool IsActive) : ICommand;

public record DeleteNavigationMenuCommand(Guid Id) : ICommand;
```
- `Query.cs`:
```csharp
public record GetNavigationMenusQuery(bool? IsActiveOnly = null) : IQuery<List<NavigationMenuResponse>>;
public record GetNavigationMenuByIdQuery(Guid Id) : IQuery<NavigationMenuResponse>;
```
- `Response.cs`:
```csharp
public record NavigationMenuResponse(
    Guid Id,
    string Title,
    string Url,
    Guid? ParentId,
    int OrderIndex,
    string Target,
    string? Badge,
    string? BadgeColor,
    string? Icon,
    bool IsActive,
    DateTime CreatedAtUtc,
    List<NavigationMenuResponse> SubMenus);

public static class NavigationMenuErrors
{
    public static readonly Error NotFound = new("Menu.NotFound", "Không tìm thấy menu.");
    public static readonly Error ParentNotFound = new("Menu.ParentNotFound", "Menu cha không tồn tại.");
    public static readonly Error CannotBeSelfParent = new("Menu.CannotBeSelfParent", "Menu không thể làm cha của chính mình.");
    public static readonly Error HasChildMenus = new("Menu.HasChildMenus", "Không thể xóa menu đang có menu con. Hãy xóa hoặc di chuyển menu con trước.");
}
```

#### Categories (`BE/src/Contract/Services/V1/Categories/`)
- `Command.cs`:
```csharp
public record CreateCategoryCommand(
    string Name,
    string Slug,
    string? Description,
    string? Icon,
    int OrderIndex,
    bool IsActive = true) : ICommand<Guid>;

public record UpdateCategoryCommand(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string? Icon,
    int OrderIndex,
    bool IsActive) : ICommand;

public record DeleteCategoryCommand(Guid Id) : ICommand;
```
- `Query.cs`:
```csharp
public record GetCategoriesQuery(bool? IsActiveOnly = null) : IQuery<List<CategoryResponse>>;
public record GetCategoryByIdQuery(Guid Id) : IQuery<CategoryResponse>;
public record GetCategoryBySlugQuery(string Slug) : IQuery<CategoryResponse>;
```
- `Response.cs`:
```csharp
public record CategoryResponse(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string? Icon,
    int OrderIndex,
    bool IsActive,
    int TemplateCount,
    DateTime CreatedAtUtc);

public static class CategoryErrors
{
    public static readonly Error NotFound = new("Category.NotFound", "Không tìm thấy danh mục.");
    public static readonly Error DuplicateSlug = new("Category.DuplicateSlug", "Slug danh mục đã tồn tại.");
    public static readonly Error HasAssociatedTemplates = new("Category.HasAssociatedTemplates", "Không thể xóa danh mục đang có mẫu thiệp liên kết.");
}
```

#### Cập nhật Templates (`BE/src/Contract/Services/V1/Templates/`)
- `Command.cs`:
```csharp
public record CreateTemplateCommand(
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
    string DefaultConfigJson) : ICommand<Guid>;

public record UpdateTemplateCommand(
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
    bool IsActive) : ICommand;
```
- `Query.cs`:
```csharp
public record GetTemplatesQuery(
    string? Category = null,
    Guid? CategoryId = null,
    string? Badge = null,
    string? Search = null,
    bool? IsActiveOnly = null) : IQuery<List<TemplateResponse>>;
```
- `Response.cs`:
```csharp
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
    DateTime CreatedAtUtc);
```

---

### 3.3. Presentation Minimal APIs

#### `NavigationMenuApi` (`BE/src/Presentation/APIs/NavigationMenus/NavigationMenuApi.cs`)
- `GET /api/v1/menus?isActiveOnly={bool}` -> `Result<List<NavigationMenuResponse>>` (public)
- `GET /api/v1/menus/{id:guid}` -> `Result<NavigationMenuResponse>` (public)
- `POST /api/v1/menus` -> `Result<Guid>` (Admin authorization)
- `PUT /api/v1/menus/{id:guid}` -> `Result` (Admin authorization)
- `DELETE /api/v1/menus/{id:guid}` -> `Result` (Admin authorization)

#### `CategoryApi` (`BE/src/Presentation/APIs/Categories/CategoryApi.cs`)
- `GET /api/v1/categories?isActiveOnly={bool}` -> `Result<List<CategoryResponse>>` (public)
- `GET /api/v1/categories/{id:guid}` -> `Result<CategoryResponse>` (public)
- `GET /api/v1/categories/slug/{slug}` -> `Result<CategoryResponse>` (public)
- `POST /api/v1/categories` -> `Result<Guid>` (Admin authorization)
- `PUT /api/v1/categories/{id:guid}` -> `Result` (Admin authorization)
- `DELETE /api/v1/categories/{id:guid}` -> `Result` (Admin authorization)

#### `TemplateApi` (`BE/src/Presentation/APIs/Templates/TemplateApi.cs`)
- `GET /api/v1/templates?category={string}&categoryId={guid}&badge={string}&search={string}&isActiveOnly={bool}` -> `Result<List<TemplateResponse>>` (public)

---

### 3.4. Frontend Services & Components

#### `navigationMenuApi.js` (`FE/src/api/navigationMenuApi.js`)
```javascript
export const navigationMenuApi = {
  getMenus: async (params = {}) => {
    const res = await axiosInstance.get('/menus', { params });
    return res.data?.value ?? res.data;
  },
  getMenuById: async (id) => {
    const res = await axiosInstance.get(`/menus/${id}`);
    return res.data?.value ?? res.data;
  },
  createMenu: async (data) => {
    const res = await axiosInstance.post('/menus', data);
    return res.data?.value ?? res.data;
  },
  updateMenu: async (id, data) => {
    const res = await axiosInstance.put(`/menus/${id}`, data);
    return res.data?.value ?? res.data;
  },
  deleteMenu: async (id) => {
    const res = await axiosInstance.delete(`/menus/${id}`);
    return res.data?.value ?? res.data;
  },
};
```

#### `categoryApi.js` (`FE/src/api/categoryApi.js`)
```javascript
export const categoryApi = {
  getCategories: async (params = {}) => {
    const res = await axiosInstance.get('/categories', { params });
    return res.data?.value ?? res.data;
  },
  getCategoryById: async (id) => {
    const res = await axiosInstance.get(`/categories/${id}`);
    return res.data?.value ?? res.data;
  },
  getCategoryBySlug: async (slug) => {
    const res = await axiosInstance.get(`/categories/slug/${slug}`);
    return res.data?.value ?? res.data;
  },
  createCategory: async (data) => {
    const res = await axiosInstance.post('/categories', data);
    return res.data?.value ?? res.data;
  },
  updateCategory: async (id, data) => {
    const res = await axiosInstance.put(`/categories/${id}`, data);
    return res.data?.value ?? res.data;
  },
  deleteCategory: async (id) => {
    const res = await axiosInstance.delete(`/categories/${id}`);
    return res.data?.value ?? res.data;
  },
};
```

#### Component `TemplateCard.jsx` (`FE/src/components/templates/TemplateCard.jsx`)
```javascript
/**
 * @param {Object} props
 * @param {TemplateResponse} props.template
 * @param {boolean} props.isPlaying - Trạng thái bài hát này có đang phát hay không
 * @param {Function} props.onToggleAudio - (template) => void (Bật/tắt phát nhạc)
 * @param {Function} props.onQuickPreview - (template) => void (Mở modal xem demo nhanh)
 */
export default function TemplateCard({ template, isPlaying, onToggleAudio, onQuickPreview }) { ... }
```

---

## 4. CÁC TRƯỜNG HỢP BIÊN BẮT BUỘC PHẢI XỬ LÝ (EDGE CASES)

1. **Đệ quy vòng trong cấu hình Menu cha - con (Circular Hierarchy)**:
   - Một menu không bao giờ được phép chọn chính nó làm `ParentId` (`CannotBeSelfParent`).
   - Cấm chọn con cháu cấp dưới làm menu cha của chính mình khi cập nhật.
2. **Xóa Menu cha khi còn Submenus con**:
   - Nếu menu có các menu con (`SubMenus.Any()`), từ chối xóa và trả về lỗi nghiệp vụ rõ ràng (`NavigationMenuErrors.HasChildMenus`).
3. **Xóa Danh mục đang có Mẫu thiệp liên kết**:
   - Nếu danh mục có template liên kết (`HasAssociatedTemplatesAsync`), từ chối xóa (`CategoryErrors.HasAssociatedTemplates`) để tránh mồ côi dữ liệu thiệp.
4. **Xử lý Template thiếu ảnh dài `longPreviewUrl`**:
   - Trường hợp template chưa cập nhật `longPreviewUrl`, card phải tự động fallback dùng `thumbnailUrl` và vô hiệu hóa chuyển vị cuộn để tránh layout bị méo hoặc vỡ ảnh.
5. **Xử lý Template thiếu file nhạc `audioUrl`**:
   - Nếu `audioUrl` null hoặc rỗng, không hiển thị nút nghe thử nhạc hoặc hiển thị ở trạng thái mờ (disabled) có tooltip báo "Mẫu chưa kèm nhạc preview".
6. **Xung đột nhiều thẻ cùng phát nhạc (Audio Concurrency)**:
   - Chỉ duy nhất 1 thẻ được phát âm thanh tại một thời điểm trên toàn trang. Khi bấm nghe thử thẻ B, thẻ A phải lập tức dừng phát và biểu tượng sóng nhạc chuyển về nút Play.
   - Khi người dùng rời khỏi trang `/templates` hoặc đóng trình duyệt/modal, audio phải tự động pause giải phóng tài nguyên.
7. **Phân giải Icon động từ Database (Lucide Icon Fallback)**:
   - Admin có thể nhập tên Icon tùy ý ("Heart", "Cake", "Sparkles", "Flame", "Home"...).
   - Trên Frontend, xây dựng hàm `resolveIcon(iconName, defaultIcon = Sparkles)`. Nếu `iconName` không tồn tại trong Lucide icons, an toàn trả về icon mặc định thay vì làm crash giao diện React.
8. **Điều hướng Link nội bộ vs Link ngoại vi trong Dynamic Navbar**:
   - Nếu URL menu bắt đầu bằng `http://` hoặc `https://`, render thẻ `<a>` với `target={item.target}` và `rel="noopener noreferrer"`.
   - Nếu URL nội bộ (ví dụ `/templates`, `/my-sites`), render component `<Link to={item.url}>` của `react-router-dom` để giữ SPA navigation mượt mà.
9. **Dữ liệu Database rỗng khi khởi động**:
   - Trong `DataSeeder.cs`, thêm `await context.Database.EnsureCreatedAsync()` và nạp sẵn 5 Category chuẩn, 5 Navigation Menu với các submenu mẫu, 6-8 Templates phong phú để hệ thống sẵn sàng hoạt động ngay lập tức mà không cần gõ tay.
10. **Tương thích ngược dữ liệu Template cũ**:
   - Giữ nguyên cột `Category` (string) bên cạnh `CategoryId` (Guid? nullable) để các code cũ (hoặc bản ghi cũ chưa có CategoryId) vẫn hiển thị đúng danh mục mà không bị null reference exception.
