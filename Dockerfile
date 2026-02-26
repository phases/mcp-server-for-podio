# Podio MCP Server - multi-stage build
# Node version: v24.3.0 (matches local)
FROM node:24.3.0-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY data ./data
RUN npm run build

# Runtime stage
FROM node:24.3.0-alpine

WORKDIR /app

COPY --from=builder /app/package.json /app/package-lock.json* ./

# Production deps only (install as root before switching user)
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data
COPY index.html ./

# Non-root user
RUN addgroup -g 1001 -S app && adduser -u 1001 -S app -G app \
    && chown -R app:app /app
USER app

ENV NODE_ENV=production
ENV PORT=3016
EXPOSE 3016

CMD ["node", "dist/index.js"]
