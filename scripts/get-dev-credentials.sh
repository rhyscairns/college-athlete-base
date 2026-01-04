#!/bin/bash

# Script to retrieve development environment credentials for local development
# This helps developers quickly get the connection strings they need

set -e

echo "🔐 Retrieving Development Environment Credentials"
echo "=================================================="
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    echo "   Visit: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ jq is not installed. Please install it first."
    echo "   macOS: brew install jq"
    echo "   Linux: sudo apt-get install jq"
    exit 1
fi

# Check AWS credentials
echo "🔍 Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured or invalid."
    echo "   Run: aws configure"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "✅ Connected to AWS Account: $ACCOUNT_ID"
echo ""

# Get database credentials from Secrets Manager
echo "📦 Retrieving database credentials from Secrets Manager..."
DB_SECRET=$(aws secretsmanager get-secret-value \
    --secret-id development/college-athlete-base/db-credentials \
    --query SecretString \
    --output text 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "❌ Failed to retrieve database credentials."
    echo "   Make sure the development environment is deployed."
    echo "   Run: cd infrastructure && npm run deploy:dev"
    exit 1
fi

DB_USERNAME=$(echo $DB_SECRET | jq -r '.username')
DB_PASSWORD=$(echo $DB_SECRET | jq -r '.password')
echo "✅ Database credentials retrieved"
echo ""

# Get stack outputs
echo "📦 Retrieving infrastructure endpoints..."
STACK_OUTPUTS=$(aws cloudformation describe-stacks \
    --stack-name DevStack \
    --query 'Stacks[0].Outputs' \
    --output json 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "❌ Failed to retrieve stack outputs."
    echo "   Make sure the DevStack is deployed."
    echo "   Run: cd infrastructure && npm run deploy:dev"
    exit 1
fi

DB_ENDPOINT=$(echo $STACK_OUTPUTS | jq -r '.[] | select(.OutputKey=="DatabaseEndpoint") | .OutputValue')
REDIS_ENDPOINT=$(echo $STACK_OUTPUTS | jq -r '.[] | select(.OutputKey=="RedisEndpoint") | .OutputValue')
SERVICE_URL=$(echo $STACK_OUTPUTS | jq -r '.[] | select(.OutputKey=="ServiceURL") | .OutputValue')

echo "✅ Infrastructure endpoints retrieved"
echo ""

# Display the information
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Development Environment Connection Details"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Service URL:"
echo "   $SERVICE_URL"
echo ""
echo "🗄️  Database Connection:"
echo "   Host:     $DB_ENDPOINT"
echo "   Port:     5432"
echo "   Database: college_athlete_base"
echo "   Username: $DB_USERNAME"
echo "   Password: $DB_PASSWORD"
echo ""
echo "📝 Database URL (for .env.local):"
echo "   DATABASE_URL=postgresql://$DB_USERNAME:$DB_PASSWORD@$DB_ENDPOINT:5432/college_athlete_base"
echo ""
echo "🔴 Redis Connection:"
echo "   Endpoint: $REDIS_ENDPOINT"
echo ""
echo "📝 Redis URL (for .env.local):"
echo "   REDIS_URL=redis://$REDIS_ENDPOINT"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Offer to create .env.local file
echo "📝 Would you like to create/update your .env.local file? (y/n)"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    ENV_FILE=".env.local"
    
    cat > $ENV_FILE <<EOF
# Environment
NODE_ENV=development
ENVIRONMENT=development

# Database (from AWS RDS - development environment)
DATABASE_URL=postgresql://$DB_USERNAME:$DB_PASSWORD@$DB_ENDPOINT:5432/college_athlete_base

# Redis (from AWS ElastiCache - development environment)
REDIS_URL=redis://$REDIS_ENDPOINT

# Application Settings
LOG_LEVEL=debug
PORT=3000

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000

# Generated on: $(date)
EOF

    echo "✅ Created $ENV_FILE"
    echo ""
    echo "⚠️  IMPORTANT: Never commit this file to Git!"
    echo "   It's already in .gitignore, but be careful with git add ."
    echo ""
fi

# Check network connectivity
echo "🔍 Testing network connectivity..."
echo ""

# Test database connection
echo -n "   Database ($DB_ENDPOINT:5432)... "
if nc -z -w 5 $DB_ENDPOINT 5432 2>/dev/null; then
    echo "✅ Reachable"
else
    echo "❌ Not reachable"
    echo ""
    echo "⚠️  You may need to:"
    echo "   1. Connect to VPN"
    echo "   2. Add your IP to security groups"
    echo "   3. Use SSH tunnel via bastion host"
    echo ""
    echo "   See docs/LOCAL_DEVELOPMENT_SETUP.md for details"
fi

# Test Redis connection
REDIS_HOST=$(echo $REDIS_ENDPOINT | cut -d':' -f1)
REDIS_PORT=$(echo $REDIS_ENDPOINT | cut -d':' -f2)

echo -n "   Redis ($REDIS_HOST:$REDIS_PORT)... "
if nc -z -w 5 $REDIS_HOST $REDIS_PORT 2>/dev/null; then
    echo "✅ Reachable"
else
    echo "❌ Not reachable"
    echo ""
    echo "⚠️  You may need to:"
    echo "   1. Connect to VPN"
    echo "   2. Add your IP to security groups"
    echo "   3. Use SSH tunnel via bastion host"
    echo ""
    echo "   See docs/LOCAL_DEVELOPMENT_SETUP.md for details"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Ensure network connectivity (VPN or security groups)"
echo "2. Run: npm install"
echo "3. Run: npm run dev"
echo "4. Visit: http://localhost:3000"
echo ""
echo "For detailed setup instructions, see:"
echo "   docs/LOCAL_DEVELOPMENT_SETUP.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
