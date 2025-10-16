# Build stage (Node.js 22.x, Alpine)
FROM node:22-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (latest for Node 22.x)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage (Alpine)
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
