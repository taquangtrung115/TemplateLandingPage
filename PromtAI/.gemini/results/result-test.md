# BÁO CÁO KIỂM THỬ CHẤT LƯỢNG (TEST REPORT)

**Chặng**: 3 - Tester  
**Trạng thái tổng thể**: **PASS 100% (TẤT CẢ TEST CASES VÀ BUILD ĐỀU XANH)**  
**Kỷ luật kiểm thử**: Tuân thủ tuyệt đối quy định chỉ tạo/sửa file trong `BE/test/` và `FE/test/`, không can thiệp code sản phẩm trong `BE/src/` hay `FE/src/`.

---

## 1. TỔNG HỢP KẾT QUẢ THỰC THI KIỂM THỬ

### A. Backend (.NET 10 Clean Architecture)
- **Lệnh thực thi**: `dotnet test BE/TemplateLandingPage.sln /p:AllowMissingPrunePackageData=true`
- **Kết quả tổng thể**: **330 / 330 tests PASS (0 Failed, 0 Skipped)**
  - `TemplateLandingPage.UnitTests.dll`: **323 passed** (tăng thêm 3 tests cho luồng Guest Create, Template NotFound, Duplicate Slug)
  - `TemplateLandingPage.Architecture.Tests.dll`: **7 passed**
- **Thời gian chạy**: ~3.2 giây

### B. Frontend (React 19 + Vite + Vitest)
- **Lệnh thực thi**: `npm test` trong thư mục `FE/`
- **Kết quả tổng thể**: **5 / 5 test suites PASS, 67 / 67 tests PASS (0 Failed)**
  - `test/apiUnwrap.test.js`: **16 tests PASS**
  - `test/authContext.test.jsx`: **11 tests PASS**
  - `test/loginPage.test.jsx`: **8 tests PASS**
  - `test/customizerDynamic.test.jsx`: **26 tests PASS** (mở rộng từ 14 lên 26 tests)
  - `test/customizerGuestFlow.test.jsx`: **6 tests PASS** (bộ test mới cho luồng khách vãng lai)
- **Thời gian chạy**: ~15.8 giây

### C. Frontend Production Build
- **Lệnh thực thi**: `npm run build` trong thư mục `FE/`
- **Kết quả**: **Build thành công sạch sẽ (Built in 9.22s, 0 lỗi cú pháp/import)**

---

## 2. MA TRẬN BAO PHỦ 3 NHÓM KIỂM THỬ THEO YÊU CẦU

### NHÓM 1: ĐƯỜNG CHẠY THUẬN LỢI (HAPPY PATHS)

| Mã kiểm thử | Đối tượng & Kịch bản kiểm thử | File thực thi | Kết quả |
| :--- | :--- | :--- | :---: |
| **HP-BE-01** | Khách vãng lai tạo mới thiệp với `UserId == null` lưu thành công vào cơ sở dữ liệu | `CreateCustomizationCommandHandlerTests.cs` | **PASS** |
| **HP-BE-02** | Khách vãng lai cập nhật tiếp thiệp vừa tạo (`UserId == null`) thành công qua `UpdateCustomizationCommand` | `UpdateCustomizationCommandHandlerTests.cs` | **PASS** |
| **HP-BE-03** | Chủ sở hữu đã đăng nhập cập nhật thiệp của chính mình thành công | `UpdateCustomizationCommandHandlerTests.cs` | **PASS** |
| **HP-BE-04** | Quản trị viên (Admin) cập nhật bất kỳ thiệp nào thành công | `UpdateCustomizationCommandHandlerTests.cs` | **PASS** |
| **HP-FE-01** | Khách vãng lai truy cập `/customize/:templateId` mà không bị chuyển hướng sang `/login` | `customizerGuestFlow.test.jsx` | **PASS** |
| **HP-FE-02** | Khách vãng lai tùy biến và bấm "Lưu", gọi API tạo mới thiệp với `userId = null` và tự động cập nhật URL sang route chỉnh sửa | `customizerGuestFlow.test.jsx` | **PASS** |
| **HP-FE-03** | Khách vãng lai tiếp tục sửa và lưu thiệp thành công qua `PUT /api/v1/customizations/:id` | `customizerGuestFlow.test.jsx` | **PASS** |
| **HP-FE-04** | Thêm nhân vật mới (`person3`, `person4`...) tăng tuần tự index, hiển thị đầy đủ tên, danh xưng, avatar, bio, bố mẹ và animation | `customizerDynamic.test.jsx` | **PASS** |
| **HP-FE-05** | Render linh hoạt bố cục Dynamic Persons: 1 người (căn giữa), 2 người (2 cột), 3 người (3 cột), 4+ người (4 cột responsive) | `customizerDynamic.test.jsx` | **PASS** |
| **HP-FE-06** | Thêm khối mở rộng Lời cảm ơn (`thankYou`): render tiêu đề, phụ đề, ảnh minh họa và văn bản nhiều dòng | `customizerDynamic.test.jsx` | **PASS** |
| **HP-FE-07** | Thêm khối mở rộng VietQR (`giftQr`): tự động sinh mã QR chuẩn VietQR từ Tên NH + STK, hiển thị chủ tài khoản, nút sao chép STK | `customizerDynamic.test.jsx` | **PASS** |
| **HP-FE-08** | Thêm khối mở rộng Hỏi đáp (`qa`): hiển thị danh sách accordion, bấm vào câu hỏi để mở/đóng câu trả lời mượt mà | `customizerDynamic.test.jsx` | **PASS** |
| **HP-FE-09** | Thêm khối mở rộng Tùy biến (`custom`): hiển thị tiêu đề và nội dung tùy ý | `customizerDynamic.test.jsx` | **PASS** |
| **HP-FE-10** | Xuất Standalone HTML (`exportStandaloneHtml`): tạo tài liệu HTML độc lập hoàn chỉnh chứa CSS keyframes, offline `IntersectionObserver` script, dynamic persons và extra sections | `customizerDynamic.test.jsx` | **PASS** |

