# 1. Stage Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080

# 2. Stage Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Tambahkan mkdir -p /usr/share/man/man1 sebelum apt-get install
RUN mkdir -p /usr/share/man/man1 && \
    apt-get update && apt-get install -y curl build-essential && \
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Rust & Cargo (diperlukan untuk build target di AumoBackend.csproj)
RUN apt-get update && apt-get install -y curl build-essential && \
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
ENV PATH="/root/.cargo/bin:${PATH}"

# Install EF Core CLI Tool di stage build
RUN dotnet tool install --global dotnet-ef
ENV PATH="${PATH}:/root/.dotnet/tools"

# Copy csproj ke subfolder struktur yang sama agar path tetap konsisten
COPY ["asp-net-core/AumoBackend.csproj", "asp-net-core/"]
RUN dotnet restore "asp-net-core/AumoBackend.csproj"

# Copy seluruh source code monorepo (termasuk folder axum)
COPY . .

# Pindah ke subfolder proyek .NET
WORKDIR "/src/asp-net-core"

# Publish aplikasi .NET (akan berhasil memanggil cargo build)
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
