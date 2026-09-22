# 1. Stage Runtime (ASP.NET 10 Runtime)
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

# 2. Stage Build (SDK .NET 10)
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy kedua file .csproj
COPY ["blazor-legacy/AumoBlazor.csproj", "blazor-legacy/"]
COPY ["backend/AumoBackend.csproj", "backend/"]

# Restore proyek utama (otomatis me-restore dependensinya jika Project Reference sudah benar)
RUN dotnet restore "blazor-legacy/AumoBlazor.csproj"

# Copy seluruh source code
COPY . .

# Build & Publish
WORKDIR "/src/blazor-legacy"
RUN dotnet publish "AumoBlazor.csproj" -c Release -o /app/publish /p:UseAppHost=false

# 3. Stage Final
FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "AumoBlazor.dll"]
