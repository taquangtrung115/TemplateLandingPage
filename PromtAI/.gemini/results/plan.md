# Kế hoạch triển khai: Cập nhật .gitignore và loại trừ các file bin, obj đang bị Git theo dõi

## 1. CÂU HỎI CÒN BỎ NGỎ
Không có.

---

## 2. Phân tích nguyên nhân gốc rễ (Root Cause Analysis)
1. **Trạng thái hiện tại của Git Index**:
   - Hiện tại có **584 file** nằm trong các thư mục `bin/` và `obj/` thuộc 9 project của Backend (`BE/src/API`, `BE/src/Application`, `BE/src/Contract`, `BE/src/Domain`, `BE/src/Infrastructure`, `BE/src/Persistence`, `BE/src/Presentation`, `BE/test/Architecture.Tests`, `BE/test/UnitTests`) đã bị theo dõi (tracked) trong Git index từ các commit trước đó.
2. **Cơ chế hoạt động của Gitignore**:
   - `.gitignore` chỉ áp dụng cho các **untracked files** (tập tin chưa từng được add/commit vào git index).
   - Đối với các file đã được Git theo dõi (`tracked`), Git tiếp tục theo dõi mọi thay đổi nội dung/metadata của chúng kể cả khi mẫu đường dẫn đã khớp với quy tắc trong `.gitignore`.