---

### NHÓM 2: TRƯỜNG HỢP BIÊN (EDGE CASES)

| Mã kiểm thử | Đối tượng & Kịch bản kiểm thử | File thực thi | Kết quả |
| :--- | :--- | :--- | :---: |
| **EC-01** | **Re-indexing person khi xóa ở giữa**: Xóa `person2` trong danh sách 4 người -> danh sách tự động dồn lại thành `person1`, `person2`, `person3` mới, không bị đứt quãng index hay mất dữ liệu | `customizerDynamic.test.jsx` | **PASS** |
| **EC-02** | **Chặn xóa khi chỉ còn 1 person**: Nút xóa nhân vật trong Sidebar bị vô hiệu hóa (`disabled`) khi danh sách chỉ còn 1 người; helper `removePersonHelper` bảo vệ giữ tối thiểu 1 người | `customizerDynamic.test.jsx` | **PASS** |
| **EC-03** | **Cấu hình cũ (Legacy Config Compatibility)**: Config rỗng `{}` hoặc thiếu các trường mới (`accentColor`, `textColor`, `stylePreset`, `extraSections`, `animation`) render an toàn với fallback, không bị crash trắng trang | `customizerDynamic.test.jsx` | **PASS** |
| **EC-04** | **Cuộn trong preview container**: Component `ScrollReveal` tích hợp fallback timer (500ms), tự động chuyển class `revealed` và kích hoạt CSS animation ngay cả khi observer bị trễ trong khung preview | `customizerDynamic.test.jsx` | **PASS** |
| **EC-05** | **Khối mở rộng bị tắt (`enabled: false`)**: Ẩn hoàn toàn khỏi giao diện Landing Page khi người dùng toggle tắt | `customizerDynamic.test.jsx` | **PASS** |
| **EC-06** | **Tự động sao lưu và khôi phục LocalStorage**: Khi khách vãng lai tùy biến, bản nháp được sao lưu vào `guest_draft_{templateId}` và khôi phục đầy đủ config khi mở lại | `customizerGuestFlow.test.jsx` | **PASS** |

---

### NHÓM 3: TRƯỜNG HỢP THẤT BẠI & KIỂM SOÁT QUYỀN (FAILURE PATHS)

