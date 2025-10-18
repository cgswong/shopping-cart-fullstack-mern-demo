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

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Copy built assets from build stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration template
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Expose port 80
EXPOSE 80

# Start nginx (nginx will automatically process templates with envsubst)
CMD ["nginx", "-g", "daemon off;"]