3. **Thiếu sót trong cấu hình `.gitignore` gốc**:
   - File [`.gitignore`](file:///e:/Code/TemplateLandingPage/.gitignore) ở thư mục gốc chưa bao quát đầy đủ các quy tắc đệ quy cho cả .NET (`**/bin/`, `**/obj/`, `**/.vs/`) và các build artifact / env file của Frontend Vite/Node (`dist/`, `**/dist/`, `dist-ssr/`, `.env.local`, `.env.*.local`).

---

## 3. Danh sách file cần tạo mới hoặc cần sửa
- [`.gitignore`](file:///e:/Code/TemplateLandingPage/.gitignore) (Sửa đổi): Bổ sung và chuẩn hóa các quy tắc loại trừ cho Backend (.NET) và Frontend (Vite/React).
- Không có file mã nguồn logic C# (.NET) hay Javascript/React nào cần tạo mới hoặc sửa đổi.

---

## 4. Chữ ký hàm hoặc interface cần có
Không có (Tác vụ thuộc phạm vi cấu hình Git repository, dọn dẹp Git cache index và kiểm thử build hệ thống).

---

## 5. Quy ước cần bám theo (Coding & Operational Conventions)
- Bám sát quy chuẩn tại file [`PromtAI/.gemini/agents/coder.md`](file:///e:/Code/TemplateLandingPage/PromtAI/.gemini/agents/coder.md):
  - **Phần C1 - Nguyên tắc chung bắt buộc**: Build sạch trước khi bàn giao (`dotnet test` pass toàn bộ, `npm run build` không lỗi).
  - Không xóa hoặc làm ảnh hưởng mã nguồn và file cấu hình ngoài phạm vi yêu cầu.
  - Sau khi hoàn thành, tạo file kết quả bàn giao tại `PromtAI/.gemini/results/change.md`.
- Bám sát quy trình tại [`PromtAI/.gemini/agents/planner.md`](file:///e:/Code/TemplateLandingPage/PromtAI/.gemini/agents/planner.md).

---

## 6. Các trường hợp biên bắt buộc phải xử lý (Edge Cases)
1. **Nguy cơ mất file vật lý trên ổ đĩa**:
   - Bắt buộc phải sử dụng cờ `--cached` trong lệnh `git rm` (tức `git rm -r --cached ...`).
   - Tuyệt đối không chạy `git rm -r` thông thường vì sẽ xóa sạch các file build binary vật lý của lập trình viên trên ổ cứng.
2. **Hiện tượng file xuất hiện lại dưới dạng Untracked sau khi xóa cache**:
   - Nếu `.gitignore` chưa bao quát đúng mẫu pattern trước khi dọn cache, sau khi `git rm --cached`, các file vật lý tồn tại trên đĩa sẽ ngay lập tức bị Git nhận diện thành `Untracked files` trong `git status`.
   - Do đó, cần đảm bảo `.gitignore` được cập nhật và lưu trước khi thực hiện dọn index hoặc đồng thời được stage cùng lúc.
3. **Độ bao phủ của tất cả các dự án con trong BE**:
   - Thư mục `BE/` gồm 9 project con. Phải đảm bảo toàn bộ `bin/` và `obj/` của cả 9 project đều được untrack sạch sẽ:
     - `BE/src/API`
     - `BE/src/Application`
     - `BE/src/Contract`
     - `BE/src/Domain`
     - `BE/src/Infrastructure`
     - `BE/src/Persistence`
     - `BE/src/Presentation`
     - `BE/test/Architecture.Tests`
     - `BE/test/UnitTests`
4. **Không làm ảnh hưởng môi trường build**:
   - Sau khi loại bỏ tracking, chạy lại kiểm thử tự động `dotnet test` và `npm run build` để xác nhận việc loại trừ không gây lỗi biên dịch hay thiếu hụt file cần thiết.

---

## 7. Các bước triển khai chi tiết cho Coder

### Bước 1: Cập nhật file `.gitignore` tại root
Chỉnh sửa [`.gitignore`](file:///e:/Code/TemplateLandingPage/.gitignore) ở thư mục gốc:
- Đảm bảo cụm quy tắc .NET build outputs:
  ```gitignore
  # Build results & Binaries
  [Dd]ebug/
  [Dd]ebugPublic/
  [Rr]elease/
  [Rr]eleases/
  [Bb]in/
  [Oo]bj/
  **/bin/
  **/obj/
  [Oo]ut/
  .vs/
  **/.vs/
  *.user
  *.suo
  *.userosscache
  *.sln.docstates
  ```
- Bổ sung/chuẩn hóa cụm quy tắc Frontend (Vite / React / Node):
  ```gitignore
  # Node & Frontend Build outputs
  node_modules/
  **/node_modules/
  dist/
  **/dist/
  dist-ssr/
  **/dist-ssr/
  *.local
  .env.local
  .env.*.local
  ```

### Bước 2: Loại bỏ toàn bộ `bin/` và `obj/` đang bị track khỏi Git index
Thực hiện lệnh gỡ theo dõi nhưng giữ nguyên file vật lý:
```powershell
git rm -r --cached BE/src/API/bin BE/src/API/obj BE/src/Application/bin BE/src/Application/obj BE/src/Contract/bin BE/src/Contract/obj BE/src/Domain/bin BE/src/Domain/obj BE/src/Infrastructure/bin BE/src/Infrastructure/obj BE/src/Persistence/bin BE/src/Persistence/obj BE/src/Presentation/bin BE/src/Presentation/obj BE/test/Architecture.Tests/bin BE/test/Architecture.Tests/obj BE/test/UnitTests/bin BE/test/UnitTests/obj
```
*(Hoặc dùng lệnh ngắn gọn: `git rm -r --cached "**/bin" "**/obj"`)*

### Bước 3: Kiểm tra trạng thái Git index
Chạy:
```powershell
git status
```
**Tiêu chí nghiệm thu**:
- 584 file `bin/` và `obj/` chuyển sang danh sách staged: `Changes to be committed: deleted: ...`.
- File `.gitignore` ở trạng thái modified (hoặc staged).
- Mục `Untracked files:` **không được chứa** bất kỳ file/thư mục nào thuộc `bin/` hoặc `obj/`.

### Bước 4: Kiểm tra tính toàn vẹn của mã nguồn (Verification)
1. Chạy unit test backend:
   ```powershell
   dotnet test BE/test/UnitTests/TemplateLandingPage.UnitTests.csproj
   ```
   Kết quả yêu cầu: Toàn bộ 232 test đều **Passed** (0 Failed).
2. Chạy build frontend:
   ```powershell
   cd FE; npm run build
   ```
   Kết quả yêu cầu: `vite build` hoàn tất thành công (Exit code 0).

### Bước 5: Bàn giao kết quả
Tạo file `PromtAI/.gemini/results/change.md` tóm tắt chi tiết các nội dung đã thực hiện theo đúng định dạng được quy định trong [`coder.md`](file:///e:/Code/TemplateLandingPage/PromtAI/.gemini/agents/coder.md).
