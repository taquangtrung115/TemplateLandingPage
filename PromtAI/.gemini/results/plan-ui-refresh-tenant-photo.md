# KẾ HOẠCH UI/UX CHỐT CHO `FE_Tenant` VÀ `FE_PhotoPrint` (TIỆM IN ẢNH & PHOTOCOPY VIỆT NAM)

> **Quyết định chốt từ người dùng**:
> - **`FE_Tenant`**: Chọn **[01-command-rail.html](file:///c:/Source/TemplateLandingPage/PromtAI/.gemini/results/ui-previews/tenant/01-command-rail.html) — Command Rail & Bento**.
> - **`FE_PhotoPrint`**: Chọn **Mẫu 1 — [01-stride-3d-travelling.html](file:///c:/Source/TemplateLandingPage/PromtAI/.gemini/results/ui-previews/photo/01-stride-3d-travelling.html)** và tinh chỉnh hoàn chỉnh UI phù hợp tiệm In ảnh & Photocopy thực tế tại Việt Nam.
> - **File Plan chi tiết để bàn giao cho Codex triển khai (`FE_Tenant` + `FE_PhotoPrint` + `BE`)**: **[plan-codex-implement-tenant-photo.md](file:///c:/Source/TemplateLandingPage/PromtAI/.gemini/results/plan-codex-implement-tenant-photo.md)**.

---

## 1. NHỮNG NÂNG CẤP UI ĐÃ THỰC HIỆN TRÊN BẢN CHỐT PHOTO #01

1. **Tái định hướng đúng nhóm dịch vụ tiệm Photo Copy & In ảnh Việt Nam**:
   - **Nhóm dịch vụ trọng tâm**: **In ảnh thẻ 15p** (3×4 / 4×6 / Visa / hộ chiếu cắt sẵn + gửi file Zalo), **In ảnh lụa 4R** (`3.000đ/tấm` · Combo 10 tấm `30.000đ`), **Polaroid kỷ niệm ép Plastic**, và **In màu & Photocopy A4** (Scan PDF · Đóng cuốn · Ép dẻo).
   - **Nhóm dịch vụ mở rộng (đặt trước 1–2 ngày)**: **Khung gỗ sồi & Ảnh tráng gương pha lê** được sắp ở vị trí đặt trước bổ sung, không lấn át dịch vụ cốt lõi tại quầy.
2. **Loại bỏ hoàn toàn dáng "túi kẹo" (`1:2.085`), chuyển sang thẻ/bảng ảnh `1:1.36`**:
   - Tái tạo lại hàm dựng khối Three.js (`makeWrapperGeo`) theo dáng **bảng ảnh vát mép phẳng (`BH = 1.36`)**, xóa bỏ 2 dải hàn túi trên/dưới và phần phồng giữa.
   - Thiết kế lại mặt trước (`drawFrontCanvas`) với khung giấy ảnh `Fujicolor` viền trắng thanh thoát, badge dịch vụ + đơn giá rõ ràng; mặt sau (`drawBackCanvas`) là bảng quy cách, đơn giá quầy và quy trình gia công chuẩn tiệm ảnh.
   - Đồng bộ toàn bộ `.pk`, `.card`, `#inBar` và ô ghép Combo 3 sang đúng tỉ lệ thẻ ảnh `1:1.36`, kèm nhãn dịch vụ (`Lấy liền 15p`, `Bán chạy nhất`, `Photocopy`, `Đặt trước`) và giá niêm yết trên thẻ.
3. **Tích hợp luồng Thanh toán QR Ngân hàng (VietQR) & Ghi nhận giao dịch**:
   - Thêm nút **QR Ngân hàng** & **Giao dịch** trên thanh điều hướng cùng nút chuyển thẳng từ Giỏ hàng sang modal **`#pay-dlg`**.
   - Hỗ trợ chọn nhanh **Vietcombank / MB Bank / Techcombank**, tự động tính tổng tiền giỏ hàng (hoặc dịch vụ đang xem), sinh mã **VietQR** động + mã nội dung chuyển khoản (`MTP... IN ANH`) kèm nút sao chép STK/nội dung.
   - Nút **`Xác nhận đã chuyển khoản & Ghi nhận giao dịch`** tự động lưu biên lai vào **Lịch sử giao dịch** (kèm tổng thu, SĐT Zalo, ghi chú và nút đối soát trạng thái tại quầy).

---

## 2. DANH MỤC FILE PREVIEW LIÊN QUAN

- **Hub tổng hợp chọn mẫu**: [index.html](file:///c:/Source/TemplateLandingPage/PromtAI/.gemini/results/ui-previews/index.html)
- **Mẫu Tenant đã chọn (#01)**: [01-command-rail.html](file:///c:/Source/TemplateLandingPage/PromtAI/.gemini/results/ui-previews/tenant/01-command-rail.html)
- **Mẫu Photo đã chọn & sửa (#01)**: [01-stride-3d-travelling.html](file:///c:/Source/TemplateLandingPage/PromtAI/.gemini/results/ui-previews/photo/01-stride-3d-travelling.html)
- **Các bản tham khảo đối chứng khác (`02` → `10`)**: [02-vell-studio-configurator.html](file:///c:/Source/TemplateLandingPage/PromtAI/.gemini/results/ui-previews/photo/02-vell-studio-configurator.html) → [10-three-stage-monolith.html](file:///c:/Source/TemplateLandingPage/PromtAI/.gemini/results/ui-previews/photo/10-three-stage-monolith.html)
