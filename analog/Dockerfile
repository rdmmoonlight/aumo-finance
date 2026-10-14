# ==========================================
# STAGE 1: Build Stage
# ==========================================
FROM node:24-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* ./

# Buat pnpm-workspace.yaml khusus untuk daftar allowed build scripts
RUN printf 'onlyBuiltDependencies:\n  - "@parcel/watcher"\n  - "esbuild"\n  - "lmdb"\n  - "msgpackr-extract"\n' > pnpm-workspace.yaml

RUN pnpm install --no-frozen-lockfile

COPY . .

RUN pnpm run build

# ==========================================
# STAGE 2: Production Stage (Nginx)
# ==========================================
FROM nginx:alpine AS runner

COPY --from=builder /app/dist/client /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
