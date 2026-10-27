FROM node:20-alpine
WORKDIR /app

# Enable pnpm via Corepack
RUN corepack enable pnpm

# Copy manifes dependensi & install paket
COPY frontend/package.json ./
RUN pnpm config set ignore-scripts false && \
    pnpm install --config.onlyBuiltDependencies=unrs-resolver

# Copy seluruh source code frontend
COPY frontend .

# Set environment variable untuk Next.js
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build aplikasi Next.js
RUN pnpm run build

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Jalankan server
CMD ["pnpm", "start"]
