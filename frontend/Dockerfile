# ==========================================
# Stage 1: Build Stage
# ==========================================
FROM node:22-alpine AS builder

# Aktifkan Corepack untuk mengaktifkan pnpm bawaan Node.js
RUN corepack enable && corepack prepare pnpm@latest --activate

# Tentukan folder kerja di dalam container
WORKDIR /app

# Copy manifest dependensi terlebih dahulu untuk optimasi Docker layer caching
COPY package.json pnpm-lock.yaml* ./

# Install seluruh dependensi
RUN pnpm install --frozen-lockfile || pnpm install

# Copy seluruh source code project ke dalam container
COPY . .

# Jalankan build script ("tsc --noEmit && vite build")
RUN pnpm build

# ==========================================
# Stage 2: Production Stage (Nginx)
# ==========================================
FROM nginx:alpine AS runner

# Copy hasil build dari stage builder (folder /app/dist) ke folder static Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Atur konfigurasi routing Nginx agar SPA (Vite React) dapat di-refresh tanpa error 404
RUN echo 'server { \
    listen 80; \
    location / { \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    try_files $uri $uri/ /index.html; \
    } \
    }' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]