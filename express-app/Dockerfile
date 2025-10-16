# Build stage (Node.js 22.x, Alpine)
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src ./src

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["node", "src/index.js"]
