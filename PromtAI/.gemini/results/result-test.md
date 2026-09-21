# Báo Cáo Kết Quả Kiểm Thử (Test Report) - Chặng 3: Tester

---

## 1. Tổng Quan Kết Quả Kiểm Thử

- **Môi trường thực thi**: .NET 10.0 (`net10.0`), OS Windows
- **Framework & Thư viện kiểm thử**: xUnit 2.9.3, FluentAssertions 7.0.0, Moq 4.20.72, NetArchTest.Rules 1.3.2, Microsoft.EntityFrameworkCore.InMemory 9.0.2
- **Lệnh thực thi**: `dotnet test BE/TemplateLandingPage.sln`
- **Trạng thái**: **100% PASS** (Xanh toàn bộ, 0 warning, 0 error, không có lỗi tiềm ẩn)

### Thống Kê Số Lượng Tests
| Test Project | Số Test Pass | Số Test Fail | Số Test Skipped | Tổng Số Test | Thời Gian Thực Thi |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `TemplateLandingPage.Architecture.Tests` | 7 | 0 | 0 | 7 | ~289 ms |
| `TemplateLandingPage.UnitTests` | 355 | 0 | 0 | 355 | ~1.0 s |
| **TỔNG CỘNG** | **362** | **0** | **0** | **362** | **~1.3 s** |

---

## 2. Các File Test Được Bổ Sung Và Mở Rộng

Theo đúng nguyên tắc: **Chỉ tạo và cập nhật file trong thư mục test (`BE/test/`), tuyệt đối không can thiệp vào code sản phẩm (`BE/src/`)**.

