# Sửa build Render — 08/11/2026

## Nguyên nhân

Solution đã có `BE/test/IntegrationTests/TemplateLandingPage.IntegrationTests.csproj`, nhưng Dockerfile chỉ copy hai project kiểm thử cũ trước khi `dotnet restore` toàn solution. Vì project tích hợp chưa có trong layer đó, restore dừng với MSB3202.

## Thay đổi

- Dockerfile restore trực tiếp `BE/src/API/TemplateLandingPage.API.csproj` cùng 6 dependency; build triển khai không còn phụ thuộc danh sách test project trong solution.
- Giữ cache layer cho các csproj; copy `BE/src` và `BE/assets` rồi publish Release với `--no-restore`.
- SDK/runtime dùng image chính thức `10.0`, thay `10.0-preview`. Tham khảo [image ASP.NET Core chính thức](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/docker/building-net-docker-images?view=aspnetcore-10.0).
- Thêm `.dockerignore` bỏ bin/obj, FE, dữ liệu kiểm thử, cấu hình development và file môi trường khỏi build context. Font và ảnh Quoting vẫn được giữ.

## Kiểm chứng

- Dựng thư mục sạch theo đúng thứ tự COPY: restore chỉ với 7 csproj, không có solution/test/source, đạt.
- Sau đó copy source/assets, publish Release `--no-restore`, đạt.
- Kiểm tra đầu ra: 11 ảnh static, 11 ảnh PDF nhúng, font Noto Sans tiếng Việt; không có appsettings.Development.json.
- Chạy API đã publish ở Production với cấu hình kiểm thử tách biệt: request chưa xác thực trả 401, ảnh sản phẩm trả 200. Không dùng database thật.
- `git diff --check` đạt.
- Đã dừng API dùng để kiểm tra.

Bằng chứng: [verification.json](verification.json), `restore.log`, `publish.log`, `runtime-smoke.log`.

Docker Engine local không khả dụng, do đó chưa chạy được `docker build`/image Linux hoặc deploy Render. Các bước restore/publish/khởi động ở trên được chạy trên SDK .NET 10.0.203 local.

## Triển khai

Đưa `Dockerfile` và `.dockerignore` lên nhánh Render đang theo dõi rồi Redeploy. Giữ build context ở root repo (`.`), Dockerfile `./Dockerfile`; giữ nguyên các biến môi trường của service. Render dùng Dockerfile và build context của repo theo [tài liệu Docker trên Render](https://render.com/docs/docker).
