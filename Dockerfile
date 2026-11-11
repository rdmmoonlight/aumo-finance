# ==========================================
# STAGE 1: Build C++ Archiver Service
# ==========================================
FROM ubuntu:24.04 AS cpp-builder
WORKDIR /src

# Disable interactive prompt & install paket esensial saja
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    g++ \
    pkg-config \
    libpq-dev \
    libpqxx-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy hanya file build C++ agar layer cache optimal
COPY CMakeLists.txt ./
COPY archiver-service/ ./archiver-service/

# Build spesifik target Release (Parallel job -j$(nproc))
RUN cmake -S . -B build -DCMAKE_BUILD_TYPE=Release \
    && cmake --build build --config Release -j$(nproc)

# ==========================================
# STAGE 2: Build ASP.NET Core Backend
# ==========================================
FROM mcr.microsoft.com/dotnet/sdk:10.0-noble AS dotnet-builder
WORKDIR /src

# Copy csproj & restore dependensi (Cache Layer)
COPY backend/asp-net-core/*.csproj ./backend/asp-net-core/
RUN dotnet restore ./backend/asp-net-core/AumoBackend.csproj

# Copy source code backend & publish
COPY backend/asp-net-core/ ./backend/asp-net-core/
RUN dotnet publish ./backend/asp-net-core/AumoBackend.csproj -c Release -o /app/dotnet-build --no-restore

# ==========================================
# STAGE 3: Build Frontend (SPA)
# ==========================================
# Gunakan Node LTS (22/20) untuk stabilitas Corepack & Native Modules
FROM node:22-alpine AS frontend-builder
WORKDIR /app

# Enable Corepack & pastikan pnpm terpasang dengan cepat
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy manifest dependensi
COPY frontend/package.json frontend/pnpm-lock.yaml* frontend/pnpm-workspace.yaml* ./

# Install dependensi dengan cache mount agar build super cepat
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Copy seluruh source code frontend
COPY frontend/ ./

ARG PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC__GOOGLE_CLIENT_ID
ENV PUBLIC_GOOGLE_CLIENT_ID=${PUBLIC_GOOGLE_CLIENT_ID:-$NEXT_PUBLIC__GOOGLE_CLIENT_ID}

RUN pnpm run build

# ==========================================
# STAGE 4: Runtime Environment
# ==========================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0-noble AS runner

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    supervisor \
    curl \
    libpq5 \
    libpqxx-7.8t64 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy hasil build C++ Archiver
COPY --from=cpp-builder /src/build/archiver-service /usr/local/bin/archiver-service

# Copy hasil build .NET Core API & VueJS Frontend
COPY --from=dotnet-builder /app/dotnet-build ./backend
COPY --from=frontend-builder /app/dist ./frontend-dist

# Bersihkan config default Nginx (port 80)
RUN rm -rf /etc/nginx/sites-enabled/* /etc/nginx/sites-available/* /etc/nginx/conf.d/*

# Copy config Supervisor & Custom Nginx (port 10000)
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 10000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
