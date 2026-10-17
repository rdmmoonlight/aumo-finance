# 1. Stage Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080

# 2. Stage Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Buat direktori man1 untuk menghindari warning update-alternatives & install Rust + C-compiler
RUN mkdir -p /usr/share/man/man1 && \
    apt-get update && apt-get install -y curl build-essential && \
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
ENV PATH="/root/.cargo/bin:${PATH}"

# Install EF Core CLI Tool
RUN dotnet tool install --global dotnet-ef
ENV PATH="${PATH}:/root/.dotnet/tools"

# Copy csproj dan restore
COPY ["asp-net-core/AumoBackend.csproj", "asp-net-core/"]
RUN dotnet restore "asp-net-core/AumoBackend.csproj"

# Copy seluruh source code monorepo
COPY . .

# Pindah ke subfolder proyek .NET
WORKDIR "/src/asp-net-core"

# Build & Publish .NET (secara otomatis mengeksekusi cargo build via target .csproj)
RUN dotnet publish "AumoBackend.csproj" -c Release -o /app/publish /p:UseAppHost=false

# 3. Stage Migration Runner
FROM build AS migration-runner
WORKDIR "/src/asp-net-core"
ENTRYPOINT ["dotnet", "ef", "database", "update"]

# 4. Stage Final (App Production)
FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .

# Catatan: Pastikan AumoBackend.csproj memiliki target COPY/Publish yang memasukkan binary 
# hasil kompilasi Rust (misal: axum_service / axum_service.exe) ke output publish /app.

ENTRYPOINT ["dotnet", "AumoBackend.dll"]
