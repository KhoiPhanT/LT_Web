# ==============================================================================
# Multi-stage Standalone Dockerfile for Next.js 14
# Tối ưu hóa dung lượng image từ ~1.2GB xuống còn ~120MB nhờ Dependency Tracing
# ==============================================================================

# STAGE 1: Cài đặt dependencies với lockfile
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# STAGE 2: Build source code & tạo standalone bundle
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# STAGE 3: Production Runner siêu nhẹ (Minimal Alpine)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Bảo mật non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Tận dụng Dependency Tracing: Chỉ copy standalone server, static assets và public assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
