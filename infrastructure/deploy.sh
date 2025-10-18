#!/bin/bash
set -e

REGION=${AWS_REGION:-us-east-1}
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
STACK_NAME="shopping-cart-stack"
BUILD_PLATFORM=${BUILD_PLATFORM:-"--platform linux/amd64"}

echo "Building and pushing docker images..."

# Create ECR repositories
aws ecr create-repository --repository-name shopping-cart-backend --region $REGION 2>/dev/null || true
aws ecr create-repository --repository-name shopping-cart-frontend --region $REGION 2>/dev/null || true

# Login to ECR
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Build and push backend
echo "Building backend..."
docker build ${BUILD_PLATFORM} -t shopping-cart-backend:latest ../express-app
docker tag shopping-cart-backend:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/shopping-cart-backend:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/shopping-cart-backend:latest

# Build and push frontend
echo "Building frontend..."
docker build ${BUILD_PLATFORM} -t shopping-cart-frontend:latest ../react-app
docker tag shopping-cart-frontend:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/shopping-cart-frontend:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/shopping-cart-frontend:latest

echo "Deploying CloudFormation stack..."
aws cloudformation deploy \
  --template-file cloudformation-ecs.yaml \
  --stack-name $STACK_NAME \
  --parameter-overrides MongoDBConnectionString="$DATABASE_URI" \
  --capabilities CAPABILITY_IAM \
  --region $REGION

echo "Getting ALB URL..."
aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerURL`].OutputValue' \
  --output text \
  --region $REGION

echo "Deployment complete!"
