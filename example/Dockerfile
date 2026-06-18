FROM node:24.12.0-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate
WORKDIR /app

ENV NODE_ENV=production

# Install dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build the app
FROM base AS builder
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN pnpm run build

# Production image
FROM base AS runner
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/scripts/entrypoint.sh ./entrypoint.sh
# Used in entrypoint base path injection for startup speed (~500x faster)
RUN apk add ripgrep

ENV PORT=3572
EXPOSE 3572

ENTRYPOINT ["/bin/sh", "./entrypoint.sh"]
