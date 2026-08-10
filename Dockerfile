# Production Dockerfile for Fly.io Backend Deployment
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy server code and configuration
COPY server ./server
COPY tsconfig.json ./

# Expose default port
EXPOSE 5000

# Default environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start Express server via tsx
CMD ["npx", "tsx", "server/index.ts"]
