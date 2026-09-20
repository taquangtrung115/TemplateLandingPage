# KẾ HOẠCH TRIỂN KHAI (PLAN)

## CÂU HỎI CÒN BỎ NGỎ
Không có.
*(Lưu ý về môi trường: Máy phát triển hiện có SDK .NET 10 nhưng chưa cài runtime `Microsoft.NETCore.App 10.0.0-rc.1`. Để dự án đúng chuẩn theo yêu cầu, cấu hình `<TargetFramework>net10.0</TargetFramework>` vẫn được thiết lập chuẩn xác trong các file `.csproj` và Solution. Coder viết trực tiếp cấu trúc file XML `.csproj` và file `.sln` độc lập mà không phụ thuộc vào lệnh `dotnet new`.)*

---

## 1. QUY ƯỚC CẦN BÁM THEO
Toàn bộ quy chuẩn kiến trúc, quy tắc đặt tên, phân tầng và tổ chức code phải sao chép và tuân thủ nghiêm ngặt từ:
- **`PromtAI/.gemini/agents/coder.md`** (Phần A1 -> A9 cho Backend, Phần B1 -> B4 cho Frontend, Phần C cho Checklist & Nguyên tắc chung).
  - Tên giải pháp & Assembly prefix: `TemplateLandingPage`
  - Phân tầng Backend: `Domain` (Core, không reference), `Contract` (Message, Result, DTO), `Application` (UseCases, Behaviors), `Persistence` (EF Core, SqlServer, DbContext), `Infrastructure` (External Services), `Presentation` (Minimal API, Route Endpoints), `API` (Composition Root, Program.cs, Middleware).
  - Presentation không gọi DbContext / Repository trực tiếp, chỉ dùng MediatR `ISender`.
  - Nghiệp vụ trả về `Result` / `Result<T>`, không ném exception cho lỗi nghiệp vụ (Guard clause / Validation).
  - Frontend: React 19 + Vite + Tailwind CSS, cấu trúc `api/`, `components/`, `pages/`, `hooks/`, `routes/`, `utils/`. Toàn bộ API call đi qua `api/axios.js`.

---

## 2. DANH SÁCH FILE CẦN TẠO MỚI (ĐƯỜNG DẪN CHÍNH XÁC)

### A. Backend (.NET 10 - Clean Architecture + CQRS + MediatR)
Thư mục gốc BE: `BE/`

#### 1. Solution & Solution Items
- `BE/TemplateLandingPage.sln`

#### 2. Project `TemplateLandingPage.Domain` (`BE/src/Domain/`)
- `BE/src/Domain/TemplateLandingPage.Domain.csproj`
- `BE/src/Domain/Abstractions/Entity.cs`
- `BE/src/Domain/Abstractions/IAuditableEntity.cs`
- `BE/src/Domain/Abstractions/ISoftDelete.cs`
- `BE/src/Domain/Abstractions/IDomainEvent.cs`
- `BE/src/Domain/Abstractions/AggregateRoot.cs`
- `BE/src/Domain/Abstractions/Repositories/IRepositoryBase.cs`
- `BE/src/Domain/Abstractions/Repositories/IUnitOfWork.cs`
- `BE/src/Domain/Entities/Product.cs`
- `BE/src/Domain/Repositories/IProductRepository.cs`
- `BE/src/Domain/Exceptions/DomainException.cs`

#### 3. Project `TemplateLandingPage.Contract` (`BE/src/Contract/`)
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

#### 4. Project `TemplateLandingPage.Application` (`BE/src/Application/`)
- `BE/src/Application/TemplateLandingPage.Application.csproj`
- `BE/src/Application/Abstractions/ICommandHandler.cs`
- `BE/src/Application/Abstractions/IQueryHandler.cs`
- `BE/src/Application/Behaviors/ValidationPipelineBehavior.cs`
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

