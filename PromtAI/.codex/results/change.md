# Bàn giao triển khai

Phạm vi: toàn bộ kế hoạch người dùng duyệt về nháp/phiên bản/quyền/phản hồi/export/catalog, cộng bổ sung 20 mẫu cho mỗi danh mục hiện có (19 danh mục, 380 mẫu mới). Không push/merge/PR; không migration hay seed DB thật.

## Backend do root triển khai

- Domain: UserCustomization giữ nháp làm việc, Revision, LastVersionNumber, PublishedVersionId, ClientDraftId và thông tin retry; thêm CustomizationVersion bất biến và CustomizationSlugAlias giữ slug vĩnh viễn.
- Contract/Application Customizations: tạo/lưu chỉ nháp; chủ động tạo snapshot; chọn/gỡ công khai một phiên bản hoặc cả trang; detail/list owner/Admin; public chỉ snapshot đang public; admin liệt kê và gán chủ trang vô chủ. Tất cả mutation một SaveChanges. Revision/unique race trả 409, retry có request ID.
- Persistence: configurations/DbSets/summary read models; đọc no-tracking; projection và phân trang list; UnitOfWork ánh xạ lỗi concurrency/unique thành conflict. GetPublicVersion filter trước projection để EF dịch được SQL.
- Migration 20260925091034_VersionedPublishing: backfill toàn bộ trang cũ thành v1, alias, gắn phản hồi hợp lệ; orphan giữ null; deleted/private không public. Design-time factory bắt buộc env connection explicit.
- LoggingPipelineBehavior ghi operation ID và mã lỗi, không nội dung config/contact/token.
- Data catalog: TemplateCatalog.json (19 x20 concept), TemplateCatalogStyles.json, config builder/seeder additive, tool BE/tools/CatalogSeeder. Re-run giữ nội dung và slug đã tồn tại. Demo seed bổ sung snapshot và chỉ được chạy Development opt-in. SVG generator tạo thumbnail dọc và cover ngang cho 380 mẫu; không copy artwork ngoài.
- Docs: _Docs/VERSIONED_PUBLISHING.md, _Docs/TEMPLATE_CATALOG_RESEARCH.md (nguồn research + lệnh seed).

## Các phần triển khai khác

Đọc change-fe.md, change-public.md, change-security.md cùng thư mục để xem danh sách thay đổi và vị trí cần soi kỹ:

- IndexedDB draftId/CAS/migration nháp cũ, autosave500ms, trạng thái lưu thật và giữ nội dung lỗi storage.
- Auth quay lại query/hash đúng, pending action, tách nháp theo tài khoản; My Sites/Drafts/version controls/admin pages.
- Active account & refreshed role cho auth, bảo vệ Admin APIs, dữ liệu public active, community share từ snapshot/account/category thật.
- RSVP/guestbook gắn version, owner-only RSVP, không success giả; safe URLs, export từ renderer cùng section, CTA chỉ có đích hợp lệ.
- Catalog quick preview tải detail sau khi list đổi sang projection; xử lý lỗi/rỗng; mobile closed drawer overflow đã sửa và kiểm tra. HomePage bỏ fallback mẫu giả; Footer/Products dùng đúng thông tin và quyền.

## Kiểm tra của coder/root

- Baseline trước đổi: FE147, BE375, architecture7 xanh; FE thiếu dependency installed đã xử lý cho build.
- API build sạch; FE production build sạch (còn cảnh báo chunk lớn).
- PostgreSQL18.4 riêng tại 127.0.0.1:55432, DB template_integration, user template_test (trust local). Migration chạy thành công trên DB mới.
- Seed lần1 thêm19 categories/380 templates; lần2 thêm0, giữ380.
- API thực tế localhost5511: smoke pass tạo user/login, guest401, owner/other403, draft private, tạo/retry v1/v2, đổi slug alias, stale revision409, snapshotkhông đổi, chọn/gỡ phiên bản, RSVPversionbound, admin403.
- Playwright catalog desktop1440/mobile390: tải380, mỗi danh mục20, không lỗiJS; lỗi overflowmobileđã tìm tới drawer Navbar để sửa.
- FE test cũ18fail/147 và BE test compile37lỗi do contract cũ; **chưa** phải kết quả Tester. Theo kế hoạch đã duyệt phải sửa các test xác nhận hành vi sai và cập nhật mock contract, giữ ý nghĩa kiểm thử.

