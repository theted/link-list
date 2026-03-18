# Stage 1: build frontend
FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json ./
RUN bun install

COPY . .

# VITE_* vars are baked into the frontend bundle at build time
ARG VITE_API_URL
ARG VITE_AUTH_ID
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AUTH_ID=$VITE_AUTH_ID

RUN bun run build

# Stage 2: production runtime
FROM oven/bun:1-slim AS runner
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/config.ts ./
COPY --from=builder /app/routes ./routes
COPY --from=builder /app/db ./db
COPY --from=builder /app/middleware ./middleware

EXPOSE 8080

CMD ["bun", "server.ts"]
