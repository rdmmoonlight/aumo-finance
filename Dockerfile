# ==========================================
# STAGE 1: Build ASP.NET Core Backend
# ==========================================
FROM mcr.microsoft.com/dotnet/sdk:10.0.100-preview.1-noble AS dotnet-builder
WORKDIR /src

# Copy project file dan restore dependensi
COPY backend/asp-net-core/*.csproj ./backend/asp-net-core/
RUN dotnet restore ./backend/asp-net-core/AumoBackend.csproj

# Copy seluruh source code backend & publish
COPY backend/asp-net-core/ ./backend/asp-net-core/
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

# Environment variables untuk Client-Side Build
ARG PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC__GOOGLE_CLIENT_ID
ENV PUBLIC_GOOGLE_CLIENT_ID=${PUBLIC_GOOGLE_CLIENT_ID:-$NEXT_PUBLIC__GOOGLE_CLIENT_ID}

RUN pnpm run build

# ==========================================
# STAGE 3: Runtime Environment
# ==========================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0.100-preview.1-noble AS runner

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
