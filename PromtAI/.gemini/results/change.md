# Báo Cáo Thay Đổi Mã Nguồn (Change Log) - Chuyển Đổi Database sang PostgreSQL / Supabase

---

## 1. Danh Sách File Đã Thay Đổi / Tạo Mới / Xoá

### A. File Đã Thay Đổi (Modified)
1. [`BE/src/Persistence/TemplateLandingPage.Persistence.csproj`](file:///c:/Source/TemplateLandingPage/BE/src/Persistence/TemplateLandingPage.Persistence.csproj)
2. [`BE/src/Persistence/DependencyInjection/Extensions/ServiceCollectionExtensions.cs`](file:///c:/Source/TemplateLandingPage/BE/src/Persistence/DependencyInjection/Extensions/ServiceCollectionExtensions.cs)
3. [`BE/src/Persistence/ApplicationDbContext.cs`](file:///c:/Source/TemplateLandingPage/BE/src/Persistence/ApplicationDbContext.cs)
4. [`BE/src/Persistence/Data/DataSeeder.cs`](file:///c:/Source/TemplateLandingPage/BE/src/Persistence/Data/DataSeeder.cs)
5. [`BE/src/API/Program.cs`](file:///c:/Source/TemplateLandingPage/BE/src/API/Program.cs)
6. [`BE/src/API/appsettings.json`](file:///c:/Source/TemplateLandingPage/BE/src/API/appsettings.json)
7. [`BE/src/API/appsettings.Development.json`](file:///c:/Source/TemplateLandingPage/BE/src/API/appsettings.Development.json)
8. [`BE/test/UnitTests/Persistence/ServiceCollectionExtensionsTests.cs`](file:///c:/Source/TemplateLandingPage/BE/test/UnitTests/Persistence/ServiceCollectionExtensionsTests.cs)
9. [`BE/src/Persistence/Migrations/ApplicationDbContextModelSnapshot.cs`](file:///c:/Source/TemplateLandingPage/BE/src/Persistence/Migrations/ApplicationDbContextModelSnapshot.cs)

### B. File Đã Tạo Mới (Added)
1. [`BE/src/Persistence/Migrations/20260921031658_Init.cs`](file:///c:/Source/TemplateLandingPage/BE/src/Persistence/Migrations/20260921031658_Init.cs)
2. [`BE/src/Persistence/Migrations/20260921031658_Init.Designer.cs`](file:///c:/Source/TemplateLandingPage/BE/src/Persistence/Migrations/20260921031658_Init.Designer.cs)

### C. File Đã Xoá (Deleted)
1. `BE/src/Persistence/Migrations/20260920122409_Init.cs` (Migration cũ chứa cú pháp SQL Server)
2. `BE/src/Persistence/Migrations/20260920122409_Init.Designer.cs` (Designer snapshot cũ của SQL Server)

---

## 2. Chi Tiết Mục Đích Và Nội Dung Từng Thay Đổi

### 2.1. `BE/src/Persistence/TemplateLandingPage.Persistence.csproj`
- **Mục đích**: Chuyển đổi provider EF Core từ Microsoft SQL Server sang PostgreSQL, đồng thời đồng bộ phiên bản `Microsoft.EntityFrameworkCore.Relational` để tránh xung đột phụ thuộc (loại bỏ hoàn toàn warning MSB3277).
- **Nội dung sửa đổi**:
  - Gỡ bỏ `<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="9.0.2" />`.
  - Thêm `<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="9.0.4" />`.
  - Thêm `<PackageReference Include="Microsoft.EntityFrameworkCore.Relational" Version="9.0.2" />` nhằm thống nhất dependency graph với các project test.

### 2.2. `BE/src/Persistence/DependencyInjection/Extensions/ServiceCollectionExtensions.cs`
- **Mục đích**: Đăng ký DbContext với Npgsql provider, cấu hình resilience pipeline và chỉ định migration assembly rõ ràng.
- **Nội dung sửa đổi**:
  - Thay `options.UseSqlServer(...)` bằng `options.UseNpgsql(...)`.
  - Cấu hình `npgsqlOptions.EnableRetryOnFailure(maxRetryCount: 5, maxRetryDelay: TimeSpan.FromSeconds(30), errorCodesToAdd: null)`.
  - Cấu hình `npgsqlOptions.CommandTimeout(60)`.
  - Cấu hình `npgsqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)`.

### 2.3. `BE/src/Persistence/ApplicationDbContext.cs`
- **Mục đích**: Giải quyết triệt để lỗi ép kiểu `DateTimeKind.Unspecified` sang PostgreSQL `timestamp with time zone` (`timestamptz`).
- **Nội dung sửa đổi**:
  - Bổ sung override method `ConfigureConventions(ModelConfigurationBuilder configurationBuilder)`.
  - Gắn `UtcDateTimeConverter` cho kiểu `DateTime`.
  - Gắn `UtcNullableDateTimeConverter` cho kiểu `DateTime?`.
  - Tạo 2 class `UtcDateTimeConverter` và `UtcNullableDateTimeConverter` kế thừa `ValueConverter` để tự động gán `DateTimeKind.Utc` khi lưu hoặc đọc dữ liệu.

### 2.4. `BE/src/Persistence/Data/DataSeeder.cs`
- **Mục đích**: Hỗ trợ chạy migration tự động đối với Relational Database (PostgreSQL/Supabase) mà không làm crash môi trường Unit Test sử dụng `InMemoryDatabase`.
- **Nội dung sửa đổi**:
  - Thay thế `await context.Database.EnsureCreatedAsync();` thành:
    ```csharp
    if (context.Database.IsRelational())
    {
        await context.Database.MigrateAsync();
    }
    else
    {
        await context.Database.EnsureCreatedAsync();
    }
    ```

### 2.5. `BE/src/API/Program.cs`
- **Mục đích**: Xử lý lỗi khởi tạo và seed dữ liệu cụ thể cho Npgsql, cung cấp thông điệp chẩn đoán chi tiết với mã lỗi `SqlState` và hướng dẫn cấu hình kết nối Supabase.
- **Nội dung sửa đổi**:
  - Đổi `using Microsoft.Data.SqlClient;` sang `using Npgsql;`.
  - Bắt ngoại lệ `catch (NpgsqlException npgsqlEx)` thay vì `SqlException`.
  - Ghi log chi tiết `npgsqlEx.SqlState`, `npgsqlEx.Message` và các bước khắc phục liên quan tới SSL Mode, Port 5432 / 6543, thông tin credentials.

### 2.6. `BE/src/API/appsettings.json` & `BE/src/API/appsettings.Development.json`
- **Mục đích**: Chuẩn hoá chuỗi kết nối DefaultConnection theo cú pháp Npgsql / Supabase.
- **Nội dung sửa đổi**:
  - `appsettings.json`: Cấu hình template chuẩn Supabase `Host=db.[PROJECT-REF].supabase.co;Port=5432;Database=postgres;Username=postgres;Password=[YOUR-PASSWORD];SSL Mode=Require;Trust Server Certificate=true;`.
  - `appsettings.Development.json`: Cấu hình PostgreSQL local `Host=localhost;Port=5432;Database=TemplateLandingPageDb;Username=postgres;Password=postgres;`.

### 2.7. Tái Khởi Tạo Migration PostgreSQL (`BE/src/Persistence/Migrations/`)
- **Mục đích**: Loại bỏ các kiểu dữ liệu và chỉ thị đặc thù của T-SQL/SQL Server (`nvarchar`, `datetime2`, `SqlServerValueGenerationStrategy.IdentityColumn`), thay thế bằng kiểu dữ liệu chuẩn của PostgreSQL (`uuid`, `character varying`, `timestamp with time zone`, `NpgsqlValueGenerationStrategy.IdentityByDefaultColumn`).
- **Nội dung thực hiện**:
  - Xoá file migration cũ và snapshot cũ của SQL Server.
  - Chạy `dotnet ef migrations add Init --project BE/src/Persistence --startup-project BE/src/API --output-dir Migrations`.
  - Tạo mới `20260921031658_Init.cs`, `20260921031658_Init.Designer.cs` và cập nhật `ApplicationDbContextModelSnapshot.cs`.

### 2.8. `BE/test/UnitTests/Persistence/ServiceCollectionExtensionsTests.cs`
- **Mục đích**: Cập nhật bộ unit test kiểm thử đăng ký DI Persistence khớp với Npgsql PostgreSQL.
- **Nội dung sửa đổi**:
  - Đổi hằng số kết nối `DefaultLocalDbConnectionString` sang `DefaultPostgreSqlConnectionString` với định dạng PostgreSQL.
  - Sửa test `AddPersistence_Should_ConfigureNpgsqlProviderForDbContext`: kiểm tra `dbContext.Database.ProviderName` là `"Npgsql.EntityFrameworkCore.PostgreSQL"`.
  - Cập nhật các inline data trong Theory kiểm tra các tuỳ chọn chuỗi kết nối chuẩn Npgsql.

---

## 3. Vị Trí Trọng Yếu Mà Tester Nên Soi Kỹ

1. **Chuỗi kết nối SSL với Supabase (`SSL Mode=Require;Trust Server Certificate=true;`)**:
   - Khi kết nối trực tiếp đến Supabase trên môi trường Production/Staging, Supabase bắt buộc mã hoá SSL. Tester cần kiểm tra ứng dụng có mở kết nối thành công mà không bị từ chối SSL handshake.
2. **Kiểu dữ liệu `DateTime` và múi giờ (`timestamptz`)**:
   - Kiểm tra các trường audit `CreatedAtUtc`, `ModifiedAtUtc`, `DeletedAtUtc` và trường `EventDate` của Template/UserCustomization: Đảm bảo dữ liệu ghi vào database và đọc ra không bị lỗi `InvalidCastException` hoặc ném `Cannot write DateTime with Kind=Unspecified`.
3. **Cơ chế tự động migrate khi chạy ứng dụng (`context.Database.MigrateAsync()`)**:
   - Khởi chạy API với DB PostgreSQL mới trống: Kiểm tra API có tự động thực thi migration tạo 8 bảng (`Categories`, `GuestbookEntries`, `NavigationMenus`, `Products`, `RsvpEntries`, `Templates`, `UserCustomizations`, `Users`) và bảng lịch sử `__EFMigrationsHistory` hay không.
4. **Idempotency của `DataSeeder` trên PostgreSQL**:
   - Chạy lại API nhiều lần trên cùng DB: Đảm bảo seeder không sinh ra bản ghi trùng lặp (duplication) hoặc vi phạm Unique Constraint.
5. **Bộ Unit Tests và Architecture Tests**:
   - Đảm bảo toàn bộ 332 tests (325 Unit Tests + 7 Architecture Tests) vượt qua 100% với `0 Warning(s), 0 Error(s)`.
