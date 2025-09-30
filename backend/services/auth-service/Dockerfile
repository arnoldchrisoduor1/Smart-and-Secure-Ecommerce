# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app/services/auth-service

# Copy only this service's package files
COPY services/auth-service/package*.json ./

# Install ALL dependencies (dev + prod, needed for building)
RUN npm ci

# Copy the service source code
COPY services/auth-service/ ./

# Build the NestJS application
RUN npm run build


# ============================================
# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copy root package files
COPY services/auth-service/package*.json ./
COPY . .

# Install ONLY production dependencies for the auth-service
RUN npm ci

# Copy compiled code from builder stage
COPY --from=builder /app/services/auth-service/dist ./dist

# Expose the service port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["node", "dist/main"]