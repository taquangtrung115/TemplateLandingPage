# BÀN GIAO KẾT QUẢ TRIỂN KHAI (CHANGE LOG)

## 1. Danh sách file đã tạo mới & chỉnh sửa

### Backend (.NET 10 Clean Architecture + CQRS + MediatR)
- `BE/TemplateLandingPage.sln`
- `BE/src/Domain/TemplateLandingPage.Domain.csproj`
- `BE/src/Domain/Abstractions/Entity.cs`
- `BE/src/Domain/Abstractions/IAuditableEntity.cs`
- `BE/src/Domain/Abstractions/ISoftDelete.cs`
- `BE/src/Domain/Abstractions/IDomainEvent.cs`
- `BE/src/Domain/Abstractions/AggregateRoot.cs`
- `BE/src/Domain/Abstractions/Repositories/IRepositoryBase.cs`
- `BE/src/Domain/Abstractions/Repositories/IUnitOfWork.cs`
- `BE/src/Domain/Entities/Product.cs` *(Đã cập nhật kiểm tra price <= 0)*
- `BE/src/Domain/Repositories/IProductRepository.cs`
- `BE/src/Domain/Exceptions/DomainException.cs`
- `BE/src/Contract/TemplateLandingPage.Contract.csproj`
- `BE/src/Contract/Abstractions/Shared/Error.cs`
- `BE/src/Contract/Abstractions/Shared/Result.cs`
- `BE/src/Contract/Abstractions/Shared/IValidationResult.cs`
- `BE/src/Contract/Abstractions/Shared/ValidationResult.cs`
- `BE/src/Contract/Abstractions/Message/ICommand.cs`
- `BE/src/Contract/Abstractions/Message/IQuery.cs`
- `BE/src/Contract/Services/V1/Products/Command.cs`
- `BE/src/Contract/Services/V1/Products/Query.cs`
- `BE/src/Contract/Services/V1/Products/Response.cs`
- `BE/src/Application/TemplateLandingPage.Application.csproj`
- `BE/src/Application/Abstractions/ICommandHandler.cs`
- `BE/src/Application/Abstractions/IQueryHandler.cs`
- `BE/src/Application/Behaviors/ValidationPipelineBehavior.cs` *(Đã sửa lỗi ép kiểu CS0029 & dùng TResponse trực tiếp)*
- `BE/src/Application/Behaviors/LoggingPipelineBehavior.cs`
- `BE/src/Application/Exceptions/ValidationException.cs`
- `BE/src/Application/DependencyInjection/Extensions/ServiceCollectionExtensions.cs`
- `BE/src/Application/UseCases/V1/Products/Commands/CreateProductCommandHandler.cs`
- `BE/src/Application/UseCases/V1/Products/Commands/CreateProductCommandValidator.cs`
- `BE/src/Application/UseCases/V1/Products/Commands/UpdateProductCommandHandler.cs`
- `BE/src/Application/UseCases/V1/Products/Commands/UpdateProductCommandValidator.cs`
- `BE/src/Application/UseCases/V1/Products/Commands/DeleteProductCommandHandler.cs`
- `BE/src/Application/UseCases/V1/Products/Queries/GetProductsQueryHandler.cs`
- `BE/src/Application/UseCases/V1/Products/Queries/GetProductByIdQueryHandler.cs`
- `BE/src/Persistence/TemplateLandingPage.Persistence.csproj`
- `BE/src/Persistence/Constants/TableNames.cs`
- `BE/src/Persistence/ApplicationDbContext.cs`
- `BE/src/Persistence/Configurations/ProductConfiguration.cs`
- `BE/src/Persistence/Interceptors/AuditableEntityInterceptor.cs`
- `BE/src/Persistence/Repositories/RepositoryBase.cs`
- `BE/src/Persistence/Repositories/ProductRepository.cs`
- `BE/src/Persistence/UnitOfWork.cs`
- `BE/src/Persistence/DependencyInjection/Extensions/ServiceCollectionExtensions.cs`
- `BE/src/Infrastructure/TemplateLandingPage.Infrastructure.csproj`
- `BE/src/Infrastructure/Abstractions/IDateTimeProvider.cs`
- `BE/src/Infrastructure/Services/DateTimeProvider.cs`
- `BE/src/Infrastructure/DependencyInjection/Extensions/ServiceCollectionExtensions.cs`
- `BE/src/Presentation/TemplateLandingPage.Presentation.csproj`
- `BE/src/Presentation/Abstractions/IEndpoint.cs`
- `BE/src/Presentation/APIs/Products/ProductApi.cs`
- `BE/src/Presentation/DependencyInjection/Extensions/ServiceCollectionExtensions.cs`
- `BE/src/API/TemplateLandingPage.API.csproj`
- `BE/src/API/Program.cs`
- `BE/src/API/Middlewares/ExceptionHandlingMiddleware.cs`
- `BE/src/API/appsettings.json`
- `BE/src/API/appsettings.Development.json`
- `BE/test/Architecture.Tests/TemplateLandingPage.Architecture.Tests.csproj`
- `BE/test/Architecture.Tests/ArchitectureTests.cs`
- `BE/test/UnitTests/TemplateLandingPage.UnitTests.csproj`
- `BE/test/UnitTests/Application/Products/CreateProductCommandHandlerTests.cs`
- `BE/test/UnitTests/Application/Products/GetProductsQueryHandlerTests.cs`
- `BE/test/UnitTests/Domain/ProductTests.cs` *(Đã cập nhật Theory test giá <= 0)*

