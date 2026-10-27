# 1. Base stage untuk menginstal dependensi
FROM node:20-alpine AS deps
WORKDIR /app

# Mengaktifkan pnpm via Corepack
RUN corepack enable pnpm

# Salin file manifes dependensi dari folder frontend
COPY frontend/package.json frontend/pnpm-lock.yaml* frontend/package-lock.json* ./

# Install dependensi (dengan konfigurasi mengizinkan build scripts pnpm)
RUN \
  if [ -f pnpm-lock.yaml ]; then pnpm config set ignore-scripts false && pnpm i --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  else npm install; \
  fi

# 2. Stage untuk melakukan build aplikasi Next.js
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable pnpm

COPY --from=deps /app/node_modules ./node_modules
COPY frontend .

# Nonaktifkan telemetri Next.js saat build
ENV NEXT_TELEMETRY_DISABLED=1

RUN \
  if [ -f pnpm-lock.yaml ]; then pnpm run build; \
  else npm run build; \
  fi

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
