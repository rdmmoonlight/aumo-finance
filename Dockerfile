# ==========================================
# STAGE 1: Build .NET Core & Rust FFI Backend
# ==========================================
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS dotnet-builder
WORKDIR /src

# Install Rust & Cargo untuk mengompilasi Axum/C-Shared Library
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
    && rm -rf /var/lib/apt/lists/*

ENV PATH="/root/.cargo/bin:${PATH}"

COPY backend/asp-net-core/*.csproj ./backend/asp-net-core/
COPY backend/axum/ ./backend/axum/

RUN dotnet restore ./backend/asp-net-core/AumoBackend.csproj

COPY backend/asp-net-core/ ./backend/asp-net-core/
RUN dotnet publish ./backend/asp-net-core/AumoBackend.csproj -c Release -o /app/dotnet-build

# ==========================================
# STAGE 2: Build Next.js Frontend
# ==========================================
FROM node:20-alpine AS next-builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy manifest dan workspace config yang sudah ada di repo
COPY frontend/package.json frontend/pnpm-workspace.yaml ./

# Install dependensi (pnpm v10 otomatis membaca pnpm-workspace.yaml)
RUN pnpm install

COPY frontend/ ./
RUN pnpm run build

# ==========================================
# STAGE 3: Runtime Environment
# ==========================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS runner

RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy hasil build .NET
COPY --from=dotnet-builder /app/dotnet-build ./backend

# Copy hasil build Next.js Standalone & Static assets
COPY --from=next-builder /app/.next/standalone ./frontend
COPY --from=next-builder /app/.next/static ./frontend/.next/static
COPY --from=next-builder /app/public ./frontend/public

# Copy konfigurasi Supervisor & Nginx
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 10000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