#### 5. Project `TemplateLandingPage.Persistence` (`BE/src/Persistence/`)
- `BE/src/Persistence/TemplateLandingPage.Persistence.csproj`
- `BE/src/Persistence/Constants/TableNames.cs`
- `BE/src/Persistence/ApplicationDbContext.cs`
- `BE/src/Persistence/Configurations/ProductConfiguration.cs`
- `BE/src/Persistence/Interceptors/AuditableEntityInterceptor.cs`
- `BE/src/Persistence/Repositories/RepositoryBase.cs`
- `BE/src/Persistence/Repositories/ProductRepository.cs`
- `BE/src/Persistence/UnitOfWork.cs`
- `BE/src/Persistence/DependencyInjection/Extensions/ServiceCollectionExtensions.cs`

#### 6. Project `TemplateLandingPage.Infrastructure` (`BE/src/Infrastructure/`)
- `BE/src/Infrastructure/TemplateLandingPage.Infrastructure.csproj`
- `BE/src/Infrastructure/Abstractions/IDateTimeProvider.cs`
- `BE/src/Infrastructure/Services/DateTimeProvider.cs`
- `BE/src/Infrastructure/DependencyInjection/Extensions/ServiceCollectionExtensions.cs`

#### 7. Project `TemplateLandingPage.Presentation` (`BE/src/Presentation/`)
- `BE/src/Presentation/TemplateLandingPage.Presentation.csproj`
- `BE/src/Presentation/Abstractions/IEndpoint.cs`
- `BE/src/Presentation/APIs/Products/ProductApi.cs`
- `BE/src/Presentation/DependencyInjection/Extensions/ServiceCollectionExtensions.cs`

#### 8. Project `TemplateLandingPage.API` (`BE/src/API/`)
- `BE/src/API/TemplateLandingPage.API.csproj`
- `BE/src/API/Program.cs`
- `BE/src/API/Middlewares/ExceptionHandlingMiddleware.cs`
- `BE/src/API/appsettings.json`
- `BE/src/API/appsettings.Development.json`

#### 9. Project `TemplateLandingPage.Architecture.Tests` (`BE/test/Architecture.Tests/`)
- `BE/test/Architecture.Tests/TemplateLandingPage.Architecture.Tests.csproj`
- `BE/test/Architecture.Tests/ArchitectureTests.cs`

#### 10. Project `TemplateLandingPage.UnitTests` (`BE/test/UnitTests/`)
- `BE/test/UnitTests/TemplateLandingPage.UnitTests.csproj`
- `BE/test/UnitTests/Application/Products/CreateProductCommandHandlerTests.cs`
- `BE/test/UnitTests/Application/Products/GetProductsQueryHandlerTests.cs`
- `BE/test/UnitTests/Domain/ProductTests.cs`

---

### B. Frontend (React 19 + Vite + Tailwind CSS)
Thư mục gốc FE: `FE/`

#### 1. Configuration & Root Files
- `FE/package.json`
- `FE/vite.config.js`
- `FE/tailwind.config.js`
- `FE/postcss.config.js`
- `FE/index.html`
- `FE/.env.example`
- `FE/.gitignore`

#### 2. Source Files (`FE/src/`)
- `FE/src/index.css` (Tailwind directives `@tailwind base; @tailwind components; @tailwind utilities;`)
- `FE/src/main.jsx`
- `FE/src/App.jsx`
- `FE/src/api/axios.js`
- `FE/src/api/productApi.js`
- `FE/src/components/Navbar.jsx`
- `FE/src/components/Footer.jsx`
- `FE/src/components/Modal.jsx`
- `FE/src/components/LoadingSpinner.jsx`
- `FE/src/hooks/useProducts.js`
- `FE/src/pages/HomePage.jsx`
- `FE/src/pages/ProductsPage.jsx`
- `FE/src/pages/NotFoundPage.jsx`
- `FE/src/routes/index.jsx`
- `FE/src/utils/formatters.js`

---

## 3. CHỮ KÝ HÀM & INTERFACE CẦN CÓ

