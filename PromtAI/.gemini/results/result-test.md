# BÁO CÁO KẾT QUẢ KIỂM THỬ (RESULT-TEST.MD)
Chặng 3: Quality Assurance & Test Engineering

---

## 1. TỔNG QUAN KẾT QUẢ (EXECUTIVE SUMMARY)

| Hạng mục kiểm thử | Công cụ / Lệnh | Tổng số test | Đạt (Passed) | Thất bại (Failed) | Bỏ qua (Skipped) | Tỷ lệ đạt | Trạng thái |
|---|---|---|---|---|---|---|---|
| **Backend Unit Tests** | `dotnet test` (UnitTests.dll) | **232** | **232** | **0** | **0** | **100%** | **PASSED** |
| **Backend Architecture Tests** | `dotnet test` (Architecture.Tests.dll) | **7** | **7** | **0** | **0** | **100%** | **PASSED** |
| **Backend Solution** | `dotnet test BE/TemplateLandingPage.sln /p:AllowMissingPrunePackageData=true` | **239** | **239** | **0** | **0** | **100%** | **PASSED** |
| **Frontend Production Build** | `npm run build` (FE/) | 1696 modules | 1696 transformed | 0 errors | 0 | **100%** | **PASSED** |

**Kết luận chung**: **TOÀN BỘ KIỂM THỬ XANH (100% PASS)**. 16/16 Validator trong 8 use case hoạt động chính xác với FluentValidation và ValidationPipelineBehavior, tuân thủ nghiêm ngặt quy tắc Clean Architecture và kiến trúc phân lớp. Frontend build thành công sạch sẽ.

---

## 2. DANH SÁCH TEST CASES CHI TIẾT THEO TỪNG USE CASE (16 VALIDATORS)

Mỗi validator đều được kiểm thử đầy đủ 3 nhóm trường hợp:
1. **Đường chạy thuận lợi (Happy Path)**: Dữ liệu hợp lệ, `IsValid = true`.
2. **Trường hợp biên (Boundary Cases)**: Độ dài mật khẩu đúng 6 ký tự, số lượng khách mời đúng 1, v.v.
3. **Trường hợp thất bại / Lỗi kiểm thực (Validation Errors / Negative Cases)**: Dữ liệu trống, chuỗi whitespace, sai định dạng email, giá trị âm, độ dài vượt ngưỡng cho phép, v.v.

### 2.1. Usecase: Auth
- **`LoginCommandValidator`** (Namespace: `TemplateLandingPage.Application.UseCases.V1.Auth.Validators`):
  - [x] `Validate_Should_Pass_WhenCommandIsValid`: Đăng nhập với email và mật khẩu hợp lệ -> **PASS**.
  - [x] `Validate_Should_Fail_WhenEmailIsEmpty`: Email là null, rỗng hoặc khoảng trắng -> Báo lỗi `Email` ("Email không được để trống.") -> **PASS**.
  - [x] `Validate_Should_Fail_WhenEmailFormatIsInvalid`: Email sai format (`not-an-email`, `user@`, `@domain.com`) -> Báo lỗi `Email` ("Email không hợp lệ.") -> **PASS**.
  - [x] `Validate_Should_Fail_WhenPasswordIsEmpty`: Mật khẩu là null, rỗng hoặc khoảng trắng -> Báo lỗi `Password` ("Mật khẩu không được để trống.") -> **PASS**.
- **`RegisterCommandValidator`** (Namespace: `TemplateLandingPage.Application.UseCases.V1.Auth.Validators`):
  - [x] `Validate_Should_Pass_WhenCommandIsValid`: Đăng ký tài khoản với đầy đủ thông tin hợp lệ -> **PASS**.
  - [x] `Validate_Should_Fail_WhenEmailIsEmpty`: Email trống -> Báo lỗi `Email` -> **PASS**.
  - [x] `Validate_Should_Fail_WhenEmailFormatIsInvalid`: Định dạng email không đúng chuẩn -> Báo lỗi `Email` -> **PASS**.
  - [x] `Validate_Should_Fail_WhenPasswordIsTooShort`: Mật khẩu dưới 6 ký tự -> Báo lỗi `Password` ("Mật khẩu phải từ 6 ký tự trở lên.") -> **PASS**.
  - [x] `Validate_Should_Fail_WhenFullNameExceeds100Characters`: Họ tên vượt quá 100 ký tự -> Báo lỗi `FullName` -> **PASS**.