1. **Tạo mới:** [`BE/test/UnitTests/Persistence/ApplicationDbContextTests.cs`](file:///c:/Source/TemplateLandingPage/BE/test/UnitTests/Persistence/ApplicationDbContextTests.cs)
   - Kiểm thử chuyên sâu `ApplicationDbContext`, cơ chế ánh xạ `ConfigureConventions` gán `UtcDateTimeConverter` và `UtcNullableDateTimeConverter`.
   - Kiểm thử tính toàn vẹn của 8 DbSets.
   - Kiểm thử hành vi ghi và đọc dữ liệu qua ChangeTracker và ValueConverter.

2. **Mở rộng:** [`BE/test/UnitTests/Persistence/ServiceCollectionExtensionsTests.cs`](file:///c:/Source/TemplateLandingPage/BE/test/UnitTests/Persistence/ServiceCollectionExtensionsTests.cs)
   - Bổ sung kiểm tra cấu hình options Npgsql (`CommandTimeout(60)`, `MigrationsAssembly`, resilience retry on failure).
   - Bổ sung kiểm tra chuỗi kết nối Supabase Pooler (Port 6543, Pooling options, SSL Mode).
   - Bổ sung kiểm tra ngoại lệ `ArgumentException` khi chuỗi kết nối Npgsql chứa port hoặc từ khoá không hợp lệ.

3. **Mở rộng:** [`BE/test/UnitTests/Persistence/DataSeederTests.cs`](file:///c:/Source/TemplateLandingPage/BE/test/UnitTests/Persistence/DataSeederTests.cs)
   - Bổ sung kiểm tra cơ chế phân định `context.Database.IsRelational()`: Chứng minh InMemory database không hỗ trợ `MigrateAsync()` (ném `InvalidOperationException`), qua đó khẳng định nhánh rẽ an toàn của `DataSeeder.SeedAsync` gọi `EnsureCreatedAsync()`.
   - Bổ sung kiểm tra ngoại lệ khi `passwordHasher` null.

---

## 3. Chi Tiết Kịch Bản Kiểm Thử Theo 3 Nhóm Chuẩn

### Nhóm 1: Happy Path (Đường chạy thuận lợi)

1. **Đăng ký DI Persistence & Npgsql Provider (`ServiceCollectionExtensionsTests`)**:
   - `AddPersistence_Should_RegisterAllRequiredPersistenceServices`: Xác nhận đăng ký đầy đủ `ApplicationDbContext`, `IUnitOfWork`, 9 repositories.
   - `AddPersistence_Should_RegisterConcreteRepositoryTypesCorrectly`: Kiểm tra ánh xạ interface sang implementation chính xác.
   - `AddPersistence_Should_ConfigureNpgsqlProviderForDbContext`: Kiểm tra `ProviderName` chính xác là `"Npgsql.EntityFrameworkCore.PostgreSQL"`.
   - `AddPersistence_Should_ConfigureNpgsqlSpecificOptions`: Xác nhận `CommandTimeout` là 60 giây, `MigrationsAssembly` chỉ định đúng assembly chứa `ApplicationDbContext`, và `Database.IsNpgsql()` là `true`.
   - `AddPersistence_Should_ConfigureAuditableEntityInterceptorAsSingleton`: Interceptor được đăng ký Singleton xuyên suốt các scope.
   - `AddPersistence_Should_RegisterRepositoriesAndDbContextAsScoped`: Đảm bảo phạm vi Scoped cho DbContext và repositories.

2. **Đăng ký Conventions & Value Converters (`ApplicationDbContextTests`)**:
   - `ConfigureConventions_Should_RegisterValueConverter_ForAllDateTimeProperties`: Duyệt toàn bộ entity types trong Model, đảm bảo 100% thuộc tính `DateTime` đều có ValueConverter gán sẵn (`ModelClrType == typeof(DateTime)` và `ProviderClrType == typeof(DateTime)`).
   - `ConfigureConventions_Should_RegisterValueConverter_ForAllNullableDateTimeProperties`: Duyệt toàn bộ entity types, đảm bảo 100% thuộc tính `DateTime?` đều có ValueConverter gán sẵn.
   - `UtcDateTimeConverter_WhenConvertingUtcDateTime_ShouldRetainUtcKindAndValue`: Kiểm thử trực tiếp converter với giá trị UTC giữ nguyên `DateTimeKind.Utc` và giá trị thời gian.
   - `UtcNullableDateTimeConverter_WhenConvertingUtcNullableDateTime_ShouldRetainUtcKindAndValue`: Kiểm thử converter nullable với giá trị UTC.
   - `SaveChanges_WhenSavingEntityWithUtcDateTime_ShouldPersistAndQueryBackAsUtc`: Lưu thực thể `User` với UTC datetime, truy vấn lại sau khi xoá ChangeTracker đảm bảo `Kind == DateTimeKind.Utc`.
   - `ApplicationDbContext_AllDbSets_ShouldBeAccessibleAndConfigured`: Toàn bộ 8 `DbSet` (`Products`, `Users`, `Categories`, `NavigationMenus`, `Templates`, `UserCustomizations`, `RsvpEntries`, `GuestbookEntries`) được ánh xạ thành công.

3. **Data Seeding (`DataSeederTests`)**:
   - `SeedAsync_Should_PopulateAll8Tables_WhenDatabaseIsEmpty`: Seed đầy đủ 3 Users, 9 Categories, 10 NavigationMenus, 11 Templates, 6 UserCustomizations, 6 Rsvps, 7 Guestbooks, 4 Products.
   - `SeedAsync_Should_BeIdempotent_WhenExecutedMultipleTimes`: Chạy seeder nhiều lần không sinh trùng bản ghi.
   - `SeedAsync_Should_GenerateValidJson_ForTemplatesAndCustomizations`: Cấu hình JSON của Template và Customization hợp lệ và phân tích được.

---

### Nhóm 2: Edge Cases (Các trường hợp biên kỹ thuật)

1. **Chuẩn hoá múi giờ `DateTime` sang UTC cho PostgreSQL / Supabase (`ApplicationDbContextTests`)**:
   - `UtcDateTimeConverter_WhenGivenDateTimeKindUnspecified_ShouldConvertToUtc`: Chuyển đổi `DateTimeKind.Unspecified` thành `DateTimeKind.Utc` bằng `DateTime.SpecifyKind` (không làm lệch giờ), ngăn chặn lỗi ném ra từ Npgsql 6+ khi ghi vào cột `timestamptz`.
   - `UtcNullableDateTimeConverter_WhenGivenDateTimeKindUnspecified_ShouldConvertToUtc`: Chuyển đổi `DateTime?` Unspecified thành `DateTimeKind.Utc`.
   - `UtcDateTimeConverter_WhenGivenDateTimeKindLocal_ShouldConvertToUniversalTime`: Giá trị `DateTimeKind.Local` được chuyển đổi chính xác sang UTC thông qua `ToUniversalTime()`.
   - `UtcNullableDateTimeConverter_WhenGivenDateTimeKindLocal_ShouldConvertToUniversalTime`: Giá trị `DateTime?` Local được chuyển sang UTC.
   - `UtcNullableDateTimeConverter_WhenGivenNull_ShouldReturnNull`: Xử lý `null` an toàn ở cả hai chiều `ConvertToProvider` và `ConvertFromProvider`.
   - `SaveChanges_WhenSavingEntityWithUnspecifiedKind_ShouldPersistAndQueryBackAsUtc`: Lưu thực thể có `CreatedAtUtc` là Unspecified, truy vấn lại đảm bảo trường trả về có `Kind == DateTimeKind.Utc`.
   - `SaveChanges_WhenSavingEntityWithNullNullableDateTime_ShouldPersistAndQueryBackAsNull`: Lưu thực thể có `ModifiedAtUtc == null` và `DeletedAtUtc == null`, đọc ra giữ nguyên `null`.
   - `SaveChanges_WhenUpdatingEntityWithUnspecifiedNullableDateTime_ShouldPersistAndQueryBackAsUtc`: Cập nhật `ModifiedAtUtc` bằng Unspecified DateTime, lưu và đọc lại đảm bảo `Kind == DateTimeKind.Utc`.
   - `UtcDateTimeConverter_WithBoundaryDates_ShouldConvertCorrectly`: Kiểm tra các mốc ngày biên: Năm nhuận `29/02/2024`, năm nhuận tương lai `29/02/2028`, ranh giới thế kỷ `01/01/2000`.

2. **Cơ chế phân định Relational vs InMemory Database (`DataSeederTests` & `ApplicationDbContextTests`)**:
   - `Database_IsRelational_WhenUsingNpgsqlProvider_ShouldReturnTrue`: DbContext với cấu hình `UseNpgsql` trả về `Database.IsRelational() == true`.
   - `Database_IsRelational_WhenUsingInMemoryProvider_ShouldReturnFalse`: DbContext với `UseInMemoryDatabase` trả về `Database.IsRelational() == false`.
   - `SeedAsync_OnInMemoryDatabase_ShouldSafelyUseEnsureCreated_BecauseIsRelationalIsFalse`: Xác nhận nếu gọi trực tiếp `MigrateAsync()` trên InMemory sẽ ném `InvalidOperationException: Relational-specific methods can only be used when the context is using a relational database provider`. Nhánh `if (context.Database.IsRelational())` trong `DataSeeder` giúp môi trường test InMemory hoàn toàn không bị crash.

3. **Cấu hình mạng và chuỗi kết nối Supabase (`ServiceCollectionExtensionsTests`)**:
   - `AddPersistence_WhenConnectionStringHasCustomOptions_ShouldResolveSuccessfully`: Hỗ trợ Timeout tuỳ biến, Application Name, và cấu hình `SSL Mode=Require;Trust Server Certificate=true;`.
   - `AddPersistence_WhenConnectionStringHasSupabaseAndNetworkVariants_ShouldConfigureCorrectly`: Hỗ trợ chuỗi kết nối Supabase Transaction Pooler (cổng `6543`), IPv6 loopback (`[::1]`), và các tuỳ chọn pooling (`Minimum Pool Size`, `Maximum Pool Size`).

---

### Nhóm 3: Failure Path (Các trường hợp kỳ vọng thất bại)

1. **Chuỗi kết nối rỗng hoặc không hợp lệ (`ServiceCollectionExtensionsTests`)**:
   - `AddPersistence_WhenConnectionStringIsEmpty_OpeningConnectionShouldFail`: Chuỗi kết nối rỗng ném ngoại lệ `InvalidOperationException` khi gọi `OpenConnection()`.
   - `AddPersistence_WhenConnectionStringHasInvalidSyntax_ShouldFailWhenAccessingConnection`: Chuỗi kết nối chứa port sai định dạng (`Port=not_a_valid_port`) hoặc từ khoá lạ (`UnknownCustomKeyword=bad_value`) ném `ArgumentException` khi khởi tạo kết nối Npgsql.
   - `AddPersistence_WhenConfigurationIsNull_ShouldResolveDbContextWithEmptyConnectionString`: Xử lý cấu hình `IConfiguration` null an toàn.
   - `AddPersistence_WhenConnectionStringsSectionIsMissing_ShouldProduceEmptyConnectionString`: Mục ConnectionStrings bị thiếu trong cấu hình.
   - `AddPersistence_WhenConnectionStringIsEmptyOrWhitespace_ShouldStoreValueAsConfigured`: Xử lý khoảng trắng an toàn.

2. **Lỗi khởi tạo và toàn vẹn dữ liệu DbContext (`ApplicationDbContextTests`)**:
   - `ApplicationDbContext_WhenOptionsUnconfigured_ShouldThrowInvalidOperationExceptionOnDataAccess`: Truy cập dữ liệu trên context chưa cấu hình provider ném `InvalidOperationException` (*No database provider has been configured for this DbContext*).
   - `ApplicationDbContext_WhenDisposed_ShouldThrowObjectDisposedException`: Thao tác truy vấn trên DbContext đã gọi `Dispose()` ném `ObjectDisposedException`.
   - `ApplicationDbContext_WhenAddingDuplicateKeyEntity_ShouldThrowException`: Cố tình thêm entity có cùng khoá chính (Primary Key) vào ChangeTracker ném `InvalidOperationException` từ IdentityMap.

3. **Ngoại lệ khi tham số đầu vào của Seeder không hợp lệ (`DataSeederTests`)**:
   - `SeedAsync_Should_ThrowException_WhenContextIsNull`: Truyền `context == null` ném `NullReferenceException`.
   - `SeedAsync_Should_ThrowException_WhenPasswordHasherIsNull`: Truyền `passwordHasher == null` ném `NullReferenceException`.

---

## 4. Bằng Chứng CLI Log (Raw Output)

```text
PS C:\Source\TemplateLandingPage> dotnet test BE/TemplateLandingPage.sln
  Determining projects to restore...
  All projects are up-to-date for restore.
  TemplateLandingPage.Domain -> C:\Source\TemplateLandingPage\BE\src\Domain\bin\Debug\net10.0\TemplateLandingPage.Domain.dll
  TemplateLandingPage.Contract -> C:\Source\TemplateLandingPage\BE\src\Contract\bin\Debug\net10.0\TemplateLandingPage.Contract.dll
  TemplateLandingPage.Application -> C:\Source\TemplateLandingPage\BE\src\Application\bin\Debug\net10.0\TemplateLandingPage.Application.dll
  TemplateLandingPage.Infrastructure -> C:\Source\TemplateLandingPage\BE\src\Infrastructure\bin\Debug\net10.0\TemplateLandingPage.Infrastructure.dll
  TemplateLandingPage.Persistence -> C:\Source\TemplateLandingPage\BE\src\Persistence\bin\Debug\net10.0\TemplateLandingPage.Persistence.dll
  TemplateLandingPage.Presentation -> C:\Source\TemplateLandingPage\BE\src\Presentation\bin\Debug\net10.0\TemplateLandingPage.Presentation.dll
  TemplateLandingPage.API -> C:\Source\TemplateLandingPage\BE\src\API\bin\Debug\net10.0\TemplateLandingPage.API.dll
  TemplateLandingPage.Architecture.Tests -> C:\Source\TemplateLandingPage\BE\test\Architecture.Tests\bin\Debug\net10.0\TemplateLandingPage.Architecture.Tests.dll
Test run for C:\Source\TemplateLandingPage\BE\test\Architecture.Tests\bin\Debug\net10.0\TemplateLandingPage.Architecture.Tests.dll (.NETCoreApp,Version=v10.0)
A total of 1 test files matched the specified pattern.

Passed!  - Failed:     0, Passed:     7, Skipped:     0, Total:     7, Duration: 289 ms - TemplateLandingPage.Architecture.Tests.dll (net10.0)
  TemplateLandingPage.UnitTests -> C:\Source\TemplateLandingPage\BE\test\UnitTests\bin\Debug\net10.0\TemplateLandingPage.UnitTests.dll
Test run for C:\Source\TemplateLandingPage\BE\test\UnitTests\bin\Debug\net10.0\TemplateLandingPage.UnitTests.dll (.NETCoreApp,Version=v10.0)
A total of 1 test files matched the specified pattern.

Passed!  - Failed:     0, Passed:   355, Skipped:     0, Total:   355, Duration: 1 s - TemplateLandingPage.UnitTests.dll (net10.0)
```

---

## 5. Kết Luận Bàn Giao Chặng 3

- **Chất lượng kiểm thử**: Toàn bộ 362 test cases (tăng thêm 30 test cases mới so với thời điểm trước chặng 3) bao phủ toàn diện 3 nhóm: Happy path, Edge cases (DateTime UTC, null handling, relational check, Supabase pooler options) và Failure path (connection string rỗng/sai cú pháp, unconfigured DbContext, PK collision).
- **Tính toàn vẹn mã nguồn**: Chỉ thao tác trong thư mục `BE/test/`, hoàn toàn tuân thủ kiến trúc và các ràng buộc kỹ thuật.
- **Sẵn sàng bàn giao**: Đủ điều kiện chuyển sang Chặng 4 (Reviewer/Auditor) phê duyệt.
