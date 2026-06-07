# syntax=docker/dockerfile:1.7

# ---------- Stage 1: Dependencies ----------
FROM node:22-alpine AS deps
WORKDIR /usr/src/app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# ---------- Stage 2: Build ----------
FROM node:22-alpine AS builder
WORKDIR /usr/src/app

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY package*.json tsconfig*.json nest-cli.json ./
COPY src ./src

RUN npm run build

# Drop dev deps so the resulting node_modules can be copied forward.
RUN npm prune --omit=dev

# ---------- Stage 3: Runtime ----------
FROM node:22-alpine AS production

LABEL org.opencontainers.image.title="hyperdata-backend" \
      org.opencontainers.image.licenses="UNLICENSED"

ENV NODE_ENV=production \
    PORT=3000 \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NPM_CONFIG_FUND=false

# tini gives us a real PID 1 so SIGTERM reaches node and graceful shutdown works.
RUN apk add --no-cache tini

WORKDIR /usr/src/app

COPY --from=builder --chown=node:node /usr/src/app/package*.json ./
COPY --from=builder --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=node:node /usr/src/app/dist ./dist

USER node

EXPOSE 3000

# BusyBox wget ships with alpine; -qO- is enough for a liveness probe.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["sh", "-c", "npm run migration:run:prod && exec node dist/main.js"]