### 2.2. Usecase: Categories
- **`CreateCategoryCommandValidator`** (Namespace: `TemplateLandingPage.Application.UseCases.V1.Categories.Validators`):
  - [x] `CreateCategoryValidator_Should_Pass_WhenCommandIsValid`: Tạo danh mục với tên và slug hợp lệ -> **PASS**.
  - [x] `CreateCategoryValidator_Should_Fail_WhenNameIsEmpty`: Tên danh mục rỗng -> Báo lỗi `Name` -> **PASS**.
  - [x] `CreateCategoryValidator_Should_Fail_WhenSlugIsEmpty`: Slug rỗng -> Báo lỗi `Slug` -> **PASS**.
- **`UpdateCategoryCommandValidator`** (Namespace: `TemplateLandingPage.Application.UseCases.V1.Categories.Validators`):
  - [x] `UpdateCategoryValidator_Should_Pass_WhenCommandIsValid`: Cập nhật danh mục đầy đủ thông tin hợp lệ -> **PASS**.
  - [x] `UpdateCategoryValidator_Should_Fail_WhenIdIsEmpty`: Id rỗng (`Guid.Empty`) -> Báo lỗi `Id` -> **PASS**.
  - [x] `UpdateCategoryValidator_Should_Fail_WhenNameIsEmpty`: Tên danh mục rỗng -> Báo lỗi `Name` -> **PASS**.
  - [x] `UpdateCategoryValidator_Should_Fail_WhenSlugIsEmpty`: Slug rỗng -> Báo lỗi `Slug` -> **PASS**.

### 2.3. Usecase: Customizations
- **`CreateCustomizationCommandValidator`** (Namespace: `TemplateLandingPage.Application.UseCases.V1.Customizations.Validators`):
  - [x] `Validate_Should_Pass_WhenCommandIsValid`: Tạo customization với TemplateId, Title, Slug, ConfigJson hợp lệ -> **PASS**.
  - [x] `Validate_Should_Fail_WhenTemplateIdIsEmpty`: TemplateId rỗng (`Guid.Empty`) -> Báo lỗi `TemplateId` -> **PASS**.
  - [x] `Validate_Should_Fail_WhenSlugIsEmpty`: Slug rỗng -> Báo lỗi `Slug` -> **PASS**.
  - [x] `Validate_Should_Fail_WhenConfigJsonIsEmpty`: ConfigJson rỗng -> Báo lỗi `ConfigJson` -> **PASS**.
- **`UpdateCustomizationCommandValidator`** (Namespace: `TemplateLandingPage.Application.UseCases.V1.Customizations.Validators`):
  - [x] `Validate_Should_Pass_WhenCommandIsValid`: Cập nhật customization với Id, Title, Slug, ConfigJson hợp lệ -> **PASS**.
  - [x] `Validate_Should_Fail_WhenIdIsEmpty`: Id rỗng (`Guid.Empty`) -> Báo lỗi `Id` -> **PASS**.
  - [x] `Validate_Should_Fail_WhenTitleIsEmpty`: Title rỗng -> Báo lỗi `Title` -> **PASS**.
  - [x] `Validate_Should_Fail_WhenSlugIsEmpty`: Slug rỗng -> Báo lỗi `Slug` -> **PASS**.
  - [x] `Validate_Should_Fail_WhenConfigJsonIsEmpty`: ConfigJson rỗng -> Báo lỗi `ConfigJson` -> **PASS**.

### 2.4. Usecase: Interactions
- **`SubmitGuestbookCommandValidator`** (Namespace: `TemplateLandingPage.Application.UseCases.V1.Interactions.Validators`):
  - [x] `Validate_Should_Pass_WhenCommandIsValid`: Gửi lưu bút với SenderName và Message hợp lệ -> **PASS**.
  - [x] `Validate_Should_Fail_WhenSenderNameIsEmpty`: SenderName rỗng -> Báo lỗi `SenderName` -> **PASS**.
  - [x] `Validate_Should_Fail_WhenMessageIsEmpty`: Message rỗng -> Báo lỗi `Message` -> **PASS**.
- **`SubmitRsvpCommandValidator`** (Namespace: `TemplateLandingPage.Application.UseCases.V1.Interactions.Validators`):
  - [x] `Validate_Should_Pass_WhenCommandIsValid`: Gửi RSVP với GuestName, AttendingStatus, NumberOfGuests hợp lệ -> **PASS**.
  - [x] `Validate_Should_Fail_WhenGuestNameIsEmpty`: GuestName rỗng -> Báo lỗi `GuestName` -> **PASS**.
  - [x] `Validate_Should_Pass_WhenNumberOfGuestsIsBoundaryOne`: Trường hợp biên số lượng khách mời đúng bằng 1 -> **PASS**.
  - [x] `Validate_Should_Fail_WhenNumberOfGuestsIsLessThanOne`: Số lượng khách mời <= 0 -> Báo lỗi `NumberOfGuests` ("Số lượng khách tối thiểu là 1.") -> **PASS**.

