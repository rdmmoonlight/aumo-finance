# ==========================================
# STAGE 1: Build Stage
# ==========================================
FROM node:24-alpine AS builder

# Set working directory
WORKDIR /app

# Aktifkan Corepack untuk mengelola pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package.json (dan pnpm-lock.yaml jika ada)
COPY package.json pnpm-lock.yaml* ./

# Buat .npmrc lokal untuk menyetujui build scripts di PNPM v10+ & install tanpa frozen lockfile
RUN echo 'onlyBuiltDependencies[]=@parcel/watcher' >> .npmrc && \
    echo 'onlyBuiltDependencies[]=esbuild' >> .npmrc && \
    echo 'onlyBuiltDependencies[]=lmdb' >> .npmrc && \
    echo 'onlyBuiltDependencies[]=msgpackr-extract' >> .npmrc && \
    pnpm install --no-frozen-lockfile

# Copy seluruh source code proyek
COPY . .

# Jalankan skrip build
RUN pnpm run build

# ==========================================
# STAGE 2: Production Stage (Nginx)
# ==========================================
FROM nginx:alpine AS runner

# Copy hasil build SPA dari stage builder ke direktori Nginx
COPY --from=builder /app/dist/client /usr/share/nginx/html

# Copy konfigurasi Nginx kustom untuk routing SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Jalankan Nginx di foreground
CMD ["nginx", "-g", "daemon off;"]
