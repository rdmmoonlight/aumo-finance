FROM node:20-alpine
WORKDIR /app

# Enable pnpm via Corepack
RUN corepack enable pnpm

# Copy manifes dependensi
COPY frontend/package.json ./

# Matikan pengecekan ignore-scripts & izinkan build secara universal
RUN pnpm config set ignore-scripts false && \
    pnpm install --unsafe-perm

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