### 3.1. Contract Layer (`TemplateLandingPage.Contract`)
```csharp
namespace TemplateLandingPage.Contract.Abstractions.Shared;

public record Error(string Code, string Message)
{
    public static readonly Error None = new(string.Empty, string.Empty);
    public static readonly Error NullValue = new("Error.NullValue", "The specified result value is null.");
}

public class Result
{
    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public Error Error { get; }
    protected Result(bool isSuccess, Error error) { ... }
    public static Result Success() => new(true, Error.None);
    public static Result Failure(Error error) => new(false, error);
    public static Result<TValue> Success<TValue>(TValue value) => new(value, true, Error.None);
    public static Result<TValue> Failure<TValue>(Error error) => new(default, false, error);
}

public class Result<TValue> : Result
{
    public TValue Value { get; }
    protected internal Result(TValue? value, bool isSuccess, Error error) : base(isSuccess, error) { ... }
}

public interface IValidationResult
{
    public static readonly Error ValidationError = new("ValidationError", "A validation error occurred.");
    Error[] Errors { get; }
}

public sealed class ValidationResult : Result, IValidationResult
{
    public Error[] Errors { get; }
    private ValidationResult(Error[] errors) : base(false, IValidationResult.ValidationError) => Errors = errors;
    public static ValidationResult WithErrors(Error[] errors) => new(errors);
}

public sealed class ValidationResult<TValue> : Result<TValue>, IValidationResult
{
    public Error[] Errors { get; }
    private ValidationResult(Error[] errors) : base(default, false, IValidationResult.ValidationError) => Errors = errors;
    public static ValidationResult<TValue> WithErrors(Error[] errors) => new(errors);
}
```

```csharp
namespace TemplateLandingPage.Contract.Abstractions.Message;
using MediatR;
using TemplateLandingPage.Contract.Abstractions.Shared;

public interface ICommand : IRequest<Result> { }
public interface ICommand<TResponse> : IRequest<Result<TResponse>> { }
public interface IQuery<TResponse> : IRequest<Result<TResponse>> { }
```

```csharp
namespace TemplateLandingPage.Contract.Services.V1.Products;
using TemplateLandingPage.Contract.Abstractions.Message;

public static class ProductErrors
{
    public static readonly Error NotFound = new("Product.NotFound", "Product was not found.");
    public static readonly Error InvalidPrice = new("Product.InvalidPrice", "Product price must be greater than zero.");
}

public record CreateProductCommand(string Name, string? Description, decimal Price) : ICommand<Guid>;
public record UpdateProductCommand(Guid Id, string Name, string? Description, decimal Price, bool IsActive) : ICommand;
public record DeleteProductCommand(Guid Id) : ICommand;

public record GetProductsQuery() : IQuery<List<ProductResponse>>;
public record GetProductByIdQuery(Guid Id) : IQuery<ProductResponse>;

public record ProductResponse(Guid Id, string Name, string? Description, decimal Price, bool IsActive, DateTime CreatedAtUtc);
```

### 3.2. Domain Layer (`TemplateLandingPage.Domain`)
```csharp
namespace TemplateLandingPage.Domain.Abstractions;

public abstract class Entity<TKey>
{
    public TKey Id { get; protected set; } = default!;
}

public abstract class AggregateRoot<TKey> : Entity<TKey>
{
    private readonly List<IDomainEvent> _domainEvents = new();
    public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();
    public void AddDomainEvent(IDomainEvent domainEvent) => _domainEvents.Add(domainEvent);
    public void ClearDomainEvents() => _domainEvents.Clear();
}

public interface IAuditableEntity
{
    DateTime CreatedAtUtc { get; set; }
    DateTime? ModifiedAtUtc { get; set; }
}

public interface ISoftDelete
{
    bool IsDeleted { get; set; }
    DateTime? DeletedAtUtc { get; set; }
}
```

```csharp
namespace TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Abstractions;

public interface IRepositoryBase<TEntity, in TKey> where TEntity : Entity<TKey>
{
    Task<TEntity?> GetByIdAsync(TKey id, CancellationToken cancellationToken = default);
    Task<List<TEntity>> GetAllAsync(CancellationToken cancellationToken = default);
    void Add(TEntity entity);
    void Update(TEntity entity);
    void Remove(TEntity entity);
}

public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
```

```csharp
namespace TemplateLandingPage.Domain.Entities;
using TemplateLandingPage.Domain.Abstractions;

public sealed class Product : AggregateRoot<Guid>, IAuditableEntity, ISoftDelete
{
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public decimal Price { get; private set; }
    public bool IsActive { get; private set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? ModifiedAtUtc { get; set; }

    private Product() { } // EF Core
    public static Product Create(string name, string? description, decimal price);
    public void Update(string name, string? description, decimal price, bool isActive);
    public void Delete();
}
```

