# Báo cáo kết quả kiểm thử (Test Results) - Chặng 3: Tester

## 1. Tổng quan kiểm thử
- **Mục tiêu kiểm thử**: Kiểm tra tính chính xác của cấu hình `.gitignore`, trạng thái Git cache index sau khi dọn dẹp các thư mục `bin/` và `obj/`, tính toàn vẹn của toàn bộ test suite Backend (.NET 10), và quy trình build Frontend (Vite/React).
- **Thời gian thực hiện**: 2026-09-20
- **Môi trường thực thi**: Windows (PowerShell) / .NET 10 SDK / Node v20+ / Vite v6.4.3
- **Kết quả chung**: **100% PASS** (Tất cả tiêu chí kiểm thử đều đạt yêu cầu).

---

## 2. Chi tiết các hạng mục kiểm tra

### Hạng mục 1: Trạng thái Git Index & Untracked Files
- **Lệnh thực thi**:
  ```powershell
  git diff --name-only --cached --diff-filter=D | Measure-Object -Line
  git diff --name-only --cached --diff-filter=d
  git status --porcelain | Select-String "^\?\?"
  ```
- **Kết quả quan sát**:
  - **Số file staged deletions**: **584 / 584 files** (toàn bộ file build output `bin/` và `obj/` của 9 project Backend đã được gỡ khỏi Git tracking bằng `git rm -r --cached`).
  - **File staged modifications**: Duy nhất [`.gitignore`](file:///e:/Code/TemplateLandingPage/.gitignore) được cập nhật các quy tắc bổ sung.
  - **Untracked files (`??`)**: **0 file** (không có bất kỳ file binary, file obj, hay build artifacts nào xuất hiện dưới dạng untracked).
  - **File vật lý trên ổ đĩa**: Toàn bộ các file nhị phân trong thư mục `bin/`, `obj/` của Backend và `dist/` của Frontend vẫn được giữ nguyên vẹn trên đĩa, không bị xóa nhầm.
- **Đánh giá**: **PASS**

---

### Hạng mục 2: Kiểm tra quy tắc `.gitignore` qua `git check-ignore`
- **Lệnh thực thi**:
  ```powershell
  git check-ignore -v --no-index `
    BE/src/API/bin/Debug/net10.0/TemplateLandingPage.API.dll `
    BE/src/API/obj/Debug/net10.0/TemplateLandingPage.API.dll `
    BE/src/Domain/bin/Debug/net10.0/TemplateLandingPage.Domain.dll `
    BE/src/Domain/obj/project.assets.json `
    BE/test/UnitTests/bin/Debug/net10.0/TemplateLandingPage.UnitTests.dll `
    BE/test/UnitTests/obj/project.assets.json `
    BE/src/Contract/bin/test.dll `
    BE/src/Infrastructure/bin/test.dll `
    BE/src/Persistence/bin/test.dll `
    BE/src/Presentation/bin/test.dll `
    BE/test/Architecture.Tests/bin/test.dll `
    FE/dist/index.html `
    FE/dist-ssr/index.html `
    FE/.env.local `
    .vs/test.suo
  ```
- **Kết quả mapping quy tắc**:
  - `.gitignore:32:**/bin/` khớp chính xác với tất cả đường dẫn `bin/` ở mọi cấp project.
  - `.gitignore:33:**/obj/` khớp chính xác với tất cả đường dẫn `obj/` ở mọi cấp project.
  - `FE/.gitignore:11:dist` và `.gitignore:291:dist/` khớp thư mục build `dist/`.
  - `FE/.gitignore:12:dist-ssr` và `.gitignore:293:dist-ssr/` khớp thư mục build `dist-ssr/`.
  - `FE/.gitignore:13:*.local` và `.gitignore:295:*.local` khớp file `.env.local`.
  - `.gitignore:40:**/.vs/` khớp các file cache Visual Studio.
- **Đánh giá**: **PASS**

---

### Hạng mục 3: Chạy toàn bộ Test Suite Backend (.NET)
- **Lệnh thực thi**:
  ```powershell
  dotnet test BE/TemplateLandingPage.sln /p:AllowMissingPrunePackageData=true
  ```
- **Kết quả thực thi**:
  - **TemplateLandingPage.UnitTests**:
    - Failed: 0
    - Passed: 232
    - Skipped: 0
    - Total: 232
    - Duration: ~1s
  - **TemplateLandingPage.Architecture.Tests**:
    - Failed: 0
    - Passed: 7
    - Skipped: 0
    - Total: 7
    - Duration: 314ms
  - **Tổng cộng**: **239 / 239 tests PASSED (100%)**
- **Đánh giá**: **PASS**

---

### Hạng mục 4: Kiểm tra build Frontend (Vite/React)
- **Lệnh thực thi**:
  ```powershell
  npm run build # (trong thư mục FE/)
  ```
- **Kết quả thực thi**:
  - `vite build` thực hiện thành công (Exit code 0).
  - 1696 modules transformed sạch sẽ.
  - Sinh bundle hoàn tất trong `FE/dist/`:
    - `dist/index.html` (0.51 kB)
    - `dist/assets/index-CaI28D5N.css` (51.34 kB)
    - `dist/assets/index-CHWgPh-5.js` (1,313.35 kB)
  - Sau khi build, chạy lại `git status --porcelain` xác nhận thư mục `FE/dist/` không bị nhận diện là untracked file (nhờ quy tắc ignore hoạt động chuẩn xác).
- **Đánh giá**: **PASS**

---

## 3. Kết luận
- Toàn bộ các yêu cầu trong kế hoạch [`.gemini/results/plan.md`](file:///e:/Code/TemplateLandingPage/PromtAI/.gemini/results/plan.md) và thay đổi tại [`.gemini/results/change.md`](file:///e:/Code/TemplateLandingPage/PromtAI/.gemini/results/change.md) đã được kiểm thử nghiêm ngặt và đạt 100% tiêu chí chấp thuận (acceptance criteria).
- Hệ thống sẵn sàng cho Chặng 4: Reviewer đánh giá.
