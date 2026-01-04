#!/bin/bash

# Script to add DNS validation records to Route53 for ACM certificates
# This automates the certificate validation process

set -e

echo "✅ Validating SSL Certificates"
echo "==============================="
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ jq is not installed. Please install it first (brew install jq)."
    exit 1
fi

# Load environment variables
if [ -f ../.env ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
else
    echo "❌ .env file not found. Please create it first."
    exit 1
fi

# Check required variables
if [ -z "$DEV_CERTIFICATE_ARN" ] || [ -z "$PROD_CERTIFICATE_ARN" ] || \
   [ -z "$DEV_HOSTED_ZONE_ID" ] || [ -z "$PROD_HOSTED_ZONE_ID" ]; then
    echo "❌ Missing required environment variables in .env file"
    exit 1
fi

REGION=${AWS_REGION:-us-east-1}

# Function to add validation record
add_validation_record() {
    local CERT_ARN=$1
    local ZONE_ID=$2
    local ENV_NAME=$3
    
    echo "📝 Processing $ENV_NAME certificate validation..."
    
    # Get validation record
    VALIDATION_RECORD=$(aws acm describe-certificate \
        --certificate-arn $CERT_ARN \
        --region $REGION \
        --query 'Certificate.DomainValidationOptions[0].ResourceRecord' \
        --output json)
    
    RECORD_NAME=$(echo $VALIDATION_RECORD | jq -r '.Name')
    RECORD_VALUE=$(echo $VALIDATION_RECORD | jq -r '.Value')
    RECORD_TYPE=$(echo $VALIDATION_RECORD | jq -r '.Type')
    
    # Create change batch JSON
    CHANGE_BATCH=$(cat <<EOF
{
    "Changes": [{
        "Action": "UPSERT",
        "ResourceRecordSet": {
            "Name": "$RECORD_NAME",
            "Type": "$RECORD_TYPE",
            "TTL": 300,
            "ResourceRecords": [{"Value": "$RECORD_VALUE"}]
        }
    }]
}
EOF
)
    
    # Add record to Route53
    aws route53 change-resource-record-sets \
        --hosted-zone-id $ZONE_ID \
        --change-batch "$CHANGE_BATCH" \
        --output text > /dev/null
    
    echo "✅ Validation record added for $ENV_NAME"
}

# Add validation records
add_validation_record $DEV_CERTIFICATE_ARN $DEV_HOSTED_ZONE_ID "Development"
add_validation_record $PROD_CERTIFICATE_ARN $PROD_HOSTED_ZONE_ID "Production"

echo ""
echo "⏳ Waiting for certificate validation..."
echo "This may take 5-30 minutes. You can check status with:"
echo ""
echo "Development:"
echo "  aws acm describe-certificate --certificate-arn $DEV_CERTIFICATE_ARN --region $REGION --query 'Certificate.Status'"
echo ""
echo "Production:"
echo "  aws acm describe-certificate --certificate-arn $PROD_CERTIFICATE_ARN --region $REGION --query 'Certificate.Status'"
echo ""
echo "Once both show 'ISSUED', you can proceed with CDK deployment."
echo ""