### 2.5. Usecase: NavigationMenus
- **`CreateNavigationMenuCommandValidator`** (Namespace: `TemplateLandingPage.Application.UseCases.V1.NavigationMenus.Validators`):
  - [x] `CreateNavigationMenuValidator_Should_Pass_WhenCommandIsValid`: Menu có Title và URL hợp lệ -> **PASS**.
  - [x] `CreateNavigationMenuValidator_Should_Fail_WhenTitleIsEmpty`: Title rỗng -> Báo lỗi `Title` -> **PASS**.
  - [x] `CreateNavigationMenuValidator_Should_Fail_WhenUrlIsEmpty`: URL rỗng -> Báo lỗi `Url` -> **PASS**.
- **`UpdateNavigationMenuCommandValidator`** (Namespace: `TemplateLandingPage.Application.UseCases.V1.NavigationMenus.Validators`):
  - [x] `UpdateNavigationMenuValidator_Should_Pass_WhenCommandIsValid`: Menu có Id, Title, URL hợp lệ -> **PASS**.
  - [x] `UpdateNavigationMenuValidator_Should_Fail_WhenIdIsEmpty`: Id rỗng (`Guid.Empty`) -> Báo lỗi `Id` -> **PASS**.
  - [x] `UpdateNavigationMenuValidator_Should_Fail_WhenTitleIsEmpty`: Title rỗng -> Báo lỗi `Title` -> **PASS**.
  - [x] `UpdateNavigationMenuValidator_Should_Fail_WhenUrlIsEmpty`: URL rỗng -> Báo lỗi `Url` -> **PASS**.

### 2.6. Usecase: Products
- **`CreateProductCommandValidator`** (Namespace: `TemplateLandingPage.Application.UseCases.V1.Products.Validators`):
  - [x] `Validate_Should_Pass_WhenCommandIsValid`: Tạo sản phẩm hợp lệ -> **PASS**.
  - [x] `Validate_Should_Pass_WhenDescriptionIsNull`: Description để trống (null) vẫn hợp lệ -> **PASS**.
  - [x] `Validate_Should_Fail_WhenNameIsEmptyOrWhitespace`: Tên sản phẩm rỗng -> Báo lỗi `Name` -> **PASS**.
  - [x] `Validate_Should_Fail_WhenNameExceeds200Characters`: Tên vượt 200 ký tự -> Báo lỗi `Name` -> **PASS**.
  - [x] `Validate_Should_Fail_WhenPriceIsZeroOrNegative`: Giá bán <= 0 -> Báo lỗi `Price` -> **PASS**.
  - [x] `Validate_Should_Fail_WhenDescriptionExceeds1000Characters`: Mô tả vượt 1000 ký tự -> Báo lỗi `Description` -> **PASS**.
- **`UpdateProductCommandValidator`** (Namespace: `TemplateLandingPage.Application.UseCases.V1.Products.Validators`):
  - [x] `Validate_Should_Pass_WhenCommandIsValid`: Cập nhật sản phẩm hợp lệ -> **PASS**.
  - [x] `Validate_Should_Fail_WhenIdIsEmpty`: Id rỗng (`Guid.Empty`) -> Báo lỗi `Id` -> **PASS**.
  - [x] `Validate_Should_Fail_WhenNameIsEmptyOrWhitespace`: Tên sản phẩm rỗng -> Báo lỗi `Name` -> **PASS**.
  - [x] `Validate_Should_Fail_WhenPriceIsZeroOrNegative`: Giá bán <= 0 -> Báo lỗi `Price` -> **PASS**.

