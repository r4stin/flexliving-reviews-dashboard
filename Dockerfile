# ------------ Base image ------------
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# ------------ Dependencies (dev) ------------
FROM base AS deps
RUN apk add --no-cache libc6-compat

# Copy only package manager files
COPY package.json pnpm-lock.yaml* ./

# Enable corepack and install deps (including devDeps for build)
RUN corepack enable && pnpm install --frozen-lockfile

# ------------ Build ------------
FROM base AS builder
WORKDIR /app

# Copy all project files
COPY . .

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Build Next.js app
RUN corepack enable && pnpm run build

# ------------ Runner ------------
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy only the necessary artifacts from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules


USER nextjs

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

# Next.js production start
CMD ["pnpm", "start"]
