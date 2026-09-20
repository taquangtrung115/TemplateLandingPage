# BẢN KẾ HOẠCH TRIỂN KHAI (PLAN.MD)
Tái cấu trúc thư mục Validator cho Backend (`BE/src/Application/UseCases/V1/`)

---

## 1. CÂU HỎI CÒN BỎ NGỎ
Không có.

---

## 2. NHỮNG FILE CẦN TẠO MỚI HOẶC CẦN SỬA

### 2.1. Backend (BE)

#### A. Các file cần tạo mới / di chuyển vào thư mục `Validators/` (16 files):
1. `BE/src/Application/UseCases/V1/Auth/Validators/LoginCommandValidator.cs`
2. `BE/src/Application/UseCases/V1/Auth/Validators/RegisterCommandValidator.cs`
3. `BE/src/Application/UseCases/V1/Categories/Validators/CreateCategoryCommandValidator.cs`
4. `BE/src/Application/UseCases/V1/Categories/Validators/UpdateCategoryCommandValidator.cs`
5. `BE/src/Application/UseCases/V1/Customizations/Validators/CreateCustomizationCommandValidator.cs`
6. `BE/src/Application/UseCases/V1/Customizations/Validators/UpdateCustomizationCommandValidator.cs`
7. `BE/src/Application/UseCases/V1/Interactions/Validators/SubmitGuestbookCommandValidator.cs`
8. `BE/src/Application/UseCases/V1/Interactions/Validators/SubmitRsvpCommandValidator.cs`
9. `BE/src/Application/UseCases/V1/NavigationMenus/Validators/CreateNavigationMenuCommandValidator.cs`
10. `BE/src/Application/UseCases/V1/NavigationMenus/Validators/UpdateNavigationMenuCommandValidator.cs`
11. `BE/src/Application/UseCases/V1/Products/Validators/CreateProductCommandValidator.cs`
12. `BE/src/Application/UseCases/V1/Products/Validators/UpdateProductCommandValidator.cs`
13. `BE/src/Application/UseCases/V1/Templates/Validators/CreateTemplateCommandValidator.cs`
14. `BE/src/Application/UseCases/V1/Templates/Validators/UpdateTemplateCommandValidator.cs`
15. `BE/src/Application/UseCases/V1/Users/Validators/CreateUserCommandValidator.cs`
16. `BE/src/Application/UseCases/V1/Users/Validators/UpdateUserCommandValidator.cs`

#### B. Các file cũ cần xóa trong thư mục `Commands/` (16 files):
1. `BE/src/Application/UseCases/V1/Auth/Commands/LoginCommandValidator.cs`
2. `BE/src/Application/UseCases/V1/Auth/Commands/RegisterCommandValidator.cs`
3. `BE/src/Application/UseCases/V1/Categories/Commands/CreateCategoryCommandValidator.cs`
4. `BE/src/Application/UseCases/V1/Categories/Commands/UpdateCategoryCommandValidator.cs`
5. `BE/src/Application/UseCases/V1/Customizations/Commands/CreateCustomizationCommandValidator.cs`
6. `BE/src/Application/UseCases/V1/Customizations/Commands/UpdateCustomizationCommandValidator.cs`
7. `BE/src/Application/UseCases/V1/Interactions/Commands/SubmitGuestbookCommandValidator.cs`
8. `BE/src/Application/UseCases/V1/Interactions/Commands/SubmitRsvpCommandValidator.cs`
9. `BE/src/Application/UseCases/V1/NavigationMenus/Commands/CreateNavigationMenuCommandValidator.cs`
10. `BE/src/Application/UseCases/V1/NavigationMenus/Commands/UpdateNavigationMenuCommandValidator.cs`
11. `BE/src/Application/UseCases/V1/Products/Commands/CreateProductCommandValidator.cs`
12. `BE/src/Application/UseCases/V1/Products/Commands/UpdateProductCommandValidator.cs`
13. `BE/src/Application/UseCases/V1/Templates/Commands/CreateTemplateCommandValidator.cs`
14. `BE/src/Application/UseCases/V1/Templates/Commands/UpdateTemplateCommandValidator.cs`
15. `BE/src/Application/UseCases/V1/Users/Commands/CreateUserCommandValidator.cs`
16. `BE/src/Application/UseCases/V1/Users/Commands/UpdateUserCommandValidator.cs`

