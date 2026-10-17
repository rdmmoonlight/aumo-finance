# 1. Stage Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080

# 2. Stage Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Install EF Core CLI Tool di stage build
RUN dotnet tool install --global dotnet-ef
ENV PATH="${PATH}:/root/.dotnet/tools"

# Copy csproj ke subfolder struktur yang sama agar path tetap konsisten
COPY ["asp-net-core/AumoBackend.csproj", "asp-net-core/"]
RUN dotnet restore "asp-net-core/AumoBackend.csproj"

# Copy seluruh source code monorepo
COPY . .

# Pindah ke subfolder proyek .NET
WORKDIR "/src/asp-net-core"

# Publish aplikasi .NET
RUN dotnet publish "AumoBackend.csproj" -c Release -o /app/publish /p:UseAppHost=false

# 3. Stage Migration Runner (Khusus untuk Update Database Manual)
FROM build AS migration-runner
WORKDIR "/src/asp-net-core"
ENTRYPOINT ["dotnet", "ef", "database", "update"]

# 4. Stage Final (App Production)
FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "AumoBackend.dll"]
