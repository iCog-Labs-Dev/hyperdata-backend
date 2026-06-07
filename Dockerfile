# ---------- Stage 1: Build ----------
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Strip dev dependencies so the resulting node_modules can be copied forward.
RUN npm prune --omit=dev


# ---------- Stage 2: Production ----------
FROM node:22-alpine AS production

ENV NODE_ENV=production
WORKDIR /usr/src/app

RUN apk add --no-cache wget

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["sh", "-c", "npm run migration:run:prod && node dist/main.js"]