### Frontend (React 19 + Vite + Tailwind CSS)
- `FE/package.json`
- `FE/vite.config.js`
- `FE/tailwind.config.js`
- `FE/postcss.config.js`
- `FE/index.html`
- `FE/.env.example`
- `FE/.gitignore`
- `FE/src/index.css`
- `FE/src/main.jsx`
- `FE/src/App.jsx`
- `FE/src/api/axios.js`
- `FE/src/api/productApi.js`
- `FE/src/utils/formatters.js`
- `FE/src/components/Navbar.jsx`
- `FE/src/components/Footer.jsx`
- `FE/src/components/Modal.jsx`
- `FE/src/components/LoadingSpinner.jsx`
- `FE/src/hooks/useProducts.js`
- `FE/src/pages/HomePage.jsx`
- `FE/src/pages/ProductsPage.jsx`
- `FE/src/pages/NotFoundPage.jsx`
- `FE/src/routes/index.jsx`

---

## 2. Mục đích triển khai của từng thành phần

### A. Backend (.NET 10 CQRS Clean Architecture)
1. **Domain Layer**: Chứa thực thể cốt lõi `Product` (kế thừa `AggregateRoot`, cài đặt `IAuditableEntity`, `ISoftDelete`), repository interfaces (`IProductRepository`, `IRepositoryBase`, `IUnitOfWork`), exception cơ bản và domain events. Độc lập hoàn toàn, không reference bất kỳ project nào.
2. **Contract Layer**: Định nghĩa Result Pattern (`Result`, `Result<T>`, `ValidationResult`, `Error`), MediatR contracts (`ICommand`, `IQuery`), và DTOs / Messages cho Product (`CreateProductCommand`, `UpdateProductCommand`, `DeleteProductCommand`, `GetProductsQuery`, `GetProductByIdQuery`, `ProductResponse`).
3. **Application Layer**: Cài đặt các use case handlers, tích hợp `ValidationPipelineBehavior` (FluentValidation) chặn lỗi trước khi vào handler trả về `ValidationResult` (HTTP 400), `LoggingPipelineBehavior` ghi nhật ký, và cấu hình DI tự động.
4. **Persistence Layer**: Cài đặt `ApplicationDbContext` (hỗ trợ `IUnitOfWork`), `ProductConfiguration` (Fluent API, Global Query Filter soft delete `!IsDeleted`), `AuditableEntityInterceptor` tự động gán `CreatedAtUtc`/`ModifiedAtUtc`, và `ProductRepository` kế thừa `RepositoryBase`.
5. **Infrastructure Layer**: Cung cấp `DateTimeProvider` phục vụ trừu tượng hóa thời gian hệ thống và các dịch vụ nền tảng bên ngoài.
6. **Presentation Layer**: Cài đặt Minimal API endpoints thông qua interface `IEndpoint`. Lớp này nhận HTTP request, gửi qua MediatR `ISender` và ánh xạ `Result` thành HTTP response chuẩn (200, 201, 400, 404). Hoàn toàn không truy cập DbContext hay chứa logic nghiệp vụ.
7. **API Layer**: Composition Root cấu hình Swagger/OpenAPI, CORS policy cho Frontend (`http://localhost:5173`), `ExceptionHandlingMiddleware` bắt lỗi unhandled exception (HTTP 500 RFC 7807), và nạp toàn bộ cấu hình từ các layer.
8. **Tests**:
   - `Architecture.Tests`: Kiểm thử quy tắc phân tầng với `NetArchTest` (Domain không phụ thuộc bên ngoài, Presentation không phụ thuộc DbContext, Application Handler tuân thủ quy chuẩn đặt tên).
   - `UnitTests`: Kiểm thử chức năng với `xUnit`, `Moq`, `FluentAssertions` cho Domain entity `Product` và các Command/Query Handler (`CreateProductCommandHandler`, `GetProductsQueryHandler`).

