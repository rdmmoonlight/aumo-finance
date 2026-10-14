# ==========================================
# STAGE 1: Build Stage
# ==========================================
FROM node:24-alpine AS builder

WORKDIR /app

# Ambil VITE_API_URL dari Build Argument (Render Environment)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Aktifkan Corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy manifest
COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --no-frozen-lockfile --ignore-scripts

# Copy seluruh source code
COPY . .

# Build aplikasi (Vite akan membaca ENV VITE_API_URL di sini)
RUN pnpm run build

# ==========================================
# STAGE 2: Production Stage (Nginx)
# ==========================================
FROM nginx:alpine AS runner

COPY --from=builder /app/dist/client /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
