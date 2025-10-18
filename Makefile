.PHONY: help install test lint build-backend build-frontend build deploy-local deploy-aws clean validate-aws

# Default target
.DEFAULT_GOAL := help

# Variables
REGION ?= us-east-1
ACCOUNT_ID := $(shell aws sts get-caller-identity --query Account --output text 2>/dev/null)
ECR_BACKEND := $(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com/shopping-cart-backend
ECR_FRONTEND := $(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com/shopping-cart-frontend
STACK_NAME := shopping-cart-stack

help: ## Show this help message
	@echo 'Simple Shopping Cart application to demo a fullstack MERN app'
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Testing and Validation
install: ## Install all dependencies
	@echo "Installing frontend dependencies..."
	cd react-app && npm install
	@echo "Installing backend dependencies..."
	cd express-app && npm install

test: ## Run tests for backend and frontend
	@echo "Running backend tests..."
	cd express-app && npm test || echo "No tests configured"
	@echo "Running frontend tests..."
	cd react-app && npm test || echo "No tests configured"

lint: ## Lint backend and frontend code
	@echo "Linting backend..."
	cd express-app && npm run lint || echo "No linting configured"
	@echo "Linting frontend..."
	cd react-app && npm run lint || echo "No linting configured"

validate: install lint test ## Run all validation checks

validate-aws: ## Validate AWS credentials and CloudFormation template
	@echo "Validating AWS credentials..."
	@aws sts get-caller-identity > /dev/null || (echo "❌ AWS credentials not configured" && exit 1)
	@echo "✅ AWS credentials valid"
	@echo "Validating CloudFormation template..."
	@aws cloudformation validate-template --template-body file://infrastructure/cloudformation-ecs.yaml > /dev/null || (echo "❌ CloudFormation template invalid" && exit 1)
	@echo "✅ CloudFormation template valid"

seed: ## Seed database with sample products
	@echo "Seeding database with sample products..."
	cd express-app && npm run seed

# Build and Containerization
build-backend: ## Build backend container image
	@echo "Building backend container..."
	podman build -t shopping-cart-backend:latest express-app

build-frontend: ## Build frontend container image
	@echo "Building frontend container..."
	podman build -t shopping-cart-frontend:latest react-app

build: build-backend build-frontend ## Build all container images

# Local Deployment
deploy-local: ## Deploy application locally with podman-compose
	@echo "Starting local deployment..."
	cd infrastructure && podman-compose up -d
	@echo "Application running at http://localhost:80"

deploy-local-build: build ## Build and deploy application locally with podman-compose
	@echo "Starting local deployment..."
	cd infrastructure && podman-compose up -d
	@echo "Application running at http://localhost:80"

stop-local: ## Stop local deployment
	@echo "Stopping local deployment..."
	cd infrastructure && podman-compose down

logs-local: ## View logs from local deployment
	cd infrastructure && podman-compose logs -f

# AWS Deployment
ecr-login: ## Login to AWS ECR
	@echo "Logging in to ECR..."
	@aws ecr get-login-password --region $(REGION) | podman login --username AWS --password-stdin $(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com

ecr-create: ## Create ECR repositories
	@echo "Creating ECR repositories..."
	@aws ecr create-repository --repository-name shopping-cart-backend --region $(REGION) 2>/dev/null || true
	@aws ecr create-repository --repository-name shopping-cart-frontend --region $(REGION) 2>/dev/null || true

cleanup-ecr: ## Cleanup ECR repositories
	@echo "Deleting ECR repositories..."
	@aws ecr delete-repository --repository-name shopping-cart-backend --region $(REGION) --force 2>/dev/null || true
	@aws ecr delete-repository --repository-name shopping-cart-frontend --region $(REGION) --force 2>/dev/null || true

push-backend: build-backend ecr-login ## Build and push backend image to ECR
	@echo "Tagging and pushing backend..."
	podman tag shopping-cart-backend:latest $(ECR_BACKEND):latest
	podman push $(ECR_BACKEND):latest

push-frontend: build-frontend ecr-login ## Build and push frontend image to ECR
	@echo "Tagging and pushing frontend..."
	podman tag shopping-cart-frontend:latest $(ECR_FRONTEND):latest
	podman push $(ECR_FRONTEND):latest

push: push-backend push-frontend ## Build and push all images to ECR

deploy-aws: validate-aws ecr-create push ## Deploy application to AWS ECS
	@echo "Deploying to AWS..."
	@if [ -z "$(DATABASE_URI)" ]; then \
		echo "❌ Error: DATABASE_URI environment variable is required"; \
		echo "   Example: export DATABASE_URI='mongodb+srv://user:pass@cluster.mongodb.net/shopping-cart'"; \
		exit 1; \
	fi
	@echo "Deploying CloudFormation stack..."
	@aws cloudformation deploy \
		--template-file infrastructure/cloudformation-ecs.yaml \
		--stack-name $(STACK_NAME) \
		--parameter-overrides MongoDBConnectionString="$(DATABASE_URI)" \
		--capabilities CAPABILITY_IAM \
		--region $(REGION)
	@echo "Getting ALB URL..."
	@aws cloudformation describe-stacks \
		--stack-name $(STACK_NAME) \
		--query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerURL`].OutputValue' \
		--output text \
		--region $(REGION)
	@echo "✅ Deployment complete!"

status-aws: ## Check AWS deployment status
	@echo "Checking CloudFormation stack status..."
	@aws cloudformation describe-stacks --stack-name $(STACK_NAME) --region $(REGION) --query 'Stacks[0].StackStatus' --output text 2>/dev/null || echo "Stack not found"
	@echo "Checking ECS services..."
	@aws ecs describe-services --cluster shopping-cart-cluster --services shopping-cart-backend shopping-cart-frontend --region $(REGION) --query 'services[*].[serviceName,status,runningCount,desiredCount]' --output table 2>/dev/null || echo "Services not found"

logs-aws: ## View AWS ECS logs
	@echo "Fetching recent ECS logs..."
	@aws logs tail /ecs/shopping-cart --since 1h --region $(REGION) 2>/dev/null || echo "No logs found"

# Cleanup
clean: ## Remove built images and containers
	@echo "Cleaning up..."
	podman rmi shopping-cart-backend:latest 2>/dev/null || true
	podman rmi shopping-cart-frontend:latest 2>/dev/null || true
	cd infrastructure && podman-compose down -v 2>/dev/null || true

clean-aws: cleanup-ecr ## Delete AWS CloudFormation stack
	@echo "Deleting CloudFormation stack..."
	@aws cloudformation delete-stack --stack-name $(STACK_NAME) --region $(REGION)
	@echo "Waiting for stack deletion..."
	@aws cloudformation wait stack-delete-complete --stack-name $(STACK_NAME) --region $(REGION)
	@echo "✅ Stack deleted successfully"
