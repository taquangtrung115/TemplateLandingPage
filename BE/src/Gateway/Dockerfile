FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY BE/src/Gateway/ BE/src/Gateway/
RUN dotnet publish BE/src/Gateway/OnePortal.Gateway.csproj -c Release -o /app
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "OnePortal.Gateway.dll"]
