# ---------- Stage 1: Build ----------
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Copy package files first (better caching)
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build


# ---------- Stage 2: Production ----------
FROM node:22-alpine AS production

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built application only; runtime config is injected by the deployment.
COPY --from=builder /usr/src/app/dist ./dist

# Expose port
EXPOSE 3000

# Start the app
CMD ["sh", "-c", "sleep 4 && npm run migration:run:prod && node dist/main.js"]