#### C. Các file test cần sửa `using` directive trong `BE/test/UnitTests/` (8 files):
1. `BE/test/UnitTests/Application/Auth/RegisterCommandValidatorTests.cs`  
   - Đổi `using TemplateLandingPage.Application.UseCases.V1.Auth.Commands;` -> `using TemplateLandingPage.Application.UseCases.V1.Auth.Validators;`
2. `BE/test/UnitTests/Application/Categories/CategoryCommandValidatorTests.cs`  
   - Đổi `using TemplateLandingPage.Application.UseCases.V1.Categories.Commands;` -> `using TemplateLandingPage.Application.UseCases.V1.Categories.Validators;`
3. `BE/test/UnitTests/Application/Customizations/CreateCustomizationCommandValidatorTests.cs`  
   - Đổi `using TemplateLandingPage.Application.UseCases.V1.Customizations.Commands;` -> `using TemplateLandingPage.Application.UseCases.V1.Customizations.Validators;`
4. `BE/test/UnitTests/Application/Interactions/SubmitGuestbookCommandValidatorTests.cs`  
   - Đổi `using TemplateLandingPage.Application.UseCases.V1.Interactions.Commands;` -> `using TemplateLandingPage.Application.UseCases.V1.Interactions.Validators;`
5. `BE/test/UnitTests/Application/Interactions/SubmitRsvpCommandValidatorTests.cs`  
   - Đổi `using TemplateLandingPage.Application.UseCases.V1.Interactions.Commands;` -> `using TemplateLandingPage.Application.UseCases.V1.Interactions.Validators;`
6. `BE/test/UnitTests/Application/NavigationMenus/NavigationMenuCommandValidatorTests.cs`  
   - Đổi `using TemplateLandingPage.Application.UseCases.V1.NavigationMenus.Commands;` -> `using TemplateLandingPage.Application.UseCases.V1.NavigationMenus.Validators;`
7. `BE/test/UnitTests/Application/Products/CreateProductCommandValidatorTests.cs`  
   - Đổi `using TemplateLandingPage.Application.UseCases.V1.Products.Commands;` -> `using TemplateLandingPage.Application.UseCases.V1.Products.Validators;`
8. `BE/test/UnitTests/Application/Products/UpdateProductCommandValidatorTests.cs`  
   - Đổi `using TemplateLandingPage.Application.UseCases.V1.Products.Commands;` -> `using TemplateLandingPage.Application.UseCases.V1.Products.Validators;`

### 2.2. Frontend (FE)
- **Không có file nào cần tạo mới hoặc sửa**: Đây là việc tái cấu trúc thư mục nội bộ tầng Application của Backend, hoàn toàn không làm thay đổi API route, tham số request/response hay bất kỳ giao diện FE nào.

---

## 3. CHỮ KÝ HÀM HOẶC INTERFACE CẦN CÓ

Tất cả 16 class validator giữ nguyên cấu trúc rules bên trong, chỉ đổi namespace theo đúng cấu trúc thư mục `Validators/` và giữ kế thừa `AbstractValidator<T>`:

### 3.1. Auth
```csharp
namespace TemplateLandingPage.Application.UseCases.V1.Auth.Validators;

using FluentValidation;
using TemplateLandingPage.Contract.Services.V1.Auth;

public sealed class LoginCommandValidator : AbstractValidator<LoginCommand>
public sealed class RegisterCommandValidator : AbstractValidator<RegisterCommand>
```

### 3.2. Categories
```csharp
namespace TemplateLandingPage.Application.UseCases.V1.Categories.Validators;

using FluentValidation;
using TemplateLandingPage.Contract.Services.V1.Categories;

public sealed class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
public sealed class UpdateCategoryCommandValidator : AbstractValidator<UpdateCategoryCommand>
```

### 3.3. Customizations
```csharp
namespace TemplateLandingPage.Application.UseCases.V1.Customizations.Validators;

using FluentValidation;
using TemplateLandingPage.Contract.Services.V1.Customizations;

public sealed class CreateCustomizationCommandValidator : AbstractValidator<CreateCustomizationCommand>
public sealed class UpdateCustomizationCommandValidator : AbstractValidator<UpdateCustomizationCommand>
```

### 3.4. Interactions
```csharp
namespace TemplateLandingPage.Application.UseCases.V1.Interactions.Validators;

using FluentValidation;
using TemplateLandingPage.Contract.Services.V1.Interactions;

public sealed class SubmitGuestbookCommandValidator : AbstractValidator<SubmitGuestbookCommand>
public sealed class SubmitRsvpCommandValidator : AbstractValidator<SubmitRsvpCommand>
```

