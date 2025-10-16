#!/bin/bash
set -e

REGION=${AWS_REGION:-us-east-1}
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
STACK_NAME="shopping-cart-stack"

echo "Building and pushing Podman images..."

# Create ECR repositories
aws ecr create-repository --repository-name shopping-cart-backend --region $REGION 2>/dev/null || true
aws ecr create-repository --repository-name shopping-cart-frontend --region $REGION 2>/dev/null || true

# Login to ECR
aws ecr get-login-password --region $REGION | podman login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Build and push backend
echo "Building backend..."
podman build -t shopping-cart-backend:latest ../express-app
podman tag shopping-cart-backend:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/shopping-cart-backend:latest
podman push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/shopping-cart-backend:latest

# Build and push frontend
echo "Building frontend..."
podman build -t shopping-cart-frontend:latest ../react-app
podman tag shopping-cart-frontend:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/shopping-cart-frontend:latest
podman push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/shopping-cart-frontend:latest

echo "Deploying CloudFormation stack..."
aws cloudformation deploy \
  --template-file cloudformation-ecs.yaml \
  --stack-name $STACK_NAME \
  --parameter-overrides MongoDBConnectionString="$MONGODB_URI" \
  --capabilities CAPABILITY_IAM \
  --region $REGION

echo "Getting ALB URL..."
aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerURL`].OutputValue' \
  --output text \
  --region $REGION

echo "Deployment complete!"