## Môi trường dành cho Tester

- API thực tế hiện dùng DB template_browser: http://localhost:5511/api/v1, FE http://localhost:5175, cùng PostgreSQL loopback/user ở trên (chỉ local). template_integration là DB smoke trước đó, cũng chỉ dữ liệu kiểm thử.
- Test phải tạo DB tên riêng cho migration/backfill/unique/concurrency; không dùng appsettings connectionstring. Đừng drop database template_integration đang dùng cho browser.
- Node_modules FE gốc có process dev giữ lock. Đã cài đúng lockfile bằng npm ci --ignore-scripts trong bản sao sạch BE/test/obj/fe-clean. Dùng robocopy FE BE/test/obj/fe-clean /E /XD node_modules dist để cập nhật source, rồi npm test/build tại đó. Không sửa source trong bản sao để bàn giao.
- @playwright/test + fake-indexeddb có trong FE/package.json và lockfile, cài tại clean copy; Chromium đã tải. E2E mới viết ở FE/e2e; không thay product source khi viết test.
- Ưu tiên browser auth roundtrip/2nháp/reload, storageerror/multi-tab/retry, phiên bản/alias, publicformsfailure, desktop+mobile. PostgreSQL API integration phải kiểm migration dữ liệu cũ + transaction rollback, uniqueness và optimistic concurrency.

## Rà soát cuối trước Tester

- Version detail/list có isMain để chọn lại một version từng công khai làm bản chính. Copy URL luôn tuyệt đối.
- Các truy vấn quyền/version-list/community dùng ReadAccessAsync (không tải nháp ConfigJson); guestbook không đọc lại cùng snapshot.
- Public forms chỉ hiển thị khi enabled===true khớp backend.
- Navbar /products và /#how-it-works có đích thật. Sửa href danh mục Footer, bỏ tuyên bố 100%offline. Products chỉ Admin thấy/nộp thao tác ghi, có retry tải lỗi.
- Rà soát trong lúc Tester chạy: DraftsPage có nhóm nháp khách riêng khi đã đăng nhập; lỗi đọc storage không hiển thị giả danh sách trống. My Sites luôn cho gỡ toàn bộ sau khi gỡ bản chính, đồng thời hủy kết quả tải cũ khi đổi tài khoản. Tester FE đã nhận yêu cầu bổ sung regression.
- Master template create/update dùng chung validation JSON với customization qua Common/Validation/LandingPageConfigRules, kiểm tra max length theo schema và slug. Tester BE đã nhận yêu cầu kiểm thử API lỗi đúng field.
- Tải đủ font của catalog trong editor và HTML export, bổ sung các font tương ứng vào lựa chọn của editor.
- Sửa vòng đời Customizer: đổi query/hash cùng bản nháp không tắt autosave. Clipboard chỉ hiển thị đã chép khi thao tác thành công.
- Tester tìm lỗi EF9/.NET10 với Contains trên mảng Guid trong seed demo; chuyển sang List để biểu thức truy vấn được dịch bình thường, không thay điều kiện lọc.
- Chỉ đạo mới nhất của người dùng: tự chạy migration. Từ thời điểm nhận chỉ đạo không thực thi migration thêm; kiểm thử API dùng schema local đã chuẩn bị trước đó, không đụng DB Supabase. Chưa chạy migration/backfill trên dữ liệu cũ ở vòng Tester.
