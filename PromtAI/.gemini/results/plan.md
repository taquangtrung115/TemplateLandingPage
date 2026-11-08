# KẾ HOẠCH THỰC HIỆN CHẶNG 1 ($ship)

> **Mục tiêu**: Khắc phục triệt để lỗi 400 Bad Request trên API Quotations, xây dựng bộ test case Full Flow từ BE đến FE, và nâng cấp toàn diện giao diện với hệ thống Design System `@astryxdesign/core`.

---

## 1. DANH SÁCH FILE CẦN TẠO MỚI HOẶC SỬA ĐỔI

### 1.1. Backend (.NET 10 Web API)
- `BE/src/Contract/Services/V1/Quoting/Quotations/Command.cs` *(Sửa)*:
  - Đổi `Guid TemplateId` thành nullable `Guid? TemplateId = null` trong `CreateQuotationCommand`.
- `BE/src/Presentation/APIs/Quoting/QuotationApi.cs` *(Sửa)*:
  - Đổi `Guid TemplateId` thành nullable `Guid? TemplateId = null` trong `CreateQuotationRequest`.
  - Cập nhật map route POST `/api/v1/quoting/quotations` truyền `request.TemplateId` vào `CreateQuotationCommand`.
- `BE/src/Application/UseCases/V1/Quoting/Quotations/Commands/Validators/CreateQuotationCommandValidator.cs` *(Sửa)*:
  - Loại bỏ quy tắc bắt buộc `.NotEmpty()` đối với `TemplateId` (cho phép `null` hoặc `Guid.Empty` để handler tự động fallback).
- `BE/src/Application/UseCases/V1/Quoting/Quotations/Commands/CreateQuotationCommandHandler.cs` *(Sửa)*:
  - Bổ sung cơ chế fallback template: Nếu `TemplateId` là `null` hoặc `Guid.Empty`, tự động gọi `_templateRepository.GetDefaultSystemTemplateAsync(ct)` hoặc tìm template có `Code == "TPL-CHUOI-AN-VAT-V1"`.
- `BE/test/UnitTests/Application/Quoting/CreateQuotationCommandHandlerTests.cs` *(Sửa)*:
  - Bổ sung Unit Test kiểm tra fallback template hệ thống khi `TemplateId == null` hoặc `Guid.Empty`.
- `BE/test/IntegrationTests/QuotingFullFlowIntegrationTests.cs` *(Tạo mới)*:
  - Test case tích hợp bao phủ toàn bộ luồng full flow Quoting và CRUD Product/Customer/Template.

### 1.2. Frontend (`FE_Quoting` - React 19 + Astryx Design)
- `FE_Quoting/src/index.css` *(Sửa)*:
  - Chuẩn hóa CSS viền, padding, alignment cho `.astryx-button`, `.astryx-icon-button` để icon căn giữa tuyệt đối, không lệch border.
- `FE_Quoting/src/layouts/QuotingLayout.jsx` *(Sửa)*:
  - Bọc `<ToastViewport position="topEnd" />` từ `@astryxdesign/core/Toast` tại layout gốc để kích hoạt hệ thống thông báo toàn app.
- `FE_Quoting/src/components/common/ActionButton.jsx` *(Sửa)*:
  - Refactor sang bọc `Button` và `IconButton` chính hãng từ `@astryxdesign/core`.
- `FE_Quoting/src/pages/customers/CustomerListPage.jsx` *(Sửa)*:
  - Thay thế inline card form bằng `Drawer` & `DrawerHeader`.
  - Áp dụng `Field`, `FieldLabel`, `Pagination` (pageSize = 20), `Skeleton`, `Toast`, `AlertDialog`, `EmptyState`.
- `FE_Quoting/src/pages/products/ProductCatalogPage.jsx` *(Sửa)*:
  - Thay thế inline card form bằng `Drawer` & `DrawerHeader`.
  - Áp dụng `Field`, `InputGroup`, `InputGroupText`, `Switch`, `HoverCard` (xem ảnh to & mô tả), `Pagination` (pageSize = 20), `Skeleton`, `Toast`, `AlertDialog`, `EmptyState`.
