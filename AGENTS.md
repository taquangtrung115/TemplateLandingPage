## Structure backend riêng của OnePortal

- Quy tắc này áp dụng riêng cho repository `TemplateLandingPage` và ưu tiên hơn mẫu thư mục BE dùng chung. Giữ ranh giới các layer hiện có.
- `BE/src/Contract/Services/V1/<Module>[/<Nghiệp vụ>]` chỉ dùng tên file `Command.cs`, `Query.cs` và `Response.cs`. Gom request và DTO cùng nhóm theo trách nhiệm. Nhóm chỉ đọc có thể bỏ `Command.cs`.
- `BE/src/Application/UseCases/V1/Commands/<Module>[/<Nghiệp vụ>]` và `.../Queries/<Module>[/<Nghiệp vụ>]` chứa handler. Đặt validator trong thư mục `Validators` của nhóm tương ứng. Namespace theo đường dẫn. API chuyển request tới MediatR.
- `BE/src/Domain/Entities/<Module>` chứa entity thuộc module. Namespace theo thư mục. Khi chuyển entity, giữ nguyên ánh xạ bảng/schema, khóa, tenant scope và lịch sử migration.
- Chạy build, architecture tests, kiểm tra EF model và integration tests liên quan khi thay đổi structure hoặc namespace.

## Agent Workspace & Routing (Quy tắc phân luồng độc lập)

Bắt buộc xác định danh tính trước khi thực thi. Mỗi bên chỉ được phép hoạt động trong đúng không gian của mình, tuyệt đối KHÔNG can thiệp chéo:

### 1. Nếu môi trường đang chạy là GEMINI (hoặc Antigravity):
- Không gian duy nhất được phép truy cập: `PromtAI/.gemini/`
  - Đọc kịch bản tại: `PromtAI/.gemini/commands/`
  - Đọc vai trò tại: `PromtAI/.gemini/agents/`
  - Đọc và ghi kết quả bàn giao tại: `PromtAI/.gemini/results/`
- CẤM: Không đọc hoặc ghi vào `PromtAI/.codex/`, không xuất file ra `.gemini/` hay `results/` ngoài root.

### 2. Nếu môi trường đang chạy là CODEX:
- Không gian duy nhất được phép truy cập: `PromtAI/.codex/`
  - Đọc kịch bản tại: `PromtAI/.codex/commands/`
  - Đọc vai trò tại: `PromtAI/.codex/agents/`
  - Đọc và ghi kết quả bàn giao tại: `PromtAI/.codex/results/`
- CẤM: Không đọc hoặc ghi vào `PromtAI/.gemini/`, không xuất file ra `.codex/` hay `results/` ngoài root.
