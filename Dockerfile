# ==========================================
# STAGE 1: Build C++ Archiver Service
# ==========================================
FROM ubuntu:26.04 AS cpp-builder
WORKDIR /src

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    g++ \
    pkg-config \
    libpq-dev \
    libpqxx-dev \
    && rm -rf /var/lib/apt/lists/*

COPY CMakeLists.txt ./
COPY archiver-service/ ./archiver-service/

RUN cmake -S . -B build -DCMAKE_BUILD_TYPE=Release \
    && cmake --build build --config Release -j$(nproc)

# ==========================================
# STAGE 2: Build ASP.NET Core Backend
# ==========================================
FROM mcr.microsoft.com/dotnet/sdk:10.0-noble AS dotnet-builder
WORKDIR /src

COPY backend/AumoBackend/*.csproj ./backend/AumoBackend/
RUN dotnet restore ./backend/AumoBackend/AumoBackend.csproj

COPY backend/AumoBackend/ ./backend/AumoBackend/
RUN dotnet publish ./backend/AumoBackend/AumoBackend.csproj -c Release -o /app/dotnet-build --no-restore

# ==========================================
# STAGE 3: Build Frontend (SPA)
# ==========================================
FROM node:22-alpine AS frontend-builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY vuejs-tauri/package.json vuejs-tauri/pnpm-lock.yaml* vuejs-tauri/pnpm-workspace.yaml* ./

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY vuejs-tauri/ ./

ARG PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC__GOOGLE_CLIENT_ID
ENV PUBLIC_GOOGLE_CLIENT_ID=${PUBLIC_GOOGLE_CLIENT_ID:-$NEXT_PUBLIC__GOOGLE_CLIENT_ID}

RUN pnpm run build:web

# ==========================================
# STAGE 4: Runtime Environment (Ubuntu 26.04)
# ==========================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0-noble AS dotnet-runtime

FROM ubuntu:26.04 AS runner

ENV DEBIAN_FRONTEND=noninteractive \
    DOTNET_ROOT=/usr/share/dotnet \
    PATH="$PATH:/usr/share/dotnet" \
    ASPNETCORE_URLS=http://+:5000

# Instal dependensi runtime C++ (libpqxx-7.10), .NET (libicu, libssl), Nginx & Supervisor
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    supervisor \
    curl \
    ca-certificates \
    libicu-dev \
    libssl3t64 \
    libpq5 \
    libpqxx-7.10 \
    && rm -rf /var/lib/apt/lists/* \
    && ldconfig

# Salin ASP.NET Core 10 Runtime dari stage dotnet-runtime
COPY --from=dotnet-runtime /usr/share/dotnet /usr/share/dotnet

WORKDIR /app

# Copy hasil build C++ Archiver
COPY --from=cpp-builder /src/build/archiver-service /usr/local/bin/archiver-service
RUN chmod +x /usr/local/bin/archiver-service

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