| Mã kiểm thử | Đối tượng & Kịch bản kiểm thử | File thực thi | Kết quả |
| :--- | :--- | :--- | :---: |
| **FP-BE-01** | User B cố tình gửi `PUT` sửa thiệp thuộc sở hữu của User A -> Bị từ chối với mã lỗi `CustomizationErrors.Unauthorized` (HTTP 403 Forbidden) | `UpdateCustomizationCommandHandlerTests.cs` | **PASS** |
| **FP-BE-02** | Guest cố tình gửi `PUT` sửa thiệp thuộc sở hữu của một User đã đăng ký -> Bị từ chối với mã lỗi `CustomizationErrors.Unauthorized` | `UpdateCustomizationCommandHandlerTests.cs` | **PASS** |
| **FP-BE-03** | Cập nhật thiệp với Slug đã tồn tại ở bản ghi khác -> Trả về lỗi `CustomizationErrors.DuplicateSlug` | `UpdateCustomizationCommandHandlerTests.cs` | **PASS** |
| **FP-BE-04** | Tạo mới thiệp với Slug đã có trong hệ thống -> Trả về lỗi `CustomizationErrors.DuplicateSlug` | `CreateCustomizationCommandHandlerTests.cs` | **PASS** |
| **FP-BE-05** | Cập nhật thiệp với Guid không tồn tại -> Trả về lỗi `CustomizationErrors.NotFound` | `UpdateCustomizationCommandHandlerTests.cs` | **PASS** |
| **FP-BE-06** | Tạo mới thiệp với TemplateId không tồn tại -> Trả về lỗi `TemplateErrors.NotFound` | `CreateCustomizationCommandHandlerTests.cs` | **PASS** |
| **FP-BE-07** | Validation Command: Kiểm tra dữ liệu rỗng (Id, Title, Slug, ConfigJson) -> FluentValidation bắt lỗi chính xác từng thuộc tính | `UpdateCustomizationCommandValidatorTests.cs`, `CreateCustomizationCommandValidatorTests.cs` | **PASS** |
| **FP-FE-01** | API lưu thiệp gặp lỗi (mất mạng / lỗi máy chủ) -> Giao diện hiển thị thông báo alert an toàn và bảo toàn bản nháp trên trình duyệt | `customizerGuestFlow.test.jsx` | **PASS** |

---

## 3. DANH SÁCH CHI TIẾT FILE TEST ĐÃ TẠO VÀ MỞ RỘNG

1. `BE/test/UnitTests/Application/Customizations/CreateCustomizationCommandHandlerTests.cs` (MỞ RỘNG):
   - Bổ sung `Handle_Should_Succeed_WhenGuestCreatesCustomization_WithNullUserId`: Kiểm tra lưu thiệp của khách vãng lai (`UserId == null`).
   - Bổ sung `Handle_Should_ReturnNotFound_WhenTemplateDoesNotExist`: Kiểm tra bắt lỗi khi templateId không có trong kho mẫu.
   - Bổ sung `Handle_Should_ReturnDuplicateSlug_WhenSlugAlreadyExists`: Kiểm tra bắt lỗi trùng slug khi tạo mới.

2. `FE/test/customizerDynamic.test.jsx` (MỞ RỘNG):
   - Mở rộng từ 14 lên 26 tests bao gồm:
     + Bố cục Dynamic Persons (1, 2, 3, 4 người) với các class CSS responsive tương ứng.
     + Các khối Extra Sections: Lời cảm ơn, VietQR, Q&A accordion với thao tác click mở/đóng, Custom block.
     + Kiểm tra cờ `enabled: false` không render.
     + ScrollReveal fallback timer (500ms) kích hoạt class animation.
     + Standalone HTML Exporter: kiểm tra HTML chứa đầy đủ DOCTYPE, CSS keyframes, script offline, dynamic persons và extra sections.
     + CustomizerSidebar: Thao tác thêm/xóa nhân vật (disabled khi còn 1 người) và thêm các extra sections từ sidebar.

3. `FE/test/customizerGuestFlow.test.jsx` (TẠO MỚI):
   - Bộ 6 unit/integration tests bao quát luồng khách vãng lai:
     + Truy cập `/customize/:templateId` không cần đăng nhập.
     + Lưu thiệp mới không cần token đăng nhập và chuyển hướng sang route sửa thiệp.
     + Cập nhật thiệp đã tạo bằng phương thức PUT.
     + Xử lý lỗi API và thông báo bản nháp an toàn.
     + Khôi phục cấu hình từ LocalStorage.
     + Kích hoạt nút xuất Standalone HTML.

---

## 4. KẾT LUẬN & ĐÁNH GIÁ CHẤT LƯỢNG

1. **Độ tin cậy nghiệp vụ**: Cả 3 nhóm kiểm thử (Đường chạy thuận lợi, Trường hợp biên, Trường hợp thất bại & Kiểm soát quyền) đều được thiết kế chặt chẽ và đạt kết quả kiểm thử **100% XANH**.
2. **Tính độc lập & Kỷ luật kiến trúc**: Toàn bộ mã nguồn sản phẩm trong `BE/src/` và `FE/src/` được giữ nguyên vẹn. Không có bất kỳ thay đổi nào vi phạm ranh giới Clean Architecture hay cấu trúc dự án.
3. **Sẵn sàng chuyển giao**: Dây chuyền đủ điều kiện chuyển giao sang chặng **Reviewer** để thẩm định và nghiệm thu cuối cùng.
