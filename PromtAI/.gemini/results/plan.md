# BẢN KẾ HOẠCH TRIỂN KHAI (PLAN)

## CÂU HỎI CÒN BỎ NGỎ
Không có.

---

## 1. DANH SÁCH FILE CẦN THAY ĐỔI VÀ TẠO MỚI

### A. Backend (BE)
1. `BE/src/API/appsettings.json` (Sửa):
   - Cập nhật giá trị `ConnectionStrings:DefaultConnection` sang MSSQLLocalDB:
     `Server=(localdb)\\mssqllocaldb;Database=TemplateLandingPageDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true;`

2. `BE/src/API/appsettings.Development.json` (Sửa):
   - Bổ sung cấu hình `ConnectionStrings:DefaultConnection` với cùng chuỗi kết nối MSSQLLocalDB để môi trường Development ưu tiên kết nối trực tiếp đến LocalDB:
     `Server=(localdb)\\mssqllocaldb;Database=TemplateLandingPageDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true;`

3. `BE/src/Persistence/DependencyInjection/Extensions/ServiceCollectionExtensions.cs` (Sửa):
   - Tinh chỉnh `options.UseSqlServer(...)` trong cấu hình `AddDbContext<ApplicationDbContext>`:
     - Thêm lambda `sqlOptions` cấu hình Connection Resilience thông qua `EnableRetryOnFailure(maxRetryCount: 5, maxRetryDelay: TimeSpan.FromSeconds(30), errorNumbersToAdd: null)`.
     - Cấu hình `CommandTimeout(60)`.
     - Đảm bảo interceptor `AuditableEntityInterceptor` vẫn được đăng ký đúng chuẩn.

4. `BE/src/API/Program.cs` (Sửa):
   - Bổ sung `using Microsoft.Data.SqlClient;`.
   - Trong khối `using (var scope = app.Services.CreateScope())` thực thi `DataSeeder.SeedAsync`, phân tách khối `catch`:
     - Bắt riêng `SqlException sqlEx`: Ghi `logger.LogError` chi tiết mã lỗi `sqlEx.Number`, thông điệp lỗi và in thông điệp hướng dẫn dev kiểm tra instance LocalDB (`sqllocaldb info mssqllocaldb` / `sqllocaldb start mssqllocaldb`) hoặc Windows service (`MSSQLSERVER` / `MSSQL$SQLEXPRESS`).
     - Bắt chung `Exception ex`: Ghi `logger.LogError` cho các lỗi khác khi seed dữ liệu.

5. `BE/test/UnitTests/Persistence/ServiceCollectionExtensionsTests.cs` (Tạo mới):
   - Thêm unit test kiểm thử phương thức mở rộng `AddPersistence`:
     - Kiểm tra `ApplicationDbContext` được đăng ký trong `IServiceCollection` và có thể khởi tạo scope hợp lệ.
     - Kiểm tra các repository interfaces (`IUserRepository`, `ITemplateRepository`, `IUnitOfWork`,...) được đăng ký dạng `Scoped`.

### B. Frontend (FE)
- Không cần thay đổi mã nguồn FE (FE giao tiếp qua API proxy/baseURL `http://localhost:54611` sẵn có).
- Cần chạy kiểm thử build FE: `npm run build` trong thư mục `FE` để đảm bảo không có lỗi biên dịch.

---

## 2. CHỮ KÝ HÀM, INTERFACE & CẤU HÌNH CHI TIẾT

### 2.1. Cấu hình Connection String
Đường dẫn: `BE/src/API/appsettings.json` & `BE/src/API/appsettings.Development.json`
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=TemplateLandingPageDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true;"
}
```

### 2.2. ServiceCollectionExtensions
Đường dẫn: `BE/src/Persistence/DependencyInjection/Extensions/ServiceCollectionExtensions.cs`
```csharp
public static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration)
{
    services.AddSingleton<AuditableEntityInterceptor>();

    services.AddDbContext<ApplicationDbContext>((sp, options) =>
    {
        var interceptor = sp.GetRequiredService<AuditableEntityInterceptor>();
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        options.UseSqlServer(connectionString, sqlOptions =>
        {
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null);
            sqlOptions.CommandTimeout(60);
        })
        .AddInterceptors(interceptor);
    });

    services.AddScoped<IUnitOfWork, UnitOfWork>();
    services.AddScoped<IProductRepository, ProductRepository>();
    services.AddScoped<IUserRepository, UserRepository>();
    services.AddScoped<ICategoryRepository, CategoryRepository>();
    services.AddScoped<INavigationMenuRepository, NavigationMenuRepository>();
    services.AddScoped<ITemplateRepository, TemplateRepository>();
    services.AddScoped<ICustomizationRepository, CustomizationRepository>();
    services.AddScoped<IRsvpRepository, RsvpRepository>();
    services.AddScoped<IGuestbookRepository, GuestbookRepository>();

    return services;
}
```

### 2.3. Seeder & Diagnostic Error Logging trong Program.cs
Đường dẫn: `BE/src/API/Program.cs`
```csharp
using Microsoft.Data.SqlClient;

