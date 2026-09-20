# Báo cáo thay đổi (Change Handover) - Chặng 2: Coder

## 1. Danh sách file đã thay đổi / tạo mới
- [`.gitignore`](file:///e:/Code/TemplateLandingPage/.gitignore) (Sửa đổi): Bổ sung quy tắc loại trừ đệ quy cho .NET (`**/bin/`, `**/obj/`, `**/.vs/`) và Frontend build outputs (`**/node_modules/`, `dist/`, `**/dist/`, `dist-ssr/`, `**/dist-ssr/`, `*.local`, `.env.local`, `.env.*.local`).
- **Git Index Cache**: Gỡ bỏ theo dõi (untracked khỏi index bằng `git rm -r --cached`) toàn bộ 584 file build artifacts trong các thư mục `bin/` và `obj/` thuộc 9 project backend. Giữ nguyên toàn bộ file vật lý trên ổ đĩa.
- [`PromtAI/.gemini/results/change.md`](file:///e:/Code/TemplateLandingPage/PromtAI/.gemini/results/change.md) (Tạo mới): Báo cáo bàn giao kết quả triển khai của Coder.

---

## 2. Chi tiết mỗi chỗ sửa để làm gì
1. **[`.gitignore`](file:///e:/Code/TemplateLandingPage/.gitignore)**:
   - Thêm `**/bin/`, `**/obj/` vào khối Build results & Binaries để đảm bảo mọi thư mục `bin` và `obj` ở bất kỳ cấp thư mục con nào trong repository đều được tự động bỏ qua.
   - Thêm `**/.vs/` để bỏ qua các thư mục cache của Visual Studio ở mọi cấp.
   - Thêm cụm Frontend & Node artifacts: `**/node_modules/`, `dist/`, `**/dist/`, `dist-ssr/`, `**/dist-ssr/`, `*.local`, `.env.local`, `.env.*.local` để ngăn chặn các tệp build và biến môi trường local của Vite/React bị commit nhầm.
2. **Git Index (`git rm -r --cached`)**:
   - Gỡ bỏ 584 file `.dll`, `.pdb`, `.cache`, `.json`, build scripts đang bị track từ các commit cũ trong 9 project (`BE/src/API`, `BE/src/Application`, `BE/src/Contract`, `BE/src/Domain`, `BE/src/Infrastructure`, `BE/src/Persistence`, `BE/src/Presentation`, `BE/test/Architecture.Tests`, `BE/test/UnitTests`).
   - Đưa toàn bộ các file này sang trạng thái `staged for deletion` trong Git index mà không làm mất file build trên máy lập trình viên.

---

## 3. Vị trí trọng yếu mà Tester nên soi kỹ
1. **Trạng thái Git status và Git untracked**:
   - Xác nhận bằng lệnh `git status`:
     - 584 file `bin/` và `obj/` nằm trong mục `Changes to be committed: deleted: ...`.
     - File `.gitignore` ở trạng thái staged/modified.
     - Mục `Untracked files:` hoàn toàn trống, không có bất kỳ file binary hay `dist/` nào bị Git nhận diện lại là untracked.
2. **Kết quả build và kiểm thử tự động**:
   - Backend: Lệnh `dotnet test BE/TemplateLandingPage.sln /p:AllowMissingPrunePackageData=true` phải pass toàn bộ 239/239 tests (232 UnitTests + 7 Architecture.Tests).
   - Frontend: Lệnh `npm run build` trong thư mục `FE/` phải hoàn thành thành công (Exit code 0, tạo `dist/` sạch sẽ).
3. **Tính toàn vẹn của mã nguồn**:
   - Không có bất kỳ file mã nguồn logic C# (`*.cs`), cấu hình dự án (`*.csproj`, `*.sln`), hay frontend code (`*.jsx`, `*.js`, `*.json`) nào bị sửa đổi ngoài file `.gitignore`.