- `FE_Quoting/src/pages/quotations/CreateQuotationPage.jsx` *(Sửa)*:
  - Sửa `DEFAULT_TEMPLATES` và `DEFAULT_CUSTOMERS` dùng UUID chuẩn RFC 4122.
  - Chuẩn hóa payload submit: `templateId: selectedTemplateId || null`, `customerId: isGenericCustomer ? null : (selectedCustomerId || null)`.
  - Áp dụng `Calendar` cho `issueDate` và `validUntil`.
  - Áp dụng `HoverCard` cho sản phẩm gợi ý, `Field`, `InputGroup`, `RadioList`, `Switch`, `Toast`, `useAnimatedLayout`.
- `FE_Quoting/src/pages/quotations/QuotationListPage.jsx` *(Sửa)*:
  - Áp dụng `Pagination` (pageSize = 20), `Skeleton` cho bảng và thẻ metric, `Toast`, `AlertDialog` khi xóa, `EmptyState`.
- `FE_Quoting/src/pages/quotations/QuotationDetailPage.jsx` *(Sửa)*:
  - Áp dụng `HoverCard` cho từng dòng sản phẩm, `AlertDialog` cho chuyển trạng thái / xóa báo giá, `Toast` cho thông báo kết quả xuất PDF và đổi trạng thái.
- `FE_Quoting/test/createQuotationPage.test.jsx` *(Sửa)*:
  - Cập nhật mock data `MOCK_CUSTOMERS`, `MOCK_TEMPLATES`, `MOCK_11_PRODUCTS` dùng UUID chuẩn.
- `FE_Quoting/test/quotingFullFlow.test.jsx` *(Tạo mới)*:
  - Test case kiểm thử trọn vẹn Full Flow FE: Tạo báo giá -> Xem preview -> Xuất PDF -> Đổi trạng thái -> Xóa báo giá & CRUD bổ trợ.

---

## 2. CHỮ KÝ HÀM, INTERFACE & HỢP ĐỒNG DỮ LIỆU (CONTRACTS)

### 2.1. Backend Contracts & Handlers
```csharp
// File: BE/src/Contract/Services/V1/Quoting/Quotations/Command.cs
public record CreateQuotationCommand(
    Guid? CustomerId,
    Guid? TemplateId = null,
    int? TemplateVersion = null,
    DateTime IssueDate = default,
    DateTime? ValidUntil = null,
    decimal DiscountPercent = 0,
    decimal TaxPercent = 0,
    string? Notes = null,
    List<QuotationItemDto> Items = null!,
    Guid UserId = default) : ICommand<Guid>;

// File: BE/src/Presentation/APIs/Quoting/QuotationApi.cs
public record CreateQuotationRequest(
    Guid? CustomerId,
    Guid? TemplateId = null,
    int? TemplateVersion = null,
    DateTime IssueDate = default,
    DateTime? ValidUntil = null,
    decimal DiscountPercent = 0,
    decimal TaxPercent = 0,
    string? Notes = null,
    List<QuotationItemDto> Items = null!);
```

**Handler Fallback Template:**
```csharp
// File: BE/src/Application/UseCases/V1/Quoting/Quotations/Commands/CreateQuotationCommandHandler.cs
QuotationTemplate? template = null;
if (!request.TemplateId.HasValue || request.TemplateId.Value == Guid.Empty)
{
    template = await _templateRepository.GetDefaultSystemTemplateAsync(cancellationToken);
    if (template is null)
    {
        // Fallback tìm template mặc định theo mã hệ thống
        var allTemplates = await _templateRepository.GetAllAsync(cancellationToken);
        template = allTemplates.FirstOrDefault(t => t.Code == "TPL-CHUOI-AN-VAT-V1" || t.IsSystem);
    }
}
else
{
    template = await _templateRepository.GetByIdWithVersionsAsync(request.TemplateId.Value, cancellationToken);
}

if (template is null || template.IsDeleted)
{
    return Result.Failure<Guid>(QuotationTemplateErrors.NotFound);
}
```

### 2.2. Astryx Design System Components Interface

