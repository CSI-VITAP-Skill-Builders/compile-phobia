# Backend Dockerfile - Node.js Express API
FROM node:21-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application code
COPY server.js ./
COPY githubAnalytics.js ./

# Create .env file from environment variables (will be provided at runtime)
ENV NODE_ENV=production
ENV GITHUB_TOKEN=""
ENV PORT=5000

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/rate-limit', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "server.js"]
