# Kế hoạch chuyển đổi cơ sở dữ liệu từ SQL Server sang PostgreSQL (Hỗ trợ Supabase)

---

## 1. CÂU HỎI CÒN BỎ NGỎ
**Không có.** Yêu cầu kỹ thuật và hiện trạng codebase đã rõ ràng: chuyển đổi toàn bộ tầng truy xuất dữ liệu từ `Microsoft.EntityFrameworkCore.SqlServer` sang `Npgsql.EntityFrameworkCore.PostgreSQL` để sẵn sàng kết nối và triển khai lên Supabase (hoặc PostgreSQL instance).

---

## 2. NHỮNG FILE CẦN TẠO MỚI HOẶC CẦN SỬA

### A. Các file cần sửa
1. [BE/src/Persistence/TemplateLandingPage.Persistence.csproj](file:///c:/Source/TemplateLandingPage/BE/src/Persistence/TemplateLandingPage.Persistence.csproj)
   - Gỡ bỏ package: `Microsoft.EntityFrameworkCore.SqlServer` (9.0.2).
   - Thêm package: `Npgsql.EntityFrameworkCore.PostgreSQL` (9.0.4).
2. [BE/src/Persistence/DependencyInjection/Extensions/ServiceCollectionExtensions.cs](file:///c:/Source/TemplateLandingPage/BE/src/Persistence/DependencyInjection/Extensions/ServiceCollectionExtensions.cs)
   - Đổi `options.UseSqlServer(...)` sang `options.UseNpgsql(...)` với đầy đủ cấu hình retry và connection timeout.
3. [BE/src/Persistence/ApplicationDbContext.cs](file:///c:/Source/TemplateLandingPage/BE/src/Persistence/ApplicationDbContext.cs)
   - Thêm cấu hình quy ước chuẩn hoá UTC cho `DateTime` và `DateTime?` thông qua `ConfigureConventions` và ValueConverter để tránh lỗi timestamptz của PostgreSQL/Npgsql.
4. [BE/src/Persistence/Data/DataSeeder.cs](file:///c:/Source/TemplateLandingPage/BE/src/Persistence/Data/DataSeeder.cs)
   - Điều chỉnh khởi tạo DB: Dùng `await context.Database.MigrateAsync()` nếu là Relational DB (Postgres/Supabase), fallback `EnsureCreatedAsync()` nếu là InMemory DB (Unit test).
5. [BE/src/API/Program.cs](file:///c:/Source/TemplateLandingPage/BE/src/API/Program.cs)
   - Thay `using Microsoft.Data.SqlClient;` bằng `using Npgsql;`.
   - Đổi `catch (SqlException sqlEx)` sang `catch (NpgsqlException npgsqlEx)` kèm thông điệp hướng dẫn kết nối Supabase/PostgreSQL.
6. [BE/src/API/appsettings.json](file:///c:/Source/TemplateLandingPage/BE/src/API/appsettings.json)
   - Cập nhật định dạng `DefaultConnection` mẫu cho Supabase (hỗ trợ SSL Mode=Require).
7. [BE/src/API/appsettings.Development.json](file:///c:/Source/TemplateLandingPage/BE/src/API/appsettings.Development.json)
   - Cập nhật định dạng `DefaultConnection` cho PostgreSQL môi trường Development.
8. [BE/test/UnitTests/Persistence/ServiceCollectionExtensionsTests.cs](file:///c:/Source/TemplateLandingPage/BE/test/UnitTests/Persistence/ServiceCollectionExtensionsTests.cs)
   - Cập nhật chuỗi kết nối mẫu sang format PostgreSQL.
   - Sửa assertion từ `Microsoft.EntityFrameworkCore.SqlServer` sang `Npgsql.EntityFrameworkCore.PostgreSQL`.

### B. Các file cần xoá (Migration cũ của SQL Server)
1. `c:\Source\TemplateLandingPage\BE\src\Persistence\Migrations\20260920122409_Init.cs`
2. `c:\Source\TemplateLandingPage\BE\src\Persistence\Migrations\20260920122409_Init.Designer.cs`
3. `c:\Source\TemplateLandingPage\BE\src\Persistence\Migrations\ApplicationDbContextModelSnapshot.cs`

### C. Các file cần tạo mới (Scaffold migration mới cho PostgreSQL)
- Chạy lệnh CLI để sinh lại trọn vẹn bộ migration PostgreSQL:
  `dotnet ef migrations add Init --project BE/src/Persistence --startup-project BE/src/API --output-dir Migrations`
  (Sẽ tạo ra snapshot và migration file tương thích chuẩn cú pháp PostgreSQL).

---

## 3. CHỮ KÝ HÀM / INTERFACE / PACKAGE NUGET / CONFIG CẦN CÓ

### 3.1. NuGet Package (`TemplateLandingPage.Persistence.csproj`)
```xml
<ItemGroup>
  <PackageReference Include="Microsoft.EntityFrameworkCore" Version="9.0.2" />
  <PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="9.0.4" />
  <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="9.0.2">
    <PrivateAssets>all</PrivateAssets>
    <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
  </PackageReference>
</ItemGroup>
```

### 3.2. Cấu hình Connection String
- **`BE/src/API/appsettings.json`** (Supabase Connection String mẫu):
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=db.[PROJECT-REF].supabase.co;Port=5432;Database=postgres;Username=postgres;Password=[YOUR-PASSWORD];SSL Mode=Require;Trust Server Certificate=true;"
}
```
- **`BE/src/API/appsettings.Development.json`** (Localhost / Dev DB):
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=TemplateLandingPageDb;Username=postgres;Password=postgres;"
}
```

### 3.3. Dependency Injection (`ServiceCollectionExtensions.cs`)
```csharp
services.AddDbContext<ApplicationDbContext>((sp, options) =>
{
    var interceptor = sp.GetRequiredService<AuditableEntityInterceptor>();
    var connectionString = configuration.GetConnectionString("DefaultConnection");

    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorCodesToAdd: null);
        npgsqlOptions.CommandTimeout(60);
        npgsqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
    })
    .AddInterceptors(interceptor);
});
```

### 3.4. DateTime UTC Handling (`ApplicationDbContext.cs`)
Đảm bảo Npgsql không ném lỗi `Cannot write DateTime with Kind=Unspecified to PostgreSQL type 'timestamp with time zone'`:
```csharp
protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
{
    configurationBuilder.Properties<DateTime>()
        .HaveConversion<UtcDateTimeConverter>();
    configurationBuilder.Properties<DateTime?>()
        .HaveConversion<UtcNullableDateTimeConverter>();
    base.ConfigureConventions(configurationBuilder);
}

internal sealed class UtcDateTimeConverter : ValueConverter<DateTime, DateTime>
{
    public UtcDateTimeConverter()
        : base(
            d => d.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(d, DateTimeKind.Utc) : d.ToUniversalTime(),
            d => DateTime.SpecifyKind(d, DateTimeKind.Utc))
    {
    }
}

internal sealed class UtcNullableDateTimeConverter : ValueConverter<DateTime?, DateTime?>
{
    public UtcNullableDateTimeConverter()
        : base(
            d => !d.HasValue ? d : (d.Value.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(d.Value, DateTimeKind.Utc) : d.Value.ToUniversalTime()),
            d => !d.HasValue ? d : DateTime.SpecifyKind(d.Value, DateTimeKind.Utc))
    {
    }
}
```

### 3.5. DataSeeder Migration Execution (`DataSeeder.cs`)
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

### 3.6. Exception Handling (`Program.cs`)
```csharp
catch (NpgsqlException npgsqlEx)
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    logger.LogError(npgsqlEx,
        "Lỗi kết nối cơ sở dữ liệu PostgreSQL / Supabase (SqlState {SqlState}): {Message}. " +
        "Hướng dẫn khắc phục: " +
        "1. Kiểm tra chuỗi kết nối 'DefaultConnection' trong appsettings.json / appsettings.Development.json hoặc biến môi trường. " +
        "2. Đảm bảo dịch vụ PostgreSQL hoặc Supabase instance đang hoạt động và cấu hình đúng SSL Mode=Require. " +
        "3. Kiểm tra thông tin host, port (5432 direct / 6543 pooler), username, password.",
        npgsqlEx.SqlState,
        npgsqlEx.Message);
}
```

---

## 4. CÁC TRƯỜNG HỢP BIÊN BẮT BUỘC PHẢI XỬ LÝ

1. **Kiểu dữ liệu DateTime (UTC vs Unspecified) trong PostgreSQL**:
   - Npgsql 6+ mặc định ánh xạ `DateTime` sang `timestamp with time zone` (`timestamptz`). Nếu đối tượng `DateTime` có `Kind == DateTimeKind.Unspecified`, Npgsql sẽ ném ngoại lệ ngay lập tức khi thực thi query/command.
   - **Xử lý**: Bắt buộc gắn `UtcDateTimeConverter` và `UtcNullableDateTimeConverter` vào `ConfigureConventions` của `ApplicationDbContext`.
2. **Không tái sử dụng Migration cũ của SQL Server**:
   - Snapshot hiện tại và migration `20260920122409_Init.cs` chứa các chỉ thị cụ thể của SQL Server (`nvarchar`, `datetime2`, `SqlServerModelBuilderExtensions.UseIdentityColumns`).
   - Nếu chạy trực tiếp trên Postgres sẽ gây lỗi cú pháp SQL (`42704: type "datetime2" does not exist`).
   - **Xử lý**: Xoá toàn bộ 3 file migration cũ và tạo lại migration mới bằng `dotnet ef migrations add Init`.
3. **Tương thích `InMemoryDatabase` trong Unit Test**:
   - `BE/test/UnitTests/Persistence/DataSeederTests.cs` sử dụng `UseInMemoryDatabase`. Nếu gọi `context.Database.MigrateAsync()` trên InMemory DB sẽ gây ra ngoại lệ `InvalidOperationException: Relational-specific methods can only be used when the context is using a relational database provider`.
   - **Xử lý**: Kiểm tra `context.Database.IsRelational()` trước khi chạy `MigrateAsync()`.
4. **Cập nhật Unit Tests của Persistence**:
   - `BE/test/UnitTests/Persistence/ServiceCollectionExtensionsTests.cs` kiểm tra cứng chuỗi `"Microsoft.EntityFrameworkCore.SqlServer"`. Cần cập nhật sang `"Npgsql.EntityFrameworkCore.PostgreSQL"` cùng các chuỗi kết nối mẫu theo định dạng Postgres để đảm bảo `dotnet test` vượt qua 100%.
5. **Cấu hình kết nối Supabase (Direct Connection vs Pooler)**:
   - Supabase yêu cầu SSL: Chuỗi kết nối bắt buộc phải có `SSL Mode=Require;Trust Server Certificate=true;`.
   - Supabase Direct connection sử dụng cổng `5432` (hỗ trợ đầy đủ DDL/migration). Cổng `6543` là Transaction Pooler (Supavisor), không nên dùng để chạy migration do giới hạn cơ chế transaction pooling.
6. **Kiểu dữ liệu chuỗi JSON (`ConfigJson`, `DefaultConfigJson`)**:
   - Hiện tại thuộc tính này là kiểu `string`. Trong PostgreSQL, EF Core Npgsql ánh xạ `string` sang `text`, hoàn toàn lưu trữ chuỗi JSON tùy ý mà không cần ép kiểu jsonb phức tạp, giữ nguyên vẹn logic hiện tại của các use case.

---

## 5. QUY ƯỚC CẦN BÁM THEO (TÊN FILE THAM CHIẾU)

1. **Dependency Injection & Cấu hình DbContext**:
   - File tham chiếu: [BE/src/Persistence/DependencyInjection/Extensions/ServiceCollectionExtensions.cs](file:///c:/Source/TemplateLandingPage/BE/src/Persistence/DependencyInjection/Extensions/ServiceCollectionExtensions.cs)
   - Copy quy ước: Extension method `AddPersistence(this IServiceCollection services, IConfiguration configuration)`.
2. **Audit Logging & DateTime**:
   - File tham chiếu: [BE/src/Persistence/Interceptors/AuditableEntityInterceptor.cs](file:///c:/Source/TemplateLandingPage/BE/src/Persistence/Interceptors/AuditableEntityInterceptor.cs)
   - Copy quy ước: Xử lý `IAuditableEntity` với `DateTime.UtcNow`.
3. **Startup Error Handling**:
   - File tham chiếu: [BE/src/API/Program.cs](file:///c:/Source/TemplateLandingPage/BE/src/API/Program.cs)
   - Copy quy ước: Log structured message và hướng dẫn khắc phục cụ thể theo mã lỗi cơ sở dữ liệu.
4. **Unit Test Structure**:
   - File tham chiếu: [BE/test/UnitTests/Persistence/ServiceCollectionExtensionsTests.cs](file:///c:/Source/TemplateLandingPage/BE/test/UnitTests/Persistence/ServiceCollectionExtensionsTests.cs)
   - Copy quy ước: Cấu trúc vùng `#region 1. Happy Path Tests`, `#region 2. Edge Case Tests`, `#region 3. Failure Path Tests` kết hợp `FluentAssertions`.
