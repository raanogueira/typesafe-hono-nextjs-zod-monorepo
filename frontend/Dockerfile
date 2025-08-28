# Clean Next.js Standalone Dockerfile - Build-time Environment Variables
# Must be built from repository root: docker build -f frontend/Dockerfile .

# FROM must be FIRST for Render's env var translation to work
FROM node:24-alpine AS builder
WORKDIR /app

# Render automatically translates environment variables to build arguments
ARG NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy package files for dependencies
COPY package*.json ./
COPY frontend/apps/web/package*.json ./frontend/apps/web/
COPY backend/packages/api-client/package*.json ./backend/packages/api-client/

# Install dependencies
RUN npm install

# Copy source files
COPY frontend ./frontend
COPY backend ./backend
COPY turbo.json ./

# Build the backend dependency
RUN npm run build --workspace=@typesafe-stack/api-client

# Navigate to web app for building
WORKDIR /app/frontend/apps/web

# Build the Next.js application with embedded environment variables
RUN npm run build

# Production stage
FROM node:24-alpine AS runner
WORKDIR /app

# Create nextjs user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone output
COPY --from=builder /app/frontend/apps/web/.next/standalone ./

# Copy static files (required for standalone mode)
COPY --from=builder /app/frontend/apps/web/.next/static ./frontend/apps/web/.next/static

# Create public directory (since it doesn't exist in this project)
RUN mkdir -p ./frontend/apps/web/public

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to nextjs user
USER nextjs

# Production environment
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
EXPOSE 3000

# Simple startup - no entrypoint complexity
CMD ["node", "frontend/apps/web/server.js"]