# Shopping Cart Microservices Application

A scalable, fault-tolerant shopping cart application built with React, Express, MongoDB, and deployed on AWS ECS.

## Architecture

### Application Structure
- **Backend** (Port 3000) - Modular Express app with organized routes
  - Auth routes (`/api/auth`) - JWT-based authentication
  - Product routes (`/api/products`) - Product catalog management
  - Cart routes (`/api/cart`) - Shopping cart operations
  - Order routes (`/api/orders`) - Order processing
  - Shared models and middleware
- **Frontend** (Port 80) - React SPA with Nginx

### Technology Stack
- **Frontend**: React 19 + Vite 6
- **Backend**: Node.js 22 + Express
- **Database**: MongoDB 7
- **Container Runtime**: Podman
- **Container Orchestration**: AWS ECS Fargate
- **Load Balancing**: Application Load Balancer
- **Secrets Management**: AWS Secrets Manager
- **Logging**: CloudWatch Logs

## Local Development

### Prerequisites
- Node.js 22+
- Podman & podman-compose
- MongoDB (or use podman-compose)
- Make (for using Makefile commands)

### Quick Start

1. **Install dependencies:**
```bash
make install
```

2. **Start all services with Podman Compose:**
```bash
make deploy-local
```

3. **Access the application:**
- Frontend: http://localhost:80
- Backend API: http://localhost:3000
- Auth Service: http://localhost:3001
- Product Service: http://localhost:3002
- Cart Service: http://localhost:3003
- Order Service: http://localhost:3004

### Makefile Commands

View all available commands:
```bash
make help
```

Common commands:
```bash
make install        # Install dependencies
make validate       # Run tests and linting
make build          # Build all container images
make deploy-local   # Start local deployment
make stop-local     # Stop local deployment
make logs-local     # View logs
make deploy-aws     # Deploy to AWS
make clean          # Clean up local resources
```
- Auth Service: http://localhost:3001
- Product Service: http://localhost:3002
- Cart Service: http://localhost:3003
- Order Service: http://localhost:3004

### Development Mode (Individual Services)

**Start MongoDB:**
```bash
podman run -d -p 27017:27017 mongo:7
```

**Start each service individually:**
```bash
npm run dev:backend    # Port 3000
npm run dev:frontend   # Port 5173
```

## Building for Production

### Build Container Images

Using Makefile:
```bash
make build              # Build all images
make build-backend      # Build backend only
make build-frontend     # Build frontend only
```

Or manually with Podman:
```bash
# Build backend
cd express-app && podman build -t shopping-cart-backend .

# Build frontend
cd ../react-app && podman build -t shopping-cart-frontend .
```

## AWS Deployment

### Prerequisites
- AWS CLI configured with appropriate credentials
- MongoDB Atlas account (or AWS DocumentDB)
- Podman installed
- AWS account with permissions for:
  - ECR (Elastic Container Registry)
  - ECS (Elastic Container Service)
  - CloudFormation
  - VPC, ALB, CloudWatch
  - Secrets Manager

### Automated Deployment

1. **Set environment variables:**
```bash
export AWS_REGION=us-east-1
export MONGODB_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/shopping-cart"
```

2. **Run deployment:**
```bash
make deploy-aws
```

Or using the script directly:
```bash
cd infrastructure
chmod +x deploy.sh
./deploy.sh
```

The script will:
- Create ECR repositories for backend and frontend
- Build and push Podman images to ECR
- Deploy CloudFormation stack with:
  - VPC with public/private subnets
  - Application Load Balancer
  - ECS Fargate cluster
  - Security groups
  - CloudWatch logs
- Output the ALB URL for accessing the application

### Manual Deployment Steps

**1. Create ECR repositories:**
```bash
aws ecr create-repository --repository-name shopping-cart-backend --region us-east-1
aws ecr create-repository --repository-name shopping-cart-frontend --region us-east-1
```

**2. Login to ECR:**
```bash
aws ecr get-login-password --region us-east-1 | \
  podman login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
```

**3. Build and push images:**
```bash
# Backend
podman build -t shopping-cart-backend express-app
podman tag shopping-cart-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/shopping-cart-backend:latest
podman push <account-id>.dkr.ecr.us-east-1.amazonaws.com/shopping-cart-backend:latest

# Frontend
podman build -t shopping-cart-frontend react-app
podman tag shopping-cart-frontend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/shopping-cart-frontend:latest
podman push <account-id>.dkr.ecr.us-east-1.amazonaws.com/shopping-cart-frontend:latest
```

**4. Deploy CloudFormation stack:**
```bash
aws cloudformation deploy \
  --template-file infrastructure/cloudformation-ecs.yaml \
  --stack-name shopping-cart-stack \
  --parameter-overrides MongoDBConnectionString="$MONGODB_URI" \
  --capabilities CAPABILITY_IAM \
  --region us-east-1
```

**5. Get the ALB URL:**
```bash
aws cloudformation describe-stacks \
  --stack-name shopping-cart-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerURL`].OutputValue' \
  --output text \
  --region us-east-1
