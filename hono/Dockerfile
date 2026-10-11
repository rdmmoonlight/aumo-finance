# Base stage
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Build stage
FROM base AS builder
WORKDIR /app

# Copy manifest & install dependensi
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copy seluruh source code & build proyek (tsup / esbuild)
COPY . .
RUN pnpm run build

# Prune node_modules untuk hanya menyisakan prod dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm prune --prod

# Production stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Jalankan app sebagai non-root user demi keamanan
USER node

# Copy hasil build dan node_modules yang sudah di-prune
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["node", "dist/index.js"]

