# ==========================================
# STAGE 1: Build .NET Core Backend
# ==========================================
# Menggunakan SDK .NET 10.0 agar sesuai dengan AumoBackend.csproj
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS dotnet-builder
WORKDIR /src

COPY backend/asp-net-core/*.csproj ./backend/asp-net-core/
RUN dotnet restore ./backend/asp-net-core/AumoBackend.csproj

COPY backend/asp-net-core/ ./backend/asp-net-core/
RUN dotnet publish ./backend/asp-net-core/AumoBackend.csproj -c Release -o /app/dotnet-build

# ==========================================
# STAGE 2: Build Next.js Frontend
# ==========================================
FROM node:20-alpine AS next-builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY frontend/package.json frontend/pnpm-lock.yaml* ./

# Izinkan pnpm menjalankan build scripts tanpa memicu ERR_PNPM_IGNORED_BUILDS
RUN pnpm config set ignore-scripts false && pnpm install --frozen-lockfile

COPY frontend/ ./
RUN pnpm run build

# ==========================================
# STAGE 3: Runtime Environment
# ==========================================
# Gunakan ASP.NET 10.0 Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS runner

RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=dotnet-builder /app/dotnet-build ./backend
COPY --from=next-builder /app/.next/standalone ./frontend
COPY --from=next-builder /app/.next/static ./frontend/.next/static
COPY --from=next-builder /app/public ./frontend/public

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 10000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