### 3.5. NavigationMenus
```csharp
namespace TemplateLandingPage.Application.UseCases.V1.NavigationMenus.Validators;

using FluentValidation;
using TemplateLandingPage.Contract.Services.V1.NavigationMenus;

public sealed class CreateNavigationMenuCommandValidator : AbstractValidator<CreateNavigationMenuCommand>
public sealed class UpdateNavigationMenuCommandValidator : AbstractValidator<UpdateNavigationMenuCommand>
```

### 3.6. Products
```csharp
namespace TemplateLandingPage.Application.UseCases.V1.Products.Validators;

using FluentValidation;
using TemplateLandingPage.Contract.Services.V1.Products;

public sealed class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
public sealed class UpdateProductCommandValidator : AbstractValidator<UpdateProductCommand>
```

### 3.7. Templates
```csharp
namespace TemplateLandingPage.Application.UseCases.V1.Templates.Validators;

using FluentValidation;
using TemplateLandingPage.Contract.Services.V1.Templates;

public sealed class CreateTemplateCommandValidator : AbstractValidator<CreateTemplateCommand>
public sealed class UpdateTemplateCommandValidator : AbstractValidator<UpdateTemplateCommand>
```

### 3.8. Users
```csharp
namespace TemplateLandingPage.Application.UseCases.V1.Users.Validators;

using FluentValidation;
using TemplateLandingPage.Contract.Services.V1.Users;

public sealed class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
public sealed class UpdateUserCommandValidator : AbstractValidator<UpdateUserCommand>
```

---

## 4. CÁC TRƯỜNG HỢP BIÊN BẮT BUỘC PHẢI XỬ LÝ

1. **Xóa sạch file cũ trong `Commands/`**:
   - Tránh để tồn tại song song 2 class cùng tên trong project gây lỗi xung đột hoặc đăng ký lặp validator trong FluentValidation.
2. **Cơ chế DI Assembly Scanning (`services.AddValidatorsFromAssembly`)**:
   - Trong `BE/src/Application/DependencyInjection/Extensions/ServiceCollectionExtensions.cs`, lệnh `services.AddValidatorsFromAssembly(assembly);` quét toàn bộ assembly `TemplateLandingPage.Application`.
   - Các class validator mới trong `Validators/` bắt buộc phải là `public sealed class` để DI scanner tự động nhận diện và đăng ký mà không cần sửa file cấu hình DI.
3. **Tuân thủ NetArchTest Architecture Tests (`BE/test/Architecture.Tests`)**:
   - Kiểm tra `Application_Should_Not_HaveDependencyOnOuterLayers`: Các validator mới chỉ được phụ thuộc vào FluentValidation và `TemplateLandingPage.Contract`, tuyệt đối không reference tới `Persistence`, `Infrastructure`, `Presentation`, hoặc `API`.
   - Kiểm tra `Handlers_Should_Have_NameEndingWith_Handler`: Validator kế thừa `AbstractValidator<T>` (không implement `IRequestHandler`), không vi phạm quy tắc naming handler.
4. **Kiểm tra biên dịch và chạy Unit Tests**:
   - 8 file Unit Test liên quan trực tiếp đến Validator phải đổi using từ `Commands` sang `Validators`.
   - Tất cả 149 UnitTests và 5 Architecture Tests phải chạy pass 100% khi thực thi `dotnet test BE/TemplateLandingPage.sln`.

---

## 5. QUY ƯỚC CẦN BÁM THEO

1. **Tệp quy chuẩn chính**:
   - `PromtAI/.gemini/agents/coder.md`:
     - **Mục A1 - Quy tắc Namespace**: Namespace = đường dẫn thư mục (`TemplateLandingPage.Application.UseCases.V1.{Feature}.Validators`).
     - **Mục A1 - Quy tắc Type & File**: 1 file = 1 type chính, Tên file = Tên type.
     - **Mục A3 - Quy tắc đặt tên**: `PascalCase` cho class, kết thúc bằng `CommandValidator`. Access modifier: `public sealed class`.
     - **Mục C1 - Nguyên tắc chung**: Build sạch (`dotnet build` và `dotnet test`), không để code chết / import thừa.
2. **File mẫu tham chiếu trong codebase**:
   - `BE/src/Application/UseCases/V1/Auth/Commands/LoginCommandValidator.cs` (Cấu trúc File-scoped namespace, using directives ngắn gọn, kế thừa `AbstractValidator<T>`).