```

## API Endpoints

### Auth Service (`/api/auth`)
- `POST /register` - Register new user
  ```json
  { "email": "user@example.com", "password": "password", "name": "John Doe" }
  ```
- `POST /login` - Login user
  ```json
  { "email": "user@example.com", "password": "password" }
  ```
- `POST /verify` - Verify JWT token (requires Authorization header)

### Product Service (`/api/products`)
- `GET /products` - List all products (supports `?category=` and `?search=`)
- `GET /products/:id` - Get product details
- `POST /products` - Create product (admin)
- `PUT /products/:id` - Update product (admin)
- `PATCH /products/:id/stock` - Update stock quantity

### Cart Service (`/api/cart`) - Requires Authentication
- `GET /cart` - Get user's cart
- `POST /cart/items` - Add item to cart
  ```json
  { "productId": "...", "quantity": 1, "price": 99.99 }
  ```
- `PUT /cart/items/:productId` - Update item quantity
  ```json
  { "quantity": 2 }
  ```
- `DELETE /cart/items/:productId` - Remove item from cart
- `DELETE /cart` - Clear entire cart

### Order Service (`/api/orders`) - Requires Authentication
- `POST /orders` - Create order from cart
  ```json
  {
    "items": [...],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "City",
      "state": "ST",
      "zip": "12345",
      "country": "US"
    }
  }
  ```
- `GET /orders` - List user's orders
- `GET /orders/:id` - Get order details
- `PATCH /orders/:id/status` - Update order status

## Security Features

- **Authentication**: JWT-based with 7-day expiration
- **Password Security**: bcrypt hashing with salt rounds
- **HTTP Security**: Helmet.js for security headers
- **Rate Limiting**: 100 requests per 15 minutes on API Gateway
- **CORS**: Configured for cross-origin requests
- **Secrets Management**: AWS Secrets Manager for sensitive data
- **Network Security**: VPC with public/private subnets
- **Access Control**: Security groups for service isolation

## Scalability Features

- **Auto-scaling**: ECS Fargate with CPU/memory-based scaling
- **Load Balancing**: Application Load Balancer with health checks
- **Stateless Design**: All services are stateless for horizontal scaling
- **Connection Pooling**: MongoDB connection pooling
- **Health Checks**: Container and ALB health checks

## Monitoring & Logging

- **CloudWatch Logs**: All services log to `/ecs/shopping-cart`
- **Container Health Checks**: HTTP health endpoints on all services
- **ALB Health Checks**: Target group health monitoring
- **CloudWatch Metrics**: ECS task and service metrics
- **Log Retention**: 7 days (configurable)

## Cost Optimization

- **Fargate Spot**: 80% of capacity uses Spot instances
- **Right-sizing**: Minimal container resources (256 CPU, 512 MB memory)
- **Log Retention**: 7-day retention to reduce storage costs
- **Auto-scaling**: Scale down during low traffic periods

## Testing the Application

### Seed Sample Products

```bash
make seed
```

Or manually:
```bash
cd express-app && npm run seed
```

This will add 12 sample products with images including:
- Electronics (laptops, phones, headphones, keyboards, etc.)
- Furniture (office chairs, standing desks, lamps)

### Add Sample Products

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": 999.99,
    "stock": 10,
    "category": "Electronics",
    "imageUrl": "https://example.com/laptop.jpg"
  }'
```

### Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Login and Get Token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Troubleshooting

### Services Not Connecting
- **Check security groups**: Ensure ECS security group allows traffic from ALB
- **CloudWatch logs**: Check `/ecs/shopping-cart` for errors
- **Health checks**: Verify `/health` endpoint responds

### Database Connection Issues
- **MongoDB URI**: Verify connection string in Secrets Manager
- **Network access**: Ensure MongoDB Atlas IP whitelist includes ECS task IPs
- **Credentials**: Check username/password in connection string

### Container Health Check Failures
- **Logs**: Check CloudWatch logs for startup errors
- **Health endpoint**: Verify `/health` endpoint responds
- **Start period**: Increase `startPeriod` in task definition if needed
- **Resources**: Ensure sufficient CPU/memory allocation

### Local Development Issues
- **Port conflicts**: Ensure ports 80, 3000 are available
- **MongoDB**: Verify MongoDB is running on port 27017
- **Dependencies**: Run `npm install` in root, express-app, and react-app directories

### Deployment Failures
- **ECR permissions**: Verify IAM permissions for ECR push
- **CloudFormation**: Check stack events for detailed error messages
- **Secrets**: Ensure MongoDB URI is set in environment variable
- **Quotas**: Check AWS service quotas for ECS, VPC, etc.

## Project Structure

```
fullstack-demo/
├── express-app/       # Express backend
│   ├── src/
│   │   ├── models/    # Database models
│   │   │   └── index.js
│   │   ├── routes/    # Route handlers
│   │   │   ├── auth.js
│   │   │   ├── products.js
│   │   │   ├── cart.js
│   │   │   └── orders.js
│   │   ├── middleware/  # Middleware functions
│   │   │   └── auth.js
│   │   ├── index.js   # Main application entry
│   │   └── seed.js    # Database seeding script
│   ├── Dockerfile
│   └── package.json
├── react-app/         # React frontend
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── infrastructure/
│   ├── compose.yaml   # Podman Compose configuration
│   ├── cloudformation-ecs.yaml  # AWS infrastructure
│   └── deploy.sh      # Deployment script
├── Makefile           # Build and deployment automation
├── package.json       # Root package.json with workspaces
└── README.md
```

## License

MIT
