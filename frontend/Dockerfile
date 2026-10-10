# ==========================================
# Stage 1: Build Stage
# ==========================================
FROM node:22-alpine AS builder

# Aktifkan Corepack & pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy manifest dependensi
COPY package.json pnpm-lock.yaml* ./

# Izinkan build script untuk dependensi yang dikonfigurasi di package.json
RUN pnpm config set side-effects-cache false && \
    pnpm install --frozen-lockfile --ignore-scripts=false || \
    pnpm install --ignore-scripts=false

# Copy seluruh source code project
COPY . .

# Build project
RUN pnpm build

# ==========================================
# Stage 2: Production Stage (Nginx)
# ==========================================
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

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