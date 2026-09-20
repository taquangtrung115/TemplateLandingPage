# BÁO CÁO THAY ĐỔI MÃ NGUỒN (CHANGE LOG)

**Chặng**: 2 - Coder  
**Trạng thái**: Hoàn tất triển khai Backend & Frontend, tất cả Unit Tests và Build đều PASS 100%.

---

## 1. DANH SÁCH FILE ĐÃ THAY ĐỔI VÀ TẠO MỚI

### A. Backend (.NET Clean Architecture)
1. `BE/src/Presentation/APIs/Customizations/CustomizationApi.cs` (SỬA)
   - Bỏ `.RequireAuthorization()` ở endpoint `PUT /api/v1/customizations/{id:guid}` để khách vãng lai (Guest) cập nhật được các thiệp do họ tạo (`UserId == null`).
   - Xử lý lỗi `CustomizationErrors.Unauthorized` trong `HandleResult` trả về `StatusCodes.Status403Forbidden`.
2. `BE/src/Application/UseCases/V1/Customizations/Commands/UpdateCustomizationCommandHandler.cs` (SỬA)
   - Điều chỉnh logic kiểm tra quyền: Nếu `customization.UserId == null`, cho phép Guest cập nhật tự do; nếu `customization.UserId.HasValue`, bắt buộc user hiện tại phải là chủ sở hữu (`CurrentUserId == customization.UserId`) hoặc có quyền `Admin`.
3. `BE/test/UnitTests/Application/Customizations/UpdateCustomizationCommandHandlerTests.cs` (TẠO MỚI)
   - Bổ sung bộ kiểm thử 7 unit tests kiểm tra đầy đủ các kịch bản: Guest cập nhật bản ghi `UserId == null`, Chủ sở hữu cập nhật, Admin cập nhật, User khác bị chặn (Unauthorized), Guest sửa thiệp người khác bị chặn, Lỗi không tìm thấy (NotFound), Lỗi trùng slug (DuplicateSlug).

### B. Frontend (React 19 + Tailwind CSS + Vite)
1. `FE/src/routes/index.jsx` (SỬA)
   - Bỏ component `<ProtectedRoute>` khỏi `/customize/:templateId` và `/customize/:templateId/:customizationId` để khách vãng lai tự do tạo và tùy biến thiệp.
2. `FE/src/utils/animationConstants.js` (TẠO MỚI)
   - Định nghĩa `ANIMATION_OPTIONS` (11 kiểu hiệu ứng: `none`, `fade-up`, `fade-down`, `fade-left`, `fade-right`, `zoom-in`, `zoom-out`, `flip-up`, `bounce`, `float`, `pulse`).
   - Hàm `getAnimationClass(animationType, isVisible)`.
   - Các helpers xử lý Dynamic Persons: `extractPersonsList`, `addPersonHelper`, `removePersonHelper` (tự động re-index person1, person2... khi xóa giữa chừng, đảm bảo tối thiểu 1 nhân vật).
3. `FE/src/index.css` (SỬA)
   - Bổ sung `@keyframes` và các class CSS animation: `.animate-fade-up`, `.animate-fade-down`, `.animate-fade-left`, `.animate-fade-right`, `.animate-zoom-in`, `.animate-zoom-out`, `.animate-flip-up`, `.animate-bounce-subtle`, `.reveal-transition`.
4. `FE/src/components/common/ScrollReveal.jsx` (TẠO MỚI)
   - Component bọc animation scroll-triggered qua `IntersectionObserver`.
   - Tích hợp fallback timer tự động hiển thị sau 500ms để vùng preview cuộn trong Customizer không bao giờ bị mất chữ hay trắng trang.
5. `FE/src/components/customizer/AnimationSelector.jsx` (TẠO MỚI)
   - Component dropdown UI chọn animation trực quan cho từng section và từng object.
6. `FE/src/components/customizer/CustomizerSidebar.jsx` (SỬA)
   - Quản lý Dynamic Persons: Thêm nhân vật mới, xóa nhân vật (disabled khi chỉ còn 1 người), chỉnh sửa avatar, danh xưng, tên, bio, bố mẹ, và animation riêng cho từng người.
   - Thêm tab `Mở rộng (Sections)`: Thêm/sửa/xóa/toggle bật tắt các extra sections (Lời cảm ơn, VietQR, Q&A accordion, Custom content block).
   - Bổ sung đầy đủ các trường: `accentColor`, `textColor`, `stylePreset`, `defaultAnimation`, `mapEmbedUrl`, animation cho timeline, gallery, rsvp, wishes, toggle `allowPlusOnes`, toggle `autoPlay`.
7. `FE/src/components/templates/LandingPageRenderer.jsx` (SỬA)
   - Layout Dynamic Persons thích ứng theo số lượng: 1 người (căn giữa), 2 người (2 cột), 3 người (3 cột), 4+ người (grid 4 cột responsive).
   - Gắn `ScrollReveal` cho từng object: Hero, thẻ từng nhân vật, Event details, Timeline item, Gallery image, RSVP card, Wishes card.
   - Render các extra sections: Lời cảm ơn, VietQR (tự sinh QR code qua VietQR API + nút sao chép STK), Q&A accordion đóng/mở mượt mà, Custom block, và iframe nhúng bản đồ Google Maps.