```csharp
namespace TemplateLandingPage.Domain.Repositories;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Entities;

public interface IProductRepository : IRepositoryBase<Product, Guid>
{
    Task<bool> ExistsByNameAsync(string name, CancellationToken cancellationToken = default);
}
```

### 3.3. Application Layer (`TemplateLandingPage.Application`)
```csharp
namespace TemplateLandingPage.Application.Abstractions;
using MediatR;
using TemplateLandingPage.Contract.Abstractions.Message;
using TemplateLandingPage.Contract.Abstractions.Shared;

public interface ICommandHandler<in TCommand> : IRequestHandler<TCommand, Result>
    where TCommand : ICommand { }

public interface ICommandHandler<in TCommand, TResponse> : IRequestHandler<TCommand, Result<TResponse>>
    where TCommand : ICommand<TResponse> { }

public interface IQueryHandler<in TQuery, TResponse> : IRequestHandler<TQuery, Result<TResponse>>
    where TQuery : IQuery<TResponse> { }
```

```csharp
// UseCases Handlers Signatures
public sealed class CreateProductCommandHandler : ICommandHandler<CreateProductCommand, Guid>
{
    public Task<Result<Guid>> Handle(CreateProductCommand request, CancellationToken cancellationToken);
}

public sealed class GetProductsQueryHandler : IQueryHandler<GetProductsQuery, List<ProductResponse>>
{
    public Task<Result<List<ProductResponse>>> Handle(GetProductsQuery request, CancellationToken cancellationToken);
}

public sealed class GetProductByIdQueryHandler : IQueryHandler<GetProductByIdQuery, ProductResponse>
{
    public Task<Result<ProductResponse>> Handle(GetProductByIdQuery request, CancellationToken cancellationToken);
}

public sealed class UpdateProductCommandHandler : ICommandHandler<UpdateProductCommand>
{
    public Task<Result> Handle(UpdateProductCommand request, CancellationToken cancellationToken);
}

public sealed class DeleteProductCommandHandler : ICommandHandler<DeleteProductCommand>
{
    public Task<Result> Handle(DeleteProductCommand request, CancellationToken cancellationToken);
}
```

### 3.4. Presentation Layer (`TemplateLandingPage.Presentation`)
```csharp
namespace TemplateLandingPage.Presentation.Abstractions;
using Microsoft.AspNetCore.Routing;

public interface IEndpoint
{
    void MapEndpoint(IEndpointRouteBuilder app);
}

// Minimal API mapping:
// POST   /api/v1/products
// GET    /api/v1/products
// GET    /api/v1/products/{id:guid}
// PUT    /api/v1/products/{id:guid}
// DELETE /api/v1/products/{id:guid}
```

### 3.5. Frontend API Interface (`FE/src/api/productApi.js`)
```javascript
// FE/src/api/productApi.js
const productApi = {
  getProducts: () => axiosInstance.get('/api/v1/products'),
  getProductById: (id) => axiosInstance.get(`/api/v1/products/${id}`),
  createProduct: (data) => axiosInstance.post('/api/v1/products', data),
  updateProduct: (id, data) => axiosInstance.put(`/api/v1/products/${id}`, data),
  deleteProduct: (id) => axiosInstance.delete(`/api/v1/products/${id}`)
};
export default productApi;
```

---

## 4. CÁC TRƯỜNG HỢP BIÊN BẮT BUỘC PHẢI XỬ LÝ (EDGE CASES)

1. **Lỗi dữ liệu đầu vào (Validation Errors)**:
   - Tên Product để trống, whitespace hoặc vượt quá 200 ký tự.
   - Giá Price <= 0.
   - `ValidationPipelineBehavior` phải chặn ngay trước khi vào Handler, trả về `ValidationResult` chứa danh sách `Error[]`, status HTTP 400 Bad Request, không quăng unhandled exception 500.

2. **Dữ liệu không tồn tại (Not Found)**:
   - Truy vấn hoặc cập nhật / xóa theo `id` không tồn tại hoặc đã bị xóa mềm (`IsDeleted = true`).
   - Handler trả về `Result.Failure(ProductErrors.NotFound)`.
   - Presentation map thành HTTP 404 Not Found.

