# ==========================================
# STAGE 1: Build .NET Core & Rust FFI Backend
# ==========================================
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS dotnet-builder
WORKDIR /src

# Install dependensi dasar untuk kompilasi Rust
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
    && rm -rf /var/lib/apt/lists/*

ENV PATH="/root/.cargo/bin:${PATH}"

# Copy source code backend & rust
COPY backend/asp-net-core/*.csproj ./backend/asp-net-core/
COPY backend/rust/ ./backend/rust/

RUN dotnet restore ./backend/asp-net-core/AumoBackend.csproj

COPY backend/asp-net-core/ ./backend/asp-net-core/

# Opsional: Jika Rust perlu di-build manual sebelum .NET, jalankan di sini:
# RUN cd backend/rust && cargo build --release

RUN dotnet publish ./backend/asp-net-core/AumoBackend.csproj -c Release -o /app/dotnet-build

# ==========================================
# STAGE 2: Build Rsbuild + TanStack Router Frontend (SPA)
# ==========================================
FROM node:24-alpine AS frontend-builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY frontend/package.json frontend/pnpm-lock.yaml* ./

# Izinkan eksekusi script native unrs-resolver untuk pnpm v10
RUN pnpm install --frozen-lockfile --allow-build=unrs-resolver

COPY frontend/ ./

# Environmental variables untuk Client-Side Build
ARG PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC__GOOGLE_CLIENT_ID
ENV PUBLIC_GOOGLE_CLIENT_ID=${PUBLIC_GOOGLE_CLIENT_ID:-$NEXT_PUBLIC__GOOGLE_CLIENT_ID}

RUN pnpm run build

# ==========================================
# STAGE 3: Runtime Environment
# ==========================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS runner

RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy hasil build .NET Core API
COPY --from=dotnet-builder /app/dotnet-build ./backend

# Copy hasil build Rsbuild SPA (folder dist)
COPY --from=frontend-builder /app/dist ./frontend-dist

# Copy konfigurasi Supervisor & Nginx
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 10000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]