8. `FE/src/components/templates/MotionParticles.jsx` (SỬA)
   - Bổ sung kiểm tra an toàn `canvas.getContext('2d')` để tránh lỗi null context trong môi trường test/headless.
9. `FE/src/pages/CustomizerPage.jsx` (SỬA)
   - Cập nhật logic lưu cho khách vãng lai (Guest): lưu qua API backend với `userId = null`, chuyển hướng mượt sang `/customize/:templateId/:newId`.
   - Tự động sao lưu bản nháp vào `localStorage` (`guest_draft_${templateId}`) và phục hồi khi mở lại hoặc khi mất mạng.
10. `FE/src/utils/defaultTemplates.js` (SỬA)
    - Cập nhật cấu trúc schema đầy đủ cho `DEFAULT_WEDDING_CONFIG` và `DEFAULT_BIRTHDAY_CONFIG` (chứa đầy đủ animation, accentColor, textColor, stylePreset, extraSections mẫu).
11. `FE/src/utils/htmlExporter.js` (SỬA)
    - Cập nhật xuất file HTML độc lập hỗ trợ Dynamic N persons, các Extra sections (VietQR, Lời cảm ơn, Q&A), nhúng đầy đủ keyframes và script offline `IntersectionObserver`.
12. `FE/vite.config.js` (SỬA)
    - Cấu hình test environment `jsdom` và `globals: true` cho Vitest.
13. `FE/test/customizerDynamic.test.jsx` (TẠO MỚI)
    - 14 bài kiểm thử cho Animation Constants, Dynamic Persons helpers (thêm, xóa, re-index, biên 1 person), AnimationSelector, ScrollReveal, và LandingPageRenderer với các bộ config.

---

## 2. KẾT QUẢ KIỂM THỬ VÀ BUILD

1. **Backend Tests**:
   - Lệnh: `dotnet test BE/TemplateLandingPage.sln /p:AllowMissingPrunePackageData=true`
   - Kết quả: **327/327 tests PASS (0 Failed, 0 Skipped)**
     + `TemplateLandingPage.UnitTests.dll`: 320 tests passed
     + `TemplateLandingPage.Architecture.Tests.dll`: 7 tests passed

2. **Frontend Tests**:
   - Lệnh: `npm test`
   - Kết quả: **4/4 test suites PASS, 49/49 tests PASS (0 Failed)**
     + `test/apiUnwrap.test.js`: 16 tests passed
     + `test/authContext.test.jsx`: 11 tests passed
     + `test/loginPage.test.jsx`: 8 tests passed
     + `test/customizerDynamic.test.jsx`: 14 tests passed

3. **Frontend Build**:
   - Lệnh: `npm run build`
   - Kết quả: **Build thành công sạch sẽ (built in 13.58s)**

---

## 3. VỊ TRÍ TRỌNG YẾU TESTER NÊN SOI KỸ

1. **Quyền truy cập & Lưu của Khách vãng lai (Guest Customization Flow)**:
   - Truy cập trực tiếp `/customize/{templateId}` khi chưa đăng nhập (ẩn danh / incognito).
   - Nhập thông tin, bấm "Lưu thiệp" -> Hệ thống phải lưu thành công và URL đổi thành `/customize/{templateId}/{customizationId}` mà không bị chuyển hướng sang `/login` hay nhận lỗi 401 Unauthorized.
   - Tiếp tục sửa tiếp một số trường trên URL mới đó và bấm "Lưu thiệp" lần 2 -> Phải gọi `PUT` thành công.
   - Thử dùng tài khoản User B cập nhật thiệp thuộc sở hữu của User A -> Phải bị chặn lỗi 403 Forbidden.

2. **Thao tác Thêm / Sửa / Xóa Dynamic Persons**:
   - Bấm "+ Thêm nhân vật": Kiểm tra xuất hiện `Nhân vật 3`, `Nhân vật 4`.
   - Kiểm tra giao diện xem trước (Preview): Khi có 1 người (căn giữa), 2 người (2 cột), 3 người (3 cột), 4 người (grid 4 cột responsive).
   - Xóa `person2` trong danh sách 3 người: Kiểm tra `person3` được đẩy lên thành `person2` mới (không bị sót hay lỗi key).
   - Xóa cho đến khi chỉ còn 1 người: Nút xóa phải bị disabled (không cho phép xóa người cuối cùng).

3. **Khối mở rộng (Extra Sections) & VietQR**:
   - Thêm section VietQR: Nhập ngân hàng (MB, VCB...) và STK -> Kiểm tra trên trang xem trước và xuất HTML có hiển thị mã QR VietQR chuẩn xác, nút bấm sao chép STK hoạt động.
   - Thêm section Q&A: Thử đóng mở accordion câu hỏi/câu trả lời.
   - Thêm section Lời cảm ơn và Custom block: Kiểm tra hiển thị ảnh và định dạng văn bản nhiều dòng.

4. **Hiệu ứng Scroll Animation & Xem trước**:
   - Thay đổi dropdown animation của các section/object (ví dụ: `zoom-in`, `fade-up`, `bounce`, `flip-up`).
   - Kiểm tra cuộn trong khung xem trước (Preview desktop & mobile) và trên trang standalone HTML sau khi xuất tải về máy.