### B. Frontend (React 19 + Vite + Tailwind CSS)
1. **Root Config**: Thiết lập cấu hình Vite, Tailwind CSS, PostCSS, biến môi trường mẫu và quy tắc `.gitignore`.
2. **API Layer (`FE/src/api/`)**: `axios.js` đóng vai trò HTTP client trung tâm với interceptors bắt lỗi mạng, format lỗi từ backend trả về dạng thân thiện. `productApi.js` cung cấp hàm gọi CRUD sản phẩm.
3. **Components & Layout**: Navbar điều hướng, Footer, Modal tái sử dụng với animation/backdrop blur và LoadingSpinner.
4. **Hooks**: `useProducts.js` quản lý state tập trung cho toàn bộ vòng đời sản phẩm (load, create, update, delete, loading state, error state).
5. **Pages**:
   - `HomePage.jsx`: Landing Page hiện đại giới thiệu kiến trúc dự án và tính năng chính kèm nút CTA.
   - `ProductsPage.jsx`: Quản lý danh sách sản phẩm với lưới thẻ, giá tiền, ngày tạo, trạng thái bán, modal thêm mới, modal chỉnh sửa, modal xác nhận xóa mềm, thông báo lỗi và trạng thái danh sách trống (Empty State).
   - `NotFoundPage.jsx`: Trang điều hướng lỗi 404.
6. **Routes**: Thiết lập React Router với URL thân thiện (`/`, `/products`, `*`).

---

## 3. Các thay đổi đã cập nhật theo yêu cầu của Reviewer

1. **`BE/src/Application/Behaviors/ValidationPipelineBehavior.cs`**:
   - Khắc phục triệt để lỗi biên dịch CS0029 khi cast `ValidationResult` sang generic `TResponse`.
   - Loại bỏ generic type parameter `<TResult>`, dùng trực tiếp `TResponse` với cast qua `(object)`:
     ```csharp
     if (typeof(TResponse) == typeof(Result))
     {
         return (TResponse)(object)ValidationResult.WithErrors(errors);
     }
     ```
2. **`BE/src/Domain/Entities/Product.cs`**:
   - Cập nhật điều kiện kiểm tra giá ở `Create` và `Update` từ `price < 0` thành `price <= 0` kèm thông điệp rõ ràng: `"Product price must be greater than zero."`.
3. **`BE/test/UnitTests/Domain/ProductTests.cs`**:
   - Chuyển đổi test đơn vị kiểm tra giá sang `[Theory]` với `[InlineData(0)]` và `[InlineData(-10)]` để kiểm tra toàn diện cả trường hợp giá bằng 0 và giá âm.

---

## 4. Vị trí trọng yếu mà Tester nên soi kỹ

1. **Cơ chế Soft Delete**:
   - Khi thực hiện xóa một sản phẩm qua API hoặc trên giao diện: Bản ghi trong cơ sở dữ liệu không bị xóa vật lý (không gọi `Remove()`) mà được cập nhật trường `IsDeleted = true` và `DeletedAtUtc = DateTime.UtcNow`.
   - Kiểm tra xem sau khi xóa, danh sách GET `/api/v1/products` có lọc bỏ hoàn toàn các sản phẩm này hay không (nhờ Global Query Filter trong `ProductConfiguration`).
2. **Kiểm tra Validation & Result Pattern (HTTP 400 vs 500)**:
   - Thử gửi dữ liệu không hợp lệ (ví dụ: Tên sản phẩm để trống, hoặc giá `Price <= 0`).
   - Kết quả kỳ vọng: `ValidationPipelineBehavior` chặn lại và trả về HTTP 400 Bad Request kèm mảng chi tiết `Errors`, tuyệt đối không quăng ra lỗi 500 Server Error.
3. **Xử lý Dữ liệu Không tồn tại (HTTP 404)**:
   - Thử gọi `GET /api/v1/products/{id}`, `PUT /api/v1/products/{id}`, hoặc `DELETE /api/v1/products/{id}` với một Guid ngẫu nhiên hoặc Guid của sản phẩm đã bị xóa mềm.
   - Kết quả kỳ vọng: Trả về HTTP 404 Not Found kèm `ProductErrors.NotFound`.
4. **Tự động Auditing Thời gian**:
   - Khi tạo mới sản phẩm: `CreatedAtUtc` được tự động ghi nhận thời gian UTC từ `AuditableEntityInterceptor`.
   - Khi cập nhật sản phẩm: `ModifiedAtUtc` được cập nhật tương ứng.
5. **Trải nghiệm Frontend & Chống Double-Click**:
   - Khi bấm nút Lưu / Xóa trên modal, nút chuyển sang trạng thái Loading (disabled + spinner) nhằm chống double-submit gửi 2 request liên tiếp.
   - Khi ngắt kết nối mạng tới Backend: Giao diện hiển thị banner cảnh báo lỗi thân thiện thay vì làm sập trang.
   - Khi danh sách trống: Kiểm tra hiển thị Empty State với lời mời tạo sản phẩm đầu tiên.
