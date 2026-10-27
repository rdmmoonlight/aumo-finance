FROM node:20-alpine
WORKDIR /app

# Enable pnpm via Corepack
RUN corepack enable pnpm

# Copy manifes dependensi
COPY frontend/package.json ./

# Set environment variable agar pnpm tidak memblokir build scripts (pnpm v12+)
ENV PNPM_ALLOW_BUILDS=all

# Install dependensi dan jalankan approve-builds otomatis jika diperlukan
RUN pnpm install || (pnpm approve-builds --all && pnpm install)

# Copy seluruh source code frontend
COPY frontend .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build aplikasi Next.js
RUN pnpm run build

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["pnpm", "start"]
