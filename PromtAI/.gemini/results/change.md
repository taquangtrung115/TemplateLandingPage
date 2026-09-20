# BÁO CÁO THAY ĐỔI MÃ NGUỒN (CHANGE.MD)
Tái cấu trúc thư mục Validator cho Backend (`BE/src/Application/UseCases/V1/`)

---

## 1. Danh sách file thay đổi / tạo mới / đã xóa

### 1.1. File tạo mới trong thư mục `Validators/` (16 files):
- `BE/src/Application/UseCases/V1/Auth/Validators/LoginCommandValidator.cs`
- `BE/src/Application/UseCases/V1/Auth/Validators/RegisterCommandValidator.cs`
- `BE/src/Application/UseCases/V1/Categories/Validators/CreateCategoryCommandValidator.cs`
- `BE/src/Application/UseCases/V1/Categories/Validators/UpdateCategoryCommandValidator.cs`
- `BE/src/Application/UseCases/V1/Customizations/Validators/CreateCustomizationCommandValidator.cs`
- `BE/src/Application/UseCases/V1/Customizations/Validators/UpdateCustomizationCommandValidator.cs`
- `BE/src/Application/UseCases/V1/Interactions/Validators/SubmitGuestbookCommandValidator.cs`
- `BE/src/Application/UseCases/V1/Interactions/Validators/SubmitRsvpCommandValidator.cs`
- `BE/src/Application/UseCases/V1/NavigationMenus/Validators/CreateNavigationMenuCommandValidator.cs`
- `BE/src/Application/UseCases/V1/NavigationMenus/Validators/UpdateNavigationMenuCommandValidator.cs`
- `BE/src/Application/UseCases/V1/Products/Validators/CreateProductCommandValidator.cs`
- `BE/src/Application/UseCases/V1/Products/Validators/UpdateProductCommandValidator.cs`
- `BE/src/Application/UseCases/V1/Templates/Validators/CreateTemplateCommandValidator.cs`
- `BE/src/Application/UseCases/V1/Templates/Validators/UpdateTemplateCommandValidator.cs`
- `BE/src/Application/UseCases/V1/Users/Validators/CreateUserCommandValidator.cs`
- `BE/src/Application/UseCases/V1/Users/Validators/UpdateUserCommandValidator.cs`

### 1.2. File cũ đã xóa trong thư mục `Commands/` (16 files):
- `BE/src/Application/UseCases/V1/Auth/Commands/LoginCommandValidator.cs`
- `BE/src/Application/UseCases/V1/Auth/Commands/RegisterCommandValidator.cs`
- `BE/src/Application/UseCases/V1/Categories/Commands/CreateCategoryCommandValidator.cs`
- `BE/src/Application/UseCases/V1/Categories/Commands/UpdateCategoryCommandValidator.cs`
- `BE/src/Application/UseCases/V1/Customizations/Commands/CreateCustomizationCommandValidator.cs`
- `BE/src/Application/UseCases/V1/Customizations/Commands/UpdateCustomizationCommandValidator.cs`
- `BE/src/Application/UseCases/V1/Interactions/Commands/SubmitGuestbookCommandValidator.cs`
- `BE/src/Application/UseCases/V1/Interactions/Commands/SubmitRsvpCommandValidator.cs`
- `BE/src/Application/UseCases/V1/NavigationMenus/Commands/CreateNavigationMenuCommandValidator.cs`
- `BE/src/Application/UseCases/V1/NavigationMenus/Commands/UpdateNavigationMenuCommandValidator.cs`
- `BE/src/Application/UseCases/V1/Products/Commands/CreateProductCommandValidator.cs`
- `BE/src/Application/UseCases/V1/Products/Commands/UpdateProductCommandValidator.cs`
- `BE/src/Application/UseCases/V1/Templates/Commands/CreateTemplateCommandValidator.cs`
- `BE/src/Application/UseCases/V1/Templates/Commands/UpdateTemplateCommandValidator.cs`
- `BE/src/Application/UseCases/V1/Users/Commands/CreateUserCommandValidator.cs`
- `BE/src/Application/UseCases/V1/Users/Commands/UpdateUserCommandValidator.cs`