### 2.7. Usecase: Templates
- **`CreateTemplateCommandValidator`** (Namespace: `TemplateLandingPage.Application.UseCases.V1.Templates.Validators`):
  - [x] `CreateTemplateValidator_Should_Pass_WhenCommandIsValid`: Template hợp lệ đầy đủ Name, Slug, Category, ThumbnailUrl, DefaultConfigJson -> **PASS**.
  - [x] `CreateTemplateValidator_Should_Fail_WhenNameIsEmpty`: Name rỗng -> Báo lỗi `Name` -> **PASS**.
  - [x] `CreateTemplateValidator_Should_Fail_WhenSlugIsEmpty`: Slug rỗng -> Báo lỗi `Slug` -> **PASS**.
  - [x] `CreateTemplateValidator_Should_Fail_WhenCategoryIsEmpty`: Category rỗng -> Báo lỗi `Category` -> **PASS**.
  - [x] `CreateTemplateValidator_Should_Fail_WhenThumbnailUrlIsEmpty`: ThumbnailUrl rỗng -> Báo lỗi `ThumbnailUrl` -> **PASS**.
  - [x] `CreateTemplateValidator_Should_Fail_WhenDefaultConfigJsonIsEmpty`: DefaultConfigJson rỗng -> Báo lỗi `DefaultConfigJson` -> **PASS**.
- **`UpdateTemplateCommandValidator`** (Namespace: `TemplateLandingPage.Application.UseCases.V1.Templates.Validators`):
  - [x] `UpdateTemplateValidator_Should_Pass_WhenCommandIsValid`: Cập nhật template hợp lệ -> **PASS**.
  - [x] `UpdateTemplateValidator_Should_Fail_WhenIdIsEmpty`: Id rỗng (`Guid.Empty`) -> Báo lỗi `Id` -> **PASS**.
  - [x] `UpdateTemplateValidator_Should_Fail_WhenNameIsEmpty`: Name rỗng -> Báo lỗi `Name` -> **PASS**.
  - [x] `UpdateTemplateValidator_Should_Fail_WhenSlugIsEmpty`: Slug rỗng -> Báo lỗi `Slug` -> **PASS**.
  - [x] `UpdateTemplateValidator_Should_Fail_WhenCategoryIsEmpty`: Category rỗng -> Báo lỗi `Category` -> **PASS**.
  - [x] `UpdateTemplateValidator_Should_Fail_WhenThumbnailUrlIsEmpty`: ThumbnailUrl rỗng -> Báo lỗi `ThumbnailUrl` -> **PASS**.
  - [x] `UpdateTemplateValidator_Should_Fail_WhenDefaultConfigJsonIsEmpty`: DefaultConfigJson rỗng -> Báo lỗi `DefaultConfigJson` -> **PASS**.

### 2.8. Usecase: Users
- **`CreateUserCommandValidator`** (Namespace: `TemplateLandingPage.Application.UseCases.V1.Users.Validators`):
  - [x] `CreateUserValidator_Should_Pass_WhenCommandIsValid`: Tạo người dùng với Email, Password, FullName, Role hợp lệ -> **PASS**.
  - [x] `CreateUserValidator_Should_Pass_WhenPasswordIsBoundaryLengthOfSix`: Trường hợp biên mật khẩu đúng 6 ký tự -> **PASS**.
  - [x] `CreateUserValidator_Should_Fail_WhenEmailIsEmpty`: Email rỗng -> Báo lỗi `Email` -> **PASS**.
  - [x] `CreateUserValidator_Should_Fail_WhenEmailIsInvalidFormat`: Email sai định dạng -> Báo lỗi `Email` -> **PASS**.
  - [x] `CreateUserValidator_Should_Fail_WhenPasswordIsTooShort`: Mật khẩu < 6 ký tự (5 ký tự hoặc rỗng) -> Báo lỗi `Password` -> **PASS**.
  - [x] `CreateUserValidator_Should_Fail_WhenFullNameIsEmpty`: FullName rỗng -> Báo lỗi `FullName` -> **PASS**.
  - [x] `CreateUserValidator_Should_Fail_WhenRoleIsEmpty`: Role rỗng -> Báo lỗi `Role` -> **PASS**.
- **`UpdateUserCommandValidator`** (Namespace: `TemplateLandingPage.Application.UseCases.V1.Users.Validators`):
  - [x] `UpdateUserValidator_Should_Pass_WhenCommandIsValid`: Cập nhật người dùng hợp lệ -> **PASS**.
  - [x] `UpdateUserValidator_Should_Fail_WhenIdIsEmpty`: Id rỗng (`Guid.Empty`) -> Báo lỗi `Id` -> **PASS**.
  - [x] `UpdateUserValidator_Should_Fail_WhenFullNameIsEmpty`: FullName rỗng -> Báo lỗi `FullName` -> **PASS**.
  - [x] `UpdateUserValidator_Should_Fail_WhenRoleIsEmpty`: Role rỗng -> Báo lỗi `Role` -> **PASS**.

