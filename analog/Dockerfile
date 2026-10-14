# ==========================================
# STAGE 1: Build Stage
# ==========================================
FROM node:24-alpine AS builder

WORKDIR /app

# Aktifkan Corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy manifest
COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --no-frozen-lockfile

# Copy seluruh source code
COPY . .

# Build aplikasi
RUN pnpm run build

# ==========================================
# STAGE 2: Production Stage (Nginx)
# ==========================================
FROM nginx:alpine AS runner

COPY --from=builder /app/dist/client /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