### 1.3. File Unit Tests đã cập nhật `using` directive (8 files):
- `BE/test/UnitTests/Application/Auth/RegisterCommandValidatorTests.cs`
- `BE/test/UnitTests/Application/Categories/CategoryCommandValidatorTests.cs`
- `BE/test/UnitTests/Application/Customizations/CreateCustomizationCommandValidatorTests.cs`
- `BE/test/UnitTests/Application/Interactions/SubmitGuestbookCommandValidatorTests.cs`
- `BE/test/UnitTests/Application/Interactions/SubmitRsvpCommandValidatorTests.cs`
- `BE/test/UnitTests/Application/NavigationMenus/NavigationMenuCommandValidatorTests.cs`
- `BE/test/UnitTests/Application/Products/CreateProductCommandValidatorTests.cs`
- `BE/test/UnitTests/Application/Products/UpdateProductCommandValidatorTests.cs`

---

## 2. Mục đích từng chỗ sửa

1. **Tách riêng thư mục `Validators/`**:
   - Chuyển toàn bộ các validator ra khỏi thư mục `Commands/` của từng feature để phân định rõ ràng giữa Command Handlers (xử lý nghiệp vụ) và Validators (kiểm tra tính hợp lệ dữ liệu đầu vào).
2. **Chuẩn hóa Namespace**:
   - Cập nhật namespace từ `TemplateLandingPage.Application.UseCases.V1.{Feature}.Commands` sang `TemplateLandingPage.Application.UseCases.V1.{Feature}.Validators` theo đúng quy ước kiến trúc: *Namespace = Đường dẫn thư mục*.
3. **Cập nhật Unit Tests**:
   - Sửa chỉ thị `using` trong 8 file test tương ứng để tham chiếu đúng namespace mới của validator, đảm bảo không làm gián đoạn kiểm thử tự động.
4. **Dọn dẹp code cũ**:
   - Xóa bỏ hoàn toàn 16 file validator cũ trong `Commands/` nhằm ngăn ngừa trùng lặp type và tránh assembly scanner đăng ký validator hai lần.

---

## 3. Vị trí trọng yếu mà Tester nên soi kỹ

1. **Cơ chế Assembly Scanning của FluentValidation**:
   - Tester cần xác minh pipeline validation của MediatR (`ValidationBehavior`) khi gửi request command qua API (Auth, Categories, Customizations, Interactions, NavigationMenus, Products, Templates, Users) vẫn kích hoạt đúng validator và trả về HTTP 400 Bad Request kèm danh sách lỗi chi tiết nếu dữ liệu không hợp lệ.
2. **Tính toàn vẹn của Unit Tests**:
   - Toàn bộ 149 Unit Tests trong `TemplateLandingPage.UnitTests` phải pass 100%, đặc biệt các test kiểm tra rule độ dài mật khẩu, email hợp lệ, not empty và số lượng khách mời tối thiểu.
3. **Architecture Tests**:
   - 5 bài kiểm tra trong `TemplateLandingPage.Architecture.Tests` đảm bảo các validator mới trong thư mục `Validators/` tuân thủ nghiêm ngặt quy tắc kiến trúc Clean Architecture: chỉ phụ thuộc Contract / FluentValidation, không phụ thuộc Persistence, Infrastructure hay API.
4. **Kết quả kiểm thử thực tế tại thời điểm triển khai**:
   - `dotnet test BE/TemplateLandingPage.sln /p:AllowMissingPrunePackageData=true`: **154/154 tests Passed** (149 UnitTests + 5 ArchitectureTests, 0 Failed, 0 Skipped).
   - `npm run build` (FE): **Thành công 100%**, không có lỗi TypeScript hay build chunk.
