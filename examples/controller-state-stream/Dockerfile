FROM node:24.12.0-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# Install dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build the app
FROM base AS builder
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN pnpm run build 

# Production image, copy all the files and run next
FROM base AS runner
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/scripts/entrypoint.sh ./entrypoint.sh
# Used in entrypoint base path injection for startup speed (~500x faster)
RUN apk add ripgrep

EXPOSE 3000

ENTRYPOINT ["/bin/sh", "./entrypoint.sh"]