```javascript
// 1. Button & Toggle Controls
import { Button } from '@astryxdesign/core/Button'; // props: label, variant: 'primary'|'secondary'|'ghost'|'destructive', size: 'sm'|'md'|'lg', icon, onClick, isLoading
import { ButtonGroup } from '@astryxdesign/core/ButtonGroup';
import { IconButton } from '@astryxdesign/core/IconButton'; // props: label, icon, variant, size, onClick
import { ToggleButton, ToggleButtonGroup } from '@astryxdesign/core/ToggleButton';

// 2. Drawer Panel for Editing & Creating
import { Drawer, DrawerHeader } from '@astryxdesign/core/Drawer';
// Drawer props: isOpen: boolean, onOpenChange: (open: boolean) => void, side: 'end', width: number | string, label: string
// DrawerHeader props: title: ReactNode, onOpenChange: (open: boolean) => void

// 3. Form Controls
import { Field, FieldLabel } from '@astryxdesign/core/Field'; // props: label, status: 'error'|'warning'|'success'
import { FieldStatus } from '@astryxdesign/core/FieldStatus'; // props: type, message
import { InputGroup, InputGroupText } from '@astryxdesign/core/InputGroup'; // props: label, isLabelHidden
import { NumberInput } from '@astryxdesign/core/NumberInput'; // props: value, onChange, min, max, step
import { RadioList, RadioListItem } from '@astryxdesign/core/RadioList'; // props: label, value, onChange
import { Switch } from '@astryxdesign/core/Switch'; // props: label, isChecked, onChange
import { Text, Heading } from '@astryxdesign/core/Text';

// 4. HoverCard
import { HoverCard } from '@astryxdesign/core/HoverCard'; // props: content: ReactNode, children: ReactElement, placement: 'above'|'below'|'start'|'end'

// 5. Pagination
import { Pagination } from '@astryxdesign/core/Pagination'; // props: page: number, onChange: (p: number) => void, totalItems: number, pageSize: number, pageSizeOptions: number[], onPageSizeChange: (s: number) => void

// 6. Skeleton Loading
import { Skeleton } from '@astryxdesign/core/Skeleton'; // props: width: number|string, height: number|string, radius: 1|2|3|4|'rounded', index: number

// 7. Toast & ToastViewport
import { useToast, ToastViewport } from '@astryxdesign/core/Toast';
// toast({ body: ReactNode, type: 'info' | 'error', isAutoHide: boolean, autoHideDuration: number })

// 8. Calendar
import { Calendar } from '@astryxdesign/core/Calendar'; // props: mode: 'single', value: string (YYYY-MM-DD), onChange: (val: string) => void

// 9. AlertDialog & EmptyState
import { AlertDialog } from '@astryxdesign/core/AlertDialog'; // props: isOpen, onOpenChange, title, description, actionLabel, actionVariant: 'destructive'|'primary', onAction, cancelLabel
import { EmptyState } from '@astryxdesign/core/EmptyState'; // props: title, description, icon, actions

// 10. Animation
import { createAnimator } from '@astryxdesign/core';
import { useAnimatedLayout } from '@astryxdesign/core/hooks';
```

---

## 3. CÁC TRƯỜNG HỢP BIÊN BẮT BUỘC PHẢI XỬ LÝ (EDGE CASES)

1. **Fallback Template khi `TemplateId` null / rỗng / mock `'t1'`**:
   - Backend: Nhận `TemplateId == null` hoặc `Guid.Empty` phải tự nạp System Template (`IsSystem == true` hoặc `Code == "TPL-CHUOI-AN-VAT-V1"`). Nếu hệ thống chưa seed template -> trả về lỗi `QuotationTemplateErrors.NotFound`.
   - Frontend: Không bao giờ gửi chuỗi phi UUID (như `'t1'`) lên API; phải gửi `null` hoặc UUID thật.

2. **Khách hàng bỏ qua (Báo giá vãng lai) vs Khách hàng cụ thể**:
   - `CustomerId == null`: Backend không được query repository customer, gán mặc định `CustomerName = "QUÝ KHÁCH HÀNG"`, các trường phone, address, taxCode là `null`.
   - `CustomerId` gửi chuỗi mock `'c1'`: Frontend gửi `null`. Nếu gửi GUID nhưng không có trong DB -> Backend trả lỗi `QuotingCustomerErrors.NotFound`.

