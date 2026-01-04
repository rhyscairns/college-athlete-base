#!/bin/bash

# Script to request SSL certificates for both environments
# This script requests certificates via AWS ACM and outputs the ARNs

set -e

echo "🔐 Setting up SSL Certificates for College Athlete Base"
echo "========================================================"
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

# Set region
REGION=${AWS_REGION:-us-east-1}
echo "📍 Using region: $REGION"
echo ""

# Request Development Certificate
echo "📝 Requesting certificate for collegeathletebase-dev.com..."
DEV_CERT_ARN=$(aws acm request-certificate \
    --domain-name collegeathletebase-dev.com \
    --subject-alternative-names "*.collegeathletebase-dev.com" \
    --validation-method DNS \
    --region $REGION \
    --query CertificateArn \
    --output text)

echo "✅ Development certificate requested: $DEV_CERT_ARN"
echo ""

# Request Production Certificate
echo "📝 Requesting certificate for collegeathletebase.com..."
PROD_CERT_ARN=$(aws acm request-certificate \
    --domain-name collegeathletebase.com \
    --subject-alternative-names "*.collegeathletebase.com" \
    --validation-method DNS \
    --region $REGION \
    --query CertificateArn \
    --output text)

echo "✅ Production certificate requested: $PROD_CERT_ARN"
echo ""

# Get validation records for development
echo "📋 DNS Validation Records for Development:"
echo "==========================================="
aws acm describe-certificate \
    --certificate-arn $DEV_CERT_ARN \
    --region $REGION \
    --query 'Certificate.DomainValidationOptions[0].ResourceRecord' \
    --output table

echo ""

# Get validation records for production
echo "📋 DNS Validation Records for Production:"
echo "=========================================="
aws acm describe-certificate \
    --certificate-arn $PROD_CERT_ARN \
    --region $REGION \
    --query 'Certificate.DomainValidationOptions[0].ResourceRecord' \
    --output table

echo ""
echo "📝 Next Steps:"
echo "=============="
echo "1. Add the DNS validation records to your Route53 hosted zones"
echo "2. Wait for certificate validation (usually 5-30 minutes)"
echo "3. Update your .env file with these certificate ARNs:"
echo ""
echo "   DEV_CERTIFICATE_ARN=$DEV_CERT_ARN"
echo "   PROD_CERTIFICATE_ARN=$PROD_CERT_ARN"
echo ""
echo "4. Check validation status with:"
echo "   aws acm describe-certificate --certificate-arn $DEV_CERT_ARN --region $REGION"
echo "   aws acm describe-certificate --certificate-arn $PROD_CERT_ARN --region $REGION"
echo ""