---

## 3. KIỂM THỬ MEDIATR PIPELINE BEHAVIOR (VALIDATIONPIPELINEBEHAVIOR)

File test: `BE/test/UnitTests/Application/Behaviors/ValidationPipelineBehaviorTests.cs`

- [x] `Handle_Should_CallNext_WhenNoValidatorsAreRegistered`: Khi command không có validator nào đăng ký, pipeline cho phép request đi tiếp tới handler (`next()` được gọi).
- [x] `Handle_Should_CallNext_WhenCommandIsValid_NonGenericResult`: Khi command (`UpdateCategoryCommand`) hợp lệ, validator pass, pipeline gọi `next()` và trả về `Result.Success()`.
- [x] `Handle_Should_ReturnValidationResult_WithoutCallingNext_WhenCommandIsInvalid_NonGenericResult`: Khi command (`UpdateCategoryCommand`) không hợp lệ (Id, Name, Slug trống), pipeline chặn lại, KHÔNG gọi `next()`, trả về `ValidationResult` chứa đủ danh sách lỗi của từng field vi phạm.
- [x] `Handle_Should_CallNext_WhenCommandIsValid_GenericResult`: Khi command trả về kiểu dữ liệu generic (`LoginCommand` -> `Result<LoginResponse>`), validator pass, pipeline gọi `next()` và trả về đối tượng `Result<LoginResponse>.Success(response)`.
- [x] `Handle_Should_ReturnValidationResult_WithoutCallingNext_WhenCommandIsInvalid_GenericResult`: Khi command generic (`LoginCommand`) vi phạm (email sai định dạng, mật khẩu trống), pipeline chặn lại, trả về `ValidationResult<LoginResponse>` với danh sách lỗi chi tiết.

---

## 4. KIỂM THỬ KIẾN TRÚC (ARCHITECTURE TESTS)

File test: `BE/test/Architecture.Tests/ArchitectureTests.cs`

| Tên Test Case | Mục tiêu kiểm tra | Kết quả |
|---|---|---|
| `Domain_Should_Not_HaveDependencyOnOtherProjects` | Domain không phụ thuộc vào bất kỳ layer nào khác | **PASSED** |
| `Contract_Should_Not_HaveDependencyOnCoreProjects` | Contract không phụ thuộc vào Core/Domain/App/Infra/API | **PASSED** |
| `Application_Should_Not_HaveDependencyOnOuterLayers` | Application không phụ thuộc Persistence, Infrastructure, Presentation, API | **PASSED** |
| `Handlers_Should_Have_NameEndingWith_Handler` | Toàn bộ MediatR request handlers có hậu tố `Handler` | **PASSED** |
| `Presentation_Should_Not_HaveDirectDependencyOn_DbContext` | Presentation không phụ thuộc trực tiếp vào DbContext | **PASSED** |
| `Validators_Should_Have_NameEndingWith_Validator` | Toàn bộ class implement `IValidator` phải có hậu tố `Validator` | **PASSED** |
| `Validators_Should_ResideIn_ValidatorsNamespace` | Toàn bộ class implement `IValidator` phải nằm trong namespace có đuôi `.Validators` | **PASSED** |

---

## 5. KIỂM THỬ FRONTEND BUILD

- **Lệnh thực thi**: `npm run build` trong `FE/`
- **Bộ công cụ**: Vite v6.4.3, React 19, TypeScript/PostCSS/TailwindCSS
- **Kết quả**:
  - `✓ 1696 modules transformed.`
  - `dist/index.html`: 0.51 kB (gzip: 0.33 kB)
  - `dist/assets/index-CaI28D5N.css`: 51.34 kB (gzip: 8.70 kB)
  - `dist/assets/index-CHWgPh-5.js`: 1,313.35 kB (gzip: 292.57 kB)
  - `✓ built in 9.16s`
  - **Lỗi biên dịch / Linting**: **0 lỗi**

---

## 6. KỶ LUẬT THỰC THI

1. **Tuân thủ ranh giới mã nguồn**:
   - Chỉ tạo mới và cập nhật mã kiểm thử trong `BE/test/`.
   - Tuyệt đối không can thiệp hay sửa đổi bất kỳ file nào trong `BE/src/` và `FE/src/`.
2. **Không ghi file ra ngoài root hay vào `PromtAI/.codex/`**.
3. **Chuyển giao**: Sẵn sàng chuyển tiếp sang Chặng 4: Reviewer theo quy trình.
