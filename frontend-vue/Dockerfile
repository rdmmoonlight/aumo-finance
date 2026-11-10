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

# Build aplikasi Vue
RUN pnpm build

# ==========================================
# Stage 2: Production Phase
# ==========================================
FROM nginx:alpine AS production

# Copy hasil build dari stage builder ke folder web server Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Jalankan Nginx
CMD ["nginx", "-g", "daemon off;"]
