# ==========================================
# Stage 1: Build Stage
# ==========================================
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

RUN pnpm install --frozen-lockfile || pnpm install

COPY . .

# Pass VITE_ENV variables jika diperlukan saat build
RUN pnpm build

# ==========================================
# Stage 2: Production Stage (Nginx)
# ==========================================
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html

# Tambahkan proxy pass jika backend berbeda server/domain
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
