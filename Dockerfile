# ─── Stage 1: Dependencies ───────────────────────────────────────────────────
FROM node:20-alpine AS deps

# Install libc compatibility for native modules (bcryptjs, etc.)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files and install production + dev deps
COPY package.json package-lock.json ./
RUN npm ci

# ─── Stage 2: Builder ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Bring in installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the source
COPY . .

# Set NODE_ENV to production for the build step.
# All NEXT_PUBLIC_ vars that are baked into the client bundle at build time
# must be provided here as build args (or set via CapRover environment variables
# before triggering a deploy).
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js application
RUN npm run build

# ─── Stage 3: Runner ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy only the files needed to run the server
COPY --from=builder /app/public         ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/package.json    ./package.json

# Copy the standalone output and static assets produced by next build
# NOTE: This requires output: 'standalone' in next.config.mjs (see below).
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static

USER nextjs

# CapRover will route external HTTPS to port 3000 inside the container
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the server produced by the standalone build
CMD ["node", "server.js"]
