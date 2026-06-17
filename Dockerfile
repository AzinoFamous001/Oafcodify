# Build stage for frontend
FROM node:22-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build frontend
RUN npm run build

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy built frontend from builder
COPY --from=frontend-builder /app/dist ./dist

# Copy server files
COPY Server ./Server
COPY api ./api

# Copy environment file template
COPY .env.example .env.example

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
ENV PORT=5000
EXPOSE 5000

# Start the server
CMD ["node", "Server/server.js"]
