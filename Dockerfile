# 1. Build Stage
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /app

# Copy solution và các file csproj để restore dependencies trước (tận dụng docker cache)
COPY BE/TemplateLandingPage.sln BE/
COPY BE/src/Domain/*.csproj BE/src/Domain/
COPY BE/src/Contract/*.csproj BE/src/Contract/
COPY BE/src/Application/*.csproj BE/src/Application/
COPY BE/src/Infrastructure/*.csproj BE/src/Infrastructure/
COPY BE/src/Persistence/*.csproj BE/src/Persistence/
COPY BE/src/Presentation/*.csproj BE/src/Presentation/
COPY BE/src/API/*.csproj BE/src/API/
COPY BE/test/Architecture.Tests/*.csproj BE/test/Architecture.Tests/
COPY BE/test/UnitTests/*.csproj BE/test/UnitTests/

RUN dotnet restore BE/TemplateLandingPage.sln

# Copy toàn bộ mã nguồn và build
COPY BE/ BE/
RUN dotnet publish BE/src/API/TemplateLandingPage.API.csproj -c Release -o /app/publish /p:UseAppHost=false

# 2. Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "TemplateLandingPage.API.dll"]