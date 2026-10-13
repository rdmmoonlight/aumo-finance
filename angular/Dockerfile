# ==========================================
# STAGE 1: Build Stage
# ==========================================
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm secara global
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copype package.json dan pnpm-lock.yaml untuk memanfaatkan caching layer Docker
COPY package.json pnpm-lock.yaml* ./

# Install seluruh dependency
RUN pnpm install --frozen-lockfile

# Copy seluruh source code proyek
COPY . .

# Jalankan skrip build
RUN pnpm run build

# ==========================================
# STAGE 2: Production Stage (Nginx)
# ==========================================
FROM nginx:alpine AS runner

# Copy hasil build dari stage builder ke direktori Nginx
# Catatan: Sesuaikan 'dist' dengan direktori output build Vite Anda (misal: dist atau dist/client)
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy konfigurasi Nginx kustom untuk mendukung Single Page Application (SPA) routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Jalankan Nginx di foreground
CMD ["nginx", "-g", "daemon off;"]
