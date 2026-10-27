# 1. Base stage untuk menginstal dependensi
FROM node:20-alpine AS deps
WORKDIR /app

# Mengaktifkan pnpm via Corepack
RUN corepack enable pnpm

# Cuma menyalin package.json tanpa lockfile
COPY frontend/package.json ./

# Install dependensi dari awal dan izinkan build script paket native (unrs-resolver)
RUN pnpm config set ignore-scripts false && \
    pnpm install --config.onlyBuiltDependencies=unrs-resolver

# 2. Stage untuk melakukan build aplikasi Next.js
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable pnpm

COPY --from=deps /app/node_modules ./node_modules
COPY frontend .

# Nonaktifkan telemetri Next.js saat build
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm run build

# 3. Stage untuk runner / production deployment
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Buat user non-root demi keamanan
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Salin aset publik dan hasil build standalone Next.js
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
