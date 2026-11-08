# 1. Build Stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Restore API và các project được tham chiếu, không phụ thuộc project kiểm thử trong solution.
COPY BE/src/Domain/*.csproj BE/src/Domain/
COPY BE/src/Contract/*.csproj BE/src/Contract/
COPY BE/src/Application/*.csproj BE/src/Application/
COPY BE/src/Infrastructure/*.csproj BE/src/Infrastructure/
COPY BE/src/Persistence/*.csproj BE/src/Persistence/
COPY BE/src/Presentation/*.csproj BE/src/Presentation/
COPY BE/src/API/*.csproj BE/src/API/
RUN dotnet restore BE/src/API/TemplateLandingPage.API.csproj

# Copy toàn bộ mã nguồn và build
COPY BE/src/ BE/src/
COPY BE/assets/ BE/assets/
RUN dotnet publish BE/src/API/TemplateLandingPage.API.csproj -c Release --no-restore -o /app/publish /p:UseAppHost=false

# 2. Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "TemplateLandingPage.API.dll"]
