# ==========================================
# Stage 1: Build Phase
# ==========================================
FROM node:26-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm v12 secara global via npm (termasuk allow scripts untuk pnpm)
RUN npm install -g --allow-scripts=pnpm pnpm@12

# Copy package.json saja (tanpa lockfile)
COPY package.json ./

# Install dependencies tanpa lockfile dan abaikan build scripts
RUN pnpm install --no-frozen-lockfile --ignore-scripts

# Copy seluruh source code project
COPY . .

# Variabel Vite ditanam saat build (prefix VITE_)
ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Build aplikasi Vue
RUN pnpm build

# ==========================================
# Stage 2: Production Phase (Node.js + serve)
# ==========================================
FROM node:26-alpine AS production

WORKDIR /app

# Install package 'serve' untuk melayani static files & client-side routing
RUN npm install -g serve

# Copy hasil build dari stage builder
COPY --from=builder /app/dist ./dist

# Render otomatis menginjeksikan PORT (default 10000), tapi fallback ke 8080 jika lokal
ENV PORT=8080
EXPOSE ${PORT}

# Jalankan 'serve' dengan opsi -s (SPA fallback ke index.html)
CMD ["sh", "-c", "serve -s dist -l $PORT"]