3. **Xóa mềm (Soft Delete)**:
   - Khi gọi Delete, thực hiện cập nhật `IsDeleted = true` và `DeletedAtUtc = DateTime.UtcNow`, không gọi EF `Remove()` xóa vĩnh viễn khỏi database.
   - `ProductConfiguration` cấu hình Global Query Filter `builder.HasQueryFilter(p => !p.IsDeleted)`.

4. **Quản lý Transaction & Concurrency**:
   - `UnitOfWork.SaveChangesAsync` được gọi an toàn trong Handler, có truyền `CancellationToken`.
   - Không gọi `SaveChanges` trong các Query Handler (Query là read-only, sử dụng `AsNoTracking()`).

5. **CORS & Network failure ở Frontend**:
   - Backend API cấu hình policy CORS cho phép origin frontend Vite (`http://localhost:5173`).
   - Frontend `axios.js` có response interceptor bắt lỗi mất mạng hoặc server 500, trả về thông báo lỗi thân thiện thay vì crash trang.
   - Nút Submit form có loading state để ngăn chặn người dùng bấm gửi liên tục (double-submit).

6. **Trường hợp danh sách trống (Empty State)**:
   - Phía frontend hiển thị giao diện thông báo "Chưa có sản phẩm nào. Hãy tạo sản phẩm mới!" kèm nút bấm mở Modal tạo mới.

---

## 5. THIẾT KẾ PROJECT REFS & PACKAGES (NET10.0)

- `TemplateLandingPage.Domain.csproj`:
  - TargetFramework: `net10.0`
  - References: Không reference project nào.
- `TemplateLandingPage.Contract.csproj`:
  - TargetFramework: `net10.0`
  - Package: `MediatR.Contracts` (2.0.1)
  - References: Không reference project nào.
- `TemplateLandingPage.Application.csproj`:
  - TargetFramework: `net10.0`
  - Packages: `MediatR` (12.4.1), `FluentValidation` (11.11.0), `FluentValidation.DependencyInjectionExtensions` (11.11.0)
  - References: `Domain`, `Contract`
- `TemplateLandingPage.Persistence.csproj`:
  - TargetFramework: `net10.0`
  - Packages: `Microsoft.EntityFrameworkCore` (9.0.2), `Microsoft.EntityFrameworkCore.SqlServer` (9.0.2), `Microsoft.EntityFrameworkCore.Design` (9.0.2)
  - References: `Domain`, `Application`
- `TemplateLandingPage.Infrastructure.csproj`:
  - TargetFramework: `net10.0`
  - References: `Application`
- `TemplateLandingPage.Presentation.csproj`:
  - TargetFramework: `net10.0`
  - Packages: `Microsoft.AspNetCore.OpenApi` (9.0.2), `Asp.Versioning.Http` (8.1.0)
  - References: `Application`, `Contract`
- `TemplateLandingPage.API.csproj`:
  - TargetFramework: `net10.0` (Sdk: `Microsoft.NET.Sdk.Web`)
  - Packages: `Swashbuckle.AspNetCore` (7.2.0), `Microsoft.AspNetCore.OpenApi` (9.0.2)
  - References: `Presentation`, `Persistence`, `Infrastructure`, `Application`, `Contract`, `Domain`
- `TemplateLandingPage.Architecture.Tests.csproj`:
  - TargetFramework: `net10.0`
  - Packages: `NetArchTest.Rules` (1.3.2), `xunit` (2.9.3), `xunit.runner.visualstudio` (3.0.1), `FluentAssertions` (7.0.0), `Microsoft.NET.Test.Sdk` (17.12.0)
  - References: Toàn bộ các project BE trên.
- `TemplateLandingPage.UnitTests.csproj`:
  - TargetFramework: `net10.0`
  - Packages: `xunit` (2.9.3), `xunit.runner.visualstudio` (3.0.1), `FluentAssertions` (7.0.0), `Moq` (4.20.72), `Microsoft.NET.Test.Sdk` (17.12.0)
  - References: `Application`, `Domain`, `Contract`
