# ==========================================
# STAGE 1: Build .NET Core Backend
# ==========================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS dotnet-builder
WORKDIR /src
COPY backend/*.csproj ./backend/
RUN dotnet restore ./backend/*.csproj
COPY backend/ ./backend/
RUN dotnet publish ./backend/*.csproj -c Release -o /app/dotnet-build

# ==========================================
# STAGE 2: Build Next.js Frontend (pnpm)
# ==========================================
FROM node:20-alpine AS next-builder
WORKDIR /app

# Enable pnpm via Corepack
RUN corepack enable pnpm

# Copy manifes dependensi
COPY frontend/package.json frontend/pnpm-lock.yaml* ./

# Set environment variable agar pnpm tidak memblokir build scripts
ENV PNPM_ALLOW_BUILDS=all

# Install dependensi dengan pnpm
RUN pnpm install || (pnpm approve-builds --all && pnpm install)

# Copy seluruh source code frontend
COPY frontend/ ./

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build aplikasi Next.js (pastikan output: 'standalone' di next.config.js)
RUN pnpm run build

# ==========================================
# STAGE 3: Runtime Environment
# ==========================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runner

# Install Nginx, Node.js, dan Supervisor di Debian runtime
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

# Copy hasil build Next.js Standalone & Assets
COPY --from=next-builder /app/.next/standalone ./frontend
COPY --from=next-builder /app/.next/static ./frontend/.next/static
COPY --from=next-builder /app/public ./frontend/public

# Copy konfigurasi Supervisor & Nginx
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 10000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]