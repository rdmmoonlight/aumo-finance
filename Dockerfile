# ==========================================
# STAGE 1: Build .NET Core Backend
# ==========================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS dotnet-builder
WORKDIR /src

# FIX: Sesuaikan path ke folder asp-net-core yang berisi AumoBackend.csproj
COPY backend/asp-net-core/*.csproj ./backend/asp-net-core/
RUN dotnet restore ./backend/asp-net-core/AumoBackend.csproj

COPY backend/asp-net-core/ ./backend/asp-net-core/
RUN dotnet publish ./backend/asp-net-core/AumoBackend.csproj -c Release -o /app/dotnet-build

# ==========================================
# STAGE 2: Build Next.js Frontend
# ==========================================
FROM node:20-alpine AS next-builder
WORKDIR /app

# Enable pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy manifest pnpm
COPY frontend/package.json frontend/pnpm-lock.yaml* ./

# FIX: Tambahkan flag --unsafe-perm atau ignore-scripts jika diperlukan untuk mengatasi ERR_PNPM_IGNORED_BUILDS
RUN pnpm install --frozen-lockfile || pnpm install --config.ignore-scripts=false

COPY frontend/ ./
RUN pnpm run build

# ==========================================
# STAGE 3: Runtime Environment
# ==========================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runner

# Install Nginx, Node.js, dan Supervisor
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