// Seed initial data in Development
using (var scope = app.Services.CreateScope())
{
    try
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        await DataSeeder.SeedAsync(dbContext, passwordHasher);
    }
    catch (SqlException sqlEx)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(sqlEx,
            "Lỗi kết nối cơ sở dữ liệu SQL Server (Error {Number}): {Message}. " +
            "Hướng dẫn khắc phục: " +
            "1. Nếu dùng LocalDB, kiểm tra/khởi động instance: 'sqllocaldb info mssqllocaldb' hoặc 'sqllocaldb start mssqllocaldb'. " +
            "2. Nếu dùng SQL Server service, kiểm tra service MSSQLSERVER hoặc MSSQL$SQLEXPRESS trong Services. " +
            "3. Kiểm tra chuỗi kết nối 'DefaultConnection' trong appsettings.json / appsettings.Development.json.",
            sqlEx.Number,
            sqlEx.Message);
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Không thể khởi tạo hoặc seed dữ liệu: {Message}", ex.Message);
    }
}
```

### 2.4. Unit Test cho AddPersistence
Đường dẫn: `BE/test/UnitTests/Persistence/ServiceCollectionExtensionsTests.cs`
```csharp
namespace TemplateLandingPage.UnitTests.Persistence;

using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TemplateLandingPage.Domain.Abstractions.Repositories;
using TemplateLandingPage.Domain.Repositories;
using TemplateLandingPage.Persistence;
using TemplateLandingPage.Persistence.DependencyInjection.Extensions;
using Xunit;

public class ServiceCollectionExtensionsTests
{
    [Fact]
    public void AddPersistence_Should_RegisterAllRequiredPersistenceServices()
    {
        // Arrange
        var services = new ServiceCollection();
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = "Server=(localdb)\\mssqllocaldb;Database=TemplateLandingPageDb;Trusted_Connection=True;"
            })
            .Build();

        // Act
        services.AddPersistence(configuration);
        var serviceProvider = services.BuildServiceProvider();

        // Assert
        serviceProvider.GetService<ApplicationDbContext>().Should().NotBeNull();
        serviceProvider.GetService<IUnitOfWork>().Should().NotBeNull();
        serviceProvider.GetService<IUserRepository>().Should().NotBeNull();
        serviceProvider.GetService<ITemplateRepository>().Should().NotBeNull();
        serviceProvider.GetService<ICategoryRepository>().Should().NotBeNull();
    }
}
```

---

## 3. CÁC TRƯỜNG HỢP BIÊN BẮT BUỘC PHẢI XỬ LÝ (EDGE CASES)

1. **LocalDB mới khởi động hoặc đang ở trạng thái ngủ (Cold Start / Wake-up delay)**:
   - *Rủi ro*: Khi gọi request đầu tiên sau khi máy khởi động hoặc instance LocalDB chưa bật, kết nối có thể timeout hoặc trả lỗi tạm thời (transient connection fault).
   - *Xử lý*: `EnableRetryOnFailure(maxRetryCount: 5, maxRetryDelay: TimeSpan.FromSeconds(30))` cho phép EF Core tự động retry với exponential backoff, kết hợp `CommandTimeout(60)`.

2. **Chuỗi kết nối bị null hoặc sai định dạng**:
   - *Rủi ro*: Khi cấu hình thiếu `DefaultConnection`, `options.UseSqlServer(connectionString)` nhận chuỗi rỗng/null.
   - *Xử lý*: Đảm bảo cả hai file cấu hình `appsettings.json` và `appsettings.Development.json` đều có `DefaultConnection` hợp lệ.

3. **Tiến trình API cũ đang chạy khóa file PDB/DLL khi build**:
   - *Rủi ro*: Nếu tiến trình `TemplateLandingPage.API.exe` đang chạy trên cổng 54611, lệnh `dotnet build` hoặc `dotnet test` toàn solution có thể bị lỗi khóa file `MSB3021 / MSB3027`.
   - *Xử lý*: Coder/Tester cần chạy kiểm thử từng project (`dotnet test test/UnitTests/TemplateLandingPage.UnitTests.csproj` và `dotnet test test/Architecture.Tests/TemplateLandingPage.Architecture.Tests.csproj --no-build`), hoặc tắt process API cũ trước khi build lại API.

4. **Tính Idempotent của DataSeeder**:
   - *Rủi ro*: Nếu kết nối bị ngắt quãng giữa chừng trong lúc seed và retry lại, dữ liệu có thể bị trùng lặp nếu không kiểm tra chặt chẽ.
   - *Xử lý*: Giữ nguyên cơ chế `await context.Database.EnsureCreatedAsync()` và `!await context.{Table}.AnyAsync()` trong `DataSeeder.cs`, đảm bảo việc chạy nhiều lần không gây duplicate dữ liệu (đã được bao phủ bởi test `SeedAsync_Should_BeIdempotent_WhenExecutedMultipleTimes`).

5. **Phân biệt rành mạch giữa lỗi kết nối SQL (SqlException) và các lỗi khởi tạo khác**:
   - *Rủi ro*: Người dùng chỉ thấy lỗi chung chung 500 hoặc log `Could not run DataSeeder` mà không biết vì sao DB không kết nối được.
   - *Xử lý*: Bắt riêng `SqlException`, trích xuất `sqlEx.Number` (ví dụ error 40, error 2 - cannot find file/server), ghi log mức `LogError` kèm giải pháp khắc phục cụ thể cho môi trường Windows.

---

## 4. QUY ƯỚC CẦN BÁM THEO

Sao chép và tuân thủ chặt chẽ các quy ước từ file:
**`PromtAI/.gemini/agents/coder.md`**
- **Phần A: Quy chuẩn Backend (.NET Clean Architecture + CQRS + MediatR)**
  - Mục A1: Giữ vững ranh giới giữa các layer (Domain, Contract, Application, Persistence, Presentation, API).
  - Mục A8: Cấu hình Dependency Injection tập trung trong các `DependencyInjection/Extensions`.
- **Phần C: Nguyên tắc chung & Checklist review**
  - Mục C1: Không commit credentials/secret nhạy cảm; build sạch trước khi bàn giao (`dotnet test` và `npm run build` không lỗi).
  - Mục C2: Hoàn thành đầy đủ checklist Backend và Frontend.
