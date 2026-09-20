# BẢN TỔNG KỢT THAY ĐỔI (CHANGE LOG)

## 1. DANH SÁCH FILE THAY ĐỔI VÀ TẠO MỚI

1. `BE/src/API/appsettings.json` (Sửa)
2. `BE/src/API/appsettings.Development.json` (Sửa)
3. `BE/src/Persistence/DependencyInjection/Extensions/ServiceCollectionExtensions.cs` (Sửa)
4. `BE/src/API/Program.cs` (Sửa)
5. `BE/test/UnitTests/Persistence/ServiceCollectionExtensionsTests.cs` (Tạo mới)

---

## 2. CHI TIẾT CÁC THAY ĐỔI VÀ MỤC ĐÍCH

### 2.1. `BE/src/API/appsettings.json`
- **Mục đích**: Cập nhật chuỗi kết nối `ConnectionStrings:DefaultConnection` sang MSSQLLocalDB:
  ```json
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=TemplateLandingPageDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true;"
  }
  ```
- **Ý nghĩa**: Giúp backend kết nối chuẩn xác vào instance LocalDB mặc định trên môi trường Windows (`(localdb)\mssqllocaldb`), bật `MultipleActiveResultSets=true` hỗ trợ các truy vấn đồng thời qua EF Core.

### 2.2. `BE/src/API/appsettings.Development.json`
- **Mục đích**: Bổ sung override cấu hình `ConnectionStrings:DefaultConnection` với cùng chuỗi kết nối LocalDB:
  ```json
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=TemplateLandingPageDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true;"
  }
  ```
- **Ý nghĩa**: Đảm bảo môi trường Development luôn luôn ưu tiên LocalDB dù chạy độc lập hay ghi đè cấu hình cơ sở.

### 2.3. `BE/src/Persistence/DependencyInjection/Extensions/ServiceCollectionExtensions.cs`
- **Mục đích**: Cấu hình Connection Resilience và Timeout cho SQL Server trong `AddPersistence`:
  ```csharp
  options.UseSqlServer(connectionString, sqlOptions =>
  {
      sqlOptions.EnableRetryOnFailure(
          maxRetryCount: 5,
          maxRetryDelay: TimeSpan.FromSeconds(30),
          errorNumbersToAdd: null);
      sqlOptions.CommandTimeout(60);
  })
  .AddInterceptors(interceptor);
  ```
- **Ý nghĩa**: Tự động thử lại khi gặp lỗi kết nối tạm thời (transient faults) hoặc hiện tượng LocalDB đang khởi động / thức dậy trễ (wake-up delay); tăng thời gian chờ lệnh truy vấn lên 60s; giữ nguyên `AuditableEntityInterceptor`.

### 2.4. `BE/src/API/Program.cs`
- **Mục đích**: 
  - Bổ sung `using Microsoft.Data.SqlClient;`.
  - Phân tách khối `catch (SqlException sqlEx)` trước `catch (Exception ex)` trong quá trình thực thi `DataSeeder.SeedAsync`:
  ```csharp
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
  ```
- **Ý nghĩa**: Giúp developer và tester chẩn đoán tức thì nguyên nhân kết nối database thất bại (sai connection string, chưa start LocalDB instance, hoặc service SQL tắt) kèm giải pháp từng bước trên Windows.

### 2.5. `BE/test/UnitTests/Persistence/ServiceCollectionExtensionsTests.cs`
- **Mục đích**: Tạo test suite kiểm thử phương thức mở rộng `AddPersistence`:
  - Kiểm tra `ApplicationDbContext` được đăng ký và khởi tạo thành công qua scope service provider.
  - Kiểm tra tất cả repository interfaces (`IUnitOfWork`, `IUserRepository`, `ITemplateRepository`, `ICategoryRepository`, `IProductRepository`, `INavigationMenuRepository`, `ICustomizationRepository`, `IRsvpRepository`, `IGuestbookRepository`) được đăng ký dạng Scoped và resolve không bị null.
- **Ý nghĩa**: Đảm bảo cấu hình Dependency Injection của tầng Persistence luôn toàn vẹn và không thiếu sót repository nào khi ứng dụng khởi chạy.

---

## 3. VỊ TRÍ TRỌNG YẾU TESTER NÊN SOI KỸ

1. **Khối bắt ngoại lệ `SqlException` trong [Program.cs](file:///e:/Code/TemplateLandingPage/BE/src/API/Program.cs#L108-L120)**:
   - Thử cấu hình `DefaultConnection` sai tên instance (ví dụ: `Server=(localdb)\\not_exist;...`) để kích hoạt ngoại lệ.
   - Kiểm tra xem log console có xuất hiện thông điệp hướng dẫn rõ ràng kèm mã lỗi `sqlEx.Number` hay không.
2. **Cấu hình Connection Resilience trong [ServiceCollectionExtensions.cs](file:///e:/Code/TemplateLandingPage/BE/src/Persistence/DependencyInjection/Extensions/ServiceCollectionExtensions.cs#L22-L30)**:
   - Kiểm tra xem `EnableRetryOnFailure` và `CommandTimeout(60)` có hoạt động tương thích với `AuditableEntityInterceptor` và các transaction của `IUnitOfWork` hay không.
3. **Tính nhất quán cấu hình ConnectionStrings**:
   - Soi kỹ 2 file [appsettings.json](file:///e:/Code/TemplateLandingPage/BE/src/API/appsettings.json#L10-L12) và [appsettings.Development.json](file:///e:/Code/TemplateLandingPage/BE/src/API/appsettings.Development.json#L9-L11), xác nhận chuỗi kết nối LocalDB khớp nhau.
4. **Kiểm thử toàn bộ hệ thống (Regression Testing)**:
   - Tất cả 299 Unit Tests trong `TemplateLandingPage.UnitTests.csproj` phải pass 100%.
   - Tất cả 7 Architecture Tests trong `TemplateLandingPage.Architecture.Tests.csproj` phải pass 100%.
   - Toàn bộ solution `BE/TemplateLandingPage.sln` build thành công với 0 cảnh báo (warnings) và 0 lỗi (errors).
   - Frontend `npm run build` trong thư mục `FE` biên dịch thành công 0 lỗi.