3. **Sản phẩm ngoài danh mục (`ProductId == null`)**:
   - Cho phép báo giá chứa sản phẩm custom tự gõ tên và đơn giá mà không có `ProductId`.
   - Dòng sản phẩm: `Quantity` bắt buộc $> 0$, `UnitPrice` $\ge 0$, `DiscountPercent` trong đoạn $[0, 100]$. Danh sách sản phẩm không được rỗng.

4. **Trạng thái vòng đời Báo giá (State Transitions)**:
   - Chỉ được chỉnh sửa nội dung khi trạng thái là `Draft`. Cố gắng sửa báo giá ở trạng thái `Sent` hoặc `Approved` phải bị từ chối với `QuotationErrors.CannotEditNonDraft`.
   - Đổi trạng thái: Chuyển tuần tự `Draft` -> `Sent` -> `Approved` / `Rejected`, ghi nhật ký lịch sử (`QuotationHistory`).

5. **Xuất file PDF & Byte Array**:
   - Endpoint `/api/v1/quoting/quotations/{id}/export` với `FileType = "pdf"`: Xử lý khi báo giá tồn tại nhưng chưa có file -> tạo mới, lưu kho (resolver) và trả về `QuotationFileResponse` có URL/Path hoặc stream hợp lệ, không gây crash `NullReferenceException`.

6. **Phân trang (Pagination) & Bộ lọc**:
   - Khi tìm kiếm hoặc lọc trạng thái làm giảm số lượng bản ghi xuống dưới trang hiện tại, tự động đưa `page` về `1`.
   - Khi danh sách trống (`totalItems == 0`), hiển thị `EmptyState` với nút hành động tạo mới tương ứng.

7. **Tránh Memory Leak & Chớp giật khi render Skeleton**:
   - Chỉ hiển thị `Skeleton` khi `loading === true`.
   - Sử dụng `staggered index` ($0, 1, 2, ...$) cho `Skeleton` để tạo hiệu ứng wave mượt mà.

---

## 4. QUY ƯỚC CẦN BÁM THEO (CÁC FILE MẪU CHUẨN TRONG CODEBASE)

1. **Quy ước Result Pattern & CQRS Handlers**:
   - File mẫu: `BE/src/Application/UseCases/V1/Quoting/Quotations/Commands/CreateQuotationCommandHandler.cs`
   - File mẫu: `BE/src/Contract/Abstractions/Shared/Result.cs`
   - Bắt buộc trả về `Result.Success(...)` hoặc `Result.Failure(...)`. Không tự ý ném Exception chưa được bọc.

2. **Quy ước Minimal APIs & Auth Claims**:
   - File mẫu: `BE/src/Presentation/APIs/Quoting/QuotationApi.cs`
   - Trích xuất `UserId` an toàn qua `ClaimsPrincipal`: `user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub")`.

3. **Quy ước FluentValidation**:
   - File mẫu: `BE/src/Application/UseCases/V1/Quoting/Quotations/Commands/Validators/CreateQuotationCommandValidator.cs`

4. **Quy ước Integration Tests & Postgres API Fixture**:
   - File mẫu: `BE/test/IntegrationTests/CustomizationPublishingIntegrationTests.cs`
   - File mẫu: `BE/test/IntegrationTests/PostgresApiFixture.cs`

5. **Quy ước Design System Astryx, Theme Gothic Dark Mode & CSS Layers**:
   - File mẫu: `FE_Quoting/src/index.css`
   - File mẫu: `FE_Quoting/src/layouts/QuotingLayout.jsx`
   - File mẫu: `FE_Quoting/src/pages/quotations/CreateQuotationPage.jsx`

6. **Quy ước Unit Testing FE (Vitest + React Testing Library)**:
   - File mẫu: `FE_Quoting/test/createQuotationPage.test.jsx`
   - File mẫu: `FE_Quoting/test/tableFilterPages.test.jsx`
   - Tổ chức test theo 3 khối rõ ràng: `1. Đường chạy thuận lợi (Happy Paths)`, `2. Xử lý dữ liệu biên (Edge Cases)`, `3. Trường hợp thất bại & Chặn thao tác (Negative Cases)`